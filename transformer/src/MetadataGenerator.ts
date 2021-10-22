import * as ts               from "typescript";
import * as fs               from "fs";
import { nodeGenerator }     from "./NodeGenerator";
import { GET_TYPE_FNC_NAME } from "tst-reflect/reflect";

function replaceGetTypeIdentifiersVisitor(getTypeIdentifier: ts.Identifier, transformationContext: ts.TransformationContext): ts.Visitor
{
	return node => {
		if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
		{
			return ts.factory.updateCallExpression(
				node,
				getTypeIdentifier,
				node.typeArguments,
				ts.visitNodes(node.arguments, replaceGetTypeIdentifiersVisitor(getTypeIdentifier, transformationContext))
			);
		}

		return ts.visitEachChild(node, replaceGetTypeIdentifiersVisitor(getTypeIdentifier, transformationContext), transformationContext);
	};


	// return ts.visitEachChild(properties, node => {
	// 	if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
	// 	{
	// 		arguments = ts.visitNodes(node.arguments, )
	//		
	// 		return ts.factory.updateCallExpression(
	// 			node, 
	// 			getTypeIdentifier, 
	// 			node.typeArguments,
	// 			replaceGetTypeIdentifiers(node.arguments, getTypeIdentifier, transformationContext) as NodeArray<Expression>
	// 		);
	// 	}
	//
	// 	return replaceGetTypeIdentifiers(node, getTypeIdentifier, transformationContext);
	// }, transformationContext)
}

export default class MetadataGenerator
{
	private _getTypeIdentifier?: ts.Identifier;
	private _tsPrinter?: ts.Printer;
	private _metadataFilePath: string;

	/**
	 * Construct metadata library generator.
	 */
	constructor(metadataFilePath: string)
	{
		this._metadataFilePath = metadataFilePath;
	}

	/**
	 * Create or truncate metadata library file and prepare library stuff.
	 */
	public recreateLibFile()
	{
		this._tsPrinter = ts.createPrinter();
		const { statement, getTypeIdentifier } = nodeGenerator.createGetTypeImport();
		this._getTypeIdentifier = getTypeIdentifier;

		// SourceFile with import {getType} from "tst-reflect"
		const initialSourceFile = ts.factory.createSourceFile(
			[
				statement
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);

		const source = this._tsPrinter.printFile(initialSourceFile);
		fs.writeFileSync(this._metadataFilePath, source, { encoding: "utf8", flag: "w" });
	}

	/**
	 * Add types properties into metadata library.
	 * @param typesProperties
	 * @param typesCtors
	 * @param transformationContext
	 */
	addProperties(typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>, typesCtors: Set<ts.EntityName | ts.DeclarationName>, transformationContext: ts.TransformationContext)
	{
		if (!this._getTypeIdentifier || !this._tsPrinter)
		{
			throw new Error("TransformerContext has not been initiated yet.");
		}

		const propertiesStatements: Array<ts.Statement> = [];

		for (let ctor of typesCtors)
		{
			propertiesStatements.push(nodeGenerator.createCtorImport(ctor));
		}

		for (let [typeId, properties] of typesProperties)
		{
			// Replace all getType identifier by metadata getType identifier
			properties = ts.visitEachChild(
				properties,
				replaceGetTypeIdentifiersVisitor(this._getTypeIdentifier, transformationContext),
				transformationContext
			) as ts.ObjectLiteralExpression;
			// properties = replaceGetTypeIdentifiers(properties, this._getTypeIdentifier, transformationContext) as ts.ObjectLiteralExpression;

			propertiesStatements.push(ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(this._getTypeIdentifier, [], [properties, ts.factory.createNumericLiteral(typeId)])
			));
		}

		const sourceFile = ts.factory.createSourceFile(
			propertiesStatements,
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
		const source = this._tsPrinter.printFile(sourceFile);
		fs.appendFileSync(this._metadataFilePath, source, "utf8");
	}
}