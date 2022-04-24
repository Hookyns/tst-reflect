import * as ts                      from "typescript";
import { createValueExpression }    from "../utils/createValueExpression";
import { TransformerTypeReference } from "../declarations";
import type { TransformerContext }  from "../contexts/TransformerContext";
import type { MetadataLibrary }     from "./MetadataLibrary";

export class MetadataFactory
{
	private readonly typeFactoryIdentifier: ts.Identifier;
	// private readonly metadataIdentifier: ts.Identifier;
	
	constructor(private readonly metadata: MetadataLibrary, private readonly context: TransformerContext)
	{
		this.typeFactoryIdentifier = ts.factory.createIdentifier("__τ"); // TODO: Load from config! reflection.typeFactory
		// this.metadataIdentifier = ts.factory.createIdentifier("__Ω");
		
		// TODO: Create `import { Metadata } from "@rtti/abstract";` (import or require based on tsconfig) in each file and generate `Metadata.resolveType(id)` in place of getType<T>() calls.
	}

	/**
	 * Create runtime Type resolver.
	 * @param reference
	 */
	createTypeResolver(reference: TransformerTypeReference): ts.Expression
	{
		return ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				this.typeFactoryIdentifier,
				ts.factory.createIdentifier("resolveType")
			),
			undefined,
			[typeof reference === "object" ? createValueExpression(reference) : ts.factory.createNumericLiteral(reference)]
		);
	}

	/**
	 * Generate import of the metadata type library.
	 * @param sourceFile SourceFile required to generate correct relative path.
	 */
	createTypeLibImport(sourceFile: ts.SourceFile): ts.Statement
	{
		const path = this.metadata.writer.getRequireRelativePath(this.context.currentSourceFileContext?.context!, sourceFile.fileName);
		
		if (this.context.config.esmModule) {
			return ts.factory.createImportDeclaration(
				undefined,
				undefined,
				ts.factory.createImportClause(
					false, 
					undefined,
					undefined
				),
				ts.factory.createStringLiteral(path)
			);
		}
		else {
			return ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(
					ts.factory.createIdentifier("require"),
					undefined,
					[ts.factory.createStringLiteral(path)]
				)
			);
			// ts.factory.createVariableStatement(
			// 	undefined,
			// 	ts.factory.createVariableDeclarationList(
			// 		[ts.factory.createVariableDeclaration(
			// 			reflectionMetaIdentifier,
			// 			// factory.createIdentifier("___tst_reflection_meta"),
			// 			undefined,
			// 			undefined,
			// 			ts.factory.createCallExpression(
			// 				ts.factory.createIdentifier("require"),
			// 				undefined,
			// 				[ts.factory.createStringLiteral(metaLibImportPath)]
			// 			)
			// 		)],
			// 		ts.NodeFlags.Const
			// 	)
			// )
		}
	}
}