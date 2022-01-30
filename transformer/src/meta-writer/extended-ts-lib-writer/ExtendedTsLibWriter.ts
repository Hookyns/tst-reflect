import * as fs                        from "fs";
import * as path                      from "path";
import { GET_TYPE_FNC_NAME }          from "tst-reflect";
import { Expression }                 from "typescript";
import TransformerContext             from "../../contexts/TransformerContext";
import {
	BaseMetaWriter,
	MetaWriterType
}                                     from "../BaseMetaWriter";
import { ExtendedTsLibNodeGenerator } from "./ExtendedTsLibNodeGenerator";
import ts = require("typescript");

export class ExtendedTsLibWriter extends BaseMetaWriter
{
	protected type: MetaWriterType = 'extended:ts:libfile';

	public newGetTypeIdentifier: ts.Identifier = ts.factory.createIdentifier('_tst_reflect_set');

	protected metaSourceFile: ts.SourceFile;

	public nodeGenerator: ExtendedTsLibNodeGenerator;

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(metadataFilePath, context);

		this.nodeGenerator = new ExtendedTsLibNodeGenerator();
		this.metaSourceFile = this.getNewStubSourceFile();

		this.createBaseMeta();
	}

	public getNewStubSourceFile(): ts.SourceFile
	{
		if (!this.context.program)
		{
			throw new Error('[Extended Meta Lib] : Program is not attached to context?');
		}
		let sourcePath = path.resolve(path.dirname(__filename), '..', 'stubs', 'base-ts-lib-extended-stub.ts');
		if (sourcePath.includes('/dist/'))
		{
			sourcePath = sourcePath.replace('/dist/', '/src/');
		}

		const stubSrcContents = fs.readFileSync(sourcePath, 'utf-8');

		return ts.createSourceFile(
			this.metadataFilePath, stubSrcContents, ts.ScriptTarget.ES2015
		);
	}

	public createBaseMeta()
	{
		this.writeSourceFile([...this.metaSourceFile.statements]);

		this.logMessage(`Wrote lib file to ${this.metadataFilePath}`);
	}

	updateTypesForMetaLib(
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext
	)
	{
		const propertiesStatements: Array<ts.Statement> = [];

		// these are the require calls... which we don't want any more.
		// for (let ctor of typesCtors)
		// {
		// 	propertiesStatements.push(ts.factory.createExpressionStatement(ctor));
		// }


		for (let [typeId, properties] of typesProperties)
		{
			// Replace all getType identifier by metadata getType identifier
			const updatedProperties = ts.visitEachChild(
				properties,
				replaceGetTypeIdentifiersVisitor(this.newGetTypeIdentifier, transformationContext),
				transformationContext
			) as ts.ObjectLiteralExpression;
			// properties = replaceGetTypeIdentifiers(properties, this.newGetTypeIdentifier, transformationContext) as ts.ObjectLiteralExpression;

			propertiesStatements.push(ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(this.newGetTypeIdentifier, [], [ts.factory.createNumericLiteral(typeId), updatedProperties])
			));
		}

		return propertiesStatements;
	}

	/**
	 * Add types properties into metadata library.
	 * @param typesProperties
	 * @param typesCtors
	 * @param transformationContext
	 */
	addProperties(
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext
	)
	{

		this.metaSourceFile = ts.factory.updateSourceFile(
			this.metaSourceFile,
			this.propertyStatementsUpdated(
				this.updateTypesForMetaLib(typesProperties, typesCtors, transformationContext)
			),
			this.metaSourceFile.isDeclarationFile,
			this.metaSourceFile.referencedFiles,
			this.metaSourceFile.typeReferenceDirectives,
			this.metaSourceFile.hasNoDefaultLib,
			this.metaSourceFile.libReferenceDirectives,
		);

		const source = this.tsPrinter.printFile(this.metaSourceFile);

		fs.writeFileSync(this.metadataFilePath, source, "utf8");

		this.logMessage(`Wrote updated lib file to ${this.metadataFilePath}`);

		const pathParsed = path.parse(this.metaSourceFile.fileName);
		const transpilePath = this.metaSourceFile.fileName
			.replace('src/', 'dist/')
			.replace(pathParsed.base, pathParsed.name) + '.js';


		const res = ts.transpileModule(source, {
			fileName: transpilePath,
			reportDiagnostics: true,
		});

		if (res)
		{
			this.logMessage(`TRANSPILED: `, res);

			fs.writeFileSync(transpilePath, res.outputText, "utf8");
		}

	}

	private propertyStatementsUpdated(propertiesStatements: ts.Statement[])
	{
		const poppedExport = this.metaSourceFile.statements.slice(-1);

		return [
			...this.metaSourceFile.statements.slice(0, this.metaSourceFile.statements.length - 1),
			...propertiesStatements,
			...poppedExport,
		];
	}

	addLibImportToSourceFile(visitedNode: ts.SourceFile): ts.SourceFile
	{
		if (visitedNode.fileName.includes(this.metaSourceFile.fileName))
		{
			return visitedNode;
		}
		if (this.hasAddedMetaLibImport(visitedNode.fileName))
		{
			return visitedNode;
		}

		const relative = this.getRelativeMetaLibPath(visitedNode);

		this.logMessage(`Added lib import to source file:\n${visitedNode.fileName}\nRelative import path for lib: ${relative}`);

		this.addedMetaLibImport(visitedNode.fileName);

		return ts.factory.updateSourceFile(visitedNode, [
			...this.nodeGenerator.sourceFileMetaLibStatements(relative),
			...visitedNode.statements
		]);
	}
}


function replaceGetTypeIdentifiersVisitor(getTypeIdentifier: ts.Identifier, transformationContext: ts.TransformationContext): ts.Visitor
{
	return node => {
		if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
		{
			return ts.factory.updateCallExpression(
				node,
				getTypeIdentifier,
				node.typeArguments,
				ts.visitNodes(
					node.arguments,
					replaceGetTypeIdentifiersVisitor(getTypeIdentifier, transformationContext)
				)
			);
		}

		return ts.visitEachChild(node, replaceGetTypeIdentifiersVisitor(getTypeIdentifier, transformationContext), transformationContext);
	};
}
