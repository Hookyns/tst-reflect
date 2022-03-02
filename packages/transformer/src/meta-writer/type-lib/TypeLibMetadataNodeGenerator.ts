// import { createValueExpression }  from "../../createValueExpression";
// import { TypePropertiesSource }   from "../../declarations";
// import * as ts                    from "typescript";
// import { factory }                from "typescript";
// import { IMetadataNodeGenerator } from "../IMetadataNodeGenerator";
//
//
// export class TypeLibMetadataNodeGenerator implements IMetadataNodeGenerator
// {
// 	// private readonly identifier: ts.Identifier;
// 	//
// 	// constructor()
// 	// {
// 	// 	this.identifier = factory.createIdentifier("_ßr");
// 	// }
//
// 	/**
// 	 * Generated import statements which will be added to each source file
// 	 *
// 	 * @param {string} metaLibImportPath
// 	 * @returns {ts.Statement[]}
// 	 */
// 	sourceFileMetaLibStatements(metaLibImportPath?: string): ts.Statement[]
// 	{
// 		if (!metaLibImportPath)
// 		{
// 			return [];
// 		}
//		
// 		const reflectionMetaIdentifier = factory.createIdentifier("___tst_reflection_meta");
//
// 		return [
// 			factory.createVariableStatement(
// 				undefined,
// 				factory.createVariableDeclarationList(
// 					[factory.createVariableDeclaration(
// 						reflectionMetaIdentifier, 
// 						// factory.createIdentifier("___tst_reflection_meta"),
// 						undefined,
// 						undefined,
// 						factory.createCallExpression(
// 							factory.createIdentifier("require"),
// 							undefined,
// 							[factory.createStringLiteral(metaLibImportPath)]
// 						)
// 					)],
// 					ts.NodeFlags.Const
// 				)
// 			),
// 			factory.createVariableStatement(
// 				undefined,
// 				factory.createVariableDeclarationList(
// 					[factory.createVariableDeclaration(
// 						factory.createIdentifier("_tst_reflect_get"), // TODO: Store this identifier in field and use it in addDescriptionToStore, createDescriptionWithoutAddingToStore, getTypeFromStore etc.
// 						undefined,
// 						undefined,
// 						factory.createPropertyAccessExpression(
// 							reflectionMetaIdentifier, 
// 							// factory.createIdentifier("___tst_reflection_meta"),
// 							factory.createIdentifier("_tst_reflect_get")
// 						)
// 					)],
// 					ts.NodeFlags.Const
// 				)
// 			),
// 			factory.createVariableStatement(
// 				undefined,
// 				factory.createVariableDeclarationList(
// 					[factory.createVariableDeclaration(
// 						factory.createIdentifier("_tst_reflect_wrap"),
// 						undefined,
// 						undefined,
// 						factory.createPropertyAccessExpression(
// 							reflectionMetaIdentifier, 
// 							// factory.createIdentifier("___tst_reflection_meta"),
// 							factory.createIdentifier("_tst_reflect_wrap")
// 						)
// 					)],
// 					ts.NodeFlags.Const
// 				)
// 			)
// 		];
// 	}
//
// 	/**
// 	 * Generated method call which adds the generated source description of a node to the store
// 	 *
// 	 * @param {number} typeId
// 	 * @param {TypePropertiesSource} description
// 	 * @returns {ts.CallExpression}
// 	 */
// 	addDescriptionToStore(typeId: number, description: TypePropertiesSource): ts.CallExpression
// 	{
// 		return factory.createCallExpression(
// 			factory.createIdentifier("_tst_reflect_set"),
// 			undefined,
// 			[
// 				factory.createNumericLiteral(typeId),
// 				createValueExpression(description) as ts.ObjectLiteralExpression
// 			]
// 		);
// 	}
//
// 	/**
// 	 * Generated method call which creates a Type from a source description inline
// 	 *
// 	 * @param {TypePropertiesSource} description
// 	 * @returns {ts.CallExpression}
// 	 */
// 	createDescriptionWithoutAddingToStore(description: TypePropertiesSource): ts.CallExpression
// 	{
// 		return factory.createCallExpression(
// 			factory.createIdentifier("_tst_reflect_wrap"),
// 			undefined,
// 			[createValueExpression(description) as ts.ObjectLiteralExpression]
// 		);
// 	}
//
// 	/**
// 	 * Generated method call to get a type from the store by its id
// 	 *
// 	 * @param {number} typeId
// 	 * @returns {ts.CallExpression}
// 	 */
// 	getTypeFromStore(typeId: number): ts.CallExpression
// 	{
// 		return factory.createCallExpression(
// 			factory.createIdentifier("_tst_reflect_get"),
// 			undefined,
// 			[factory.createNumericLiteral(typeId)]
// 		);
// 	}
//
// 	/**
// 	 * Generated method call to get a type from the store by its id, but is wrapped in a function.
// 	 *
// 	 * @param {number} typeId
// 	 * @returns {ts.CallExpression}
// 	 */
// 	getTypeFromStoreLazily(typeId: number): ts.CallExpression
// 	{
// 		return factory.createCallExpression(
// 			factory.createIdentifier("_tst_reflect_lazy"),
// 			undefined,
// 			[factory.createNumericLiteral(typeId)]
// 		);
// 	}
//
// 	/**
// 	 * When we're at the top-level our getType call processing, we need to replace
// 	 * the method call with our own version which references the meta lib
// 	 *
// 	 * @param {ts.CallExpression} call
// 	 * @returns {ts.CallExpression}
// 	 */
// 	updateSourceFileGetTypeCall(call: ts.CallExpression): ts.CallExpression
// 	{
// 		return ts.factory.updateCallExpression(
// 			call,
// 			factory.createIdentifier("_tst_reflect_get"),
// 			call.typeArguments,
// 			call.arguments
// 		);
// 	}
//
// }
