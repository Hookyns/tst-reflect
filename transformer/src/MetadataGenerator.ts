import * as ts from "typescript";
import * as fs from "fs";

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
		this._getTypeIdentifier = ts.factory.createIdentifier("getType");

		// SourceFile with import {getType} from "tst-reflect"
		const initialSourceFile = ts.factory.createSourceFile([
				// const {getType} = require("tst-reflect");
				ts.factory.createVariableStatement(
					undefined,
					[
						ts.factory.createVariableDeclaration(
							ts.factory.createObjectBindingPattern([
								ts.factory.createBindingElement(
									undefined,
									undefined,
									this._getTypeIdentifier,
									undefined
								)
							]),
							undefined,
							undefined,
							ts.factory.createCallExpression(
								ts.factory.createIdentifier("require"),
								undefined,
								[
									ts.factory.createStringLiteral("tst-reflect")
								]
							)
						)
					])

				// import {getType} from "tst-reflect"
				// ts.factory.createImportDeclaration(
				// 	undefined,
				// 	undefined,
				// 	ts.factory.createImportClause(
				// 		false,
				// 		undefined,
				// 		ts.factory.createNamedImports([
				// 			ts.factory.createImportSpecifier(undefined, this._getTypeIdentifier!)
				// 		])
				// 	),
				// 	ts.factory.createStringLiteral("tst-reflect")
				// )
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);

		const source = this._tsPrinter.printFile(initialSourceFile);
		fs.writeFileSync(this._metadataFilePath, source, {encoding: "utf8", flag: "w"});
	}

	/**
	 * Add types properties into metadata library.
	 * @param typesProperties
	 */
	addTypesProperties(typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>)
	{
		if (!this._getTypeIdentifier || !this._tsPrinter)
		{
			throw new Error("TransformerContext has not been initiated yet.");
		}

		const propertiesStatements = [];

		for (let [typeId, properties] of typesProperties)
		{
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