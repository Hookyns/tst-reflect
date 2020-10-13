import * as ts                              from "typescript";
import {GetTypeCall, TYPE_ID_PROPERTY_NAME} from "../types";
import createNewType                        from "./createNewType";
import {getSymbol, getType}    from "./helpers";

export function getVisitor(context: ts.TransformationContext, program: ts.Program): ts.Visitor
{
	let checker: ts.TypeChecker = program.getTypeChecker();
	
	return node => { 
		const sourceFileGetTypeCalls: Array<GetTypeCall> = [];

		const visit: ts.Visitor = (node) =>
		{
			if (ts.isCallExpression(node) && (node.expression as any).escapedText == "getType")
			{
				// getType type
				const fncType = checker.getTypeAtLocation(node.expression);

				if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
				{
					let genericTypeNode = node.typeArguments?.[0] as ts.TypeReferenceNode;

					if (!genericTypeNode)
					{
						throw new Error("Type argument of function getType<T>() is missing.");
					}

					let genericType = checker.getTypeAtLocation(genericTypeNode);

					// Parameter is another generic type
					if (genericType.flags == ts.TypeFlags.TypeParameter)
					{

					}
					// Parameter is specific type
					else
					{
						// let sourceFile = genericTypeNode.getSourceFile();
						const genericTypeSymbol = getSymbol(genericTypeNode, checker)//checker.getSymbolAtLocation(genericTypeNode.typeName);

						if (!genericTypeSymbol)
						{
							throw new Error("Symbol o generic type argument not found.")
						}

						const genericTypeType: ts.Type = getType(genericTypeSymbol, checker);

						return createNewType(genericTypeSymbol, genericTypeType, checker, sourceFileGetTypeCalls);

						// const fileName = sourceFile.fileName;
						// const typeName = genericTypeSymbol.getName();//(genericTypeNode.typeName as ts.Identifier).escapedText.toString();

						// const constructors: Array<ConstructorDescription> = [];
						// const ctors = genericTypeType.getConstructSignatures();
						// let paramSymbol: ts.Symbol, paramType: ts.Type = undefined;
						//
						// for (let ctor of ctors)
						// {
						// 	const params = [];
						//
						// 	for (paramSymbol of ctor.parameters)
						// 	{
						// 		paramType = getType(paramSymbol, checker);
						//
						// 		let parameter/*: ParameterDescription*/ = {
						// 			name: paramSymbol.getName(),
						// 			type: createNewType(paramSymbol, paramType)
						// 		};
						//		
						// 		params.push(parameter);
						// 	}
						//
						// 	constructors.push({
						// 		parameters: params
						// 	})
						// }
						//
						// // const paramSymbol = ((ctor[0].parameters[0].valueDeclaration as ts.ParameterDeclaration).type as ts.TypeReferenceNode).typeName;
						// // const paramType = checker.getTypeOfSymbolAtLocation(ctor[0].parameters[0], ctor[0].parameters[0].valueDeclaration);
						//
						// // program.getProjectReferences()
						// //ts.resolveProjectReferencePath()
						//
						// return createNewType({
						// 	name: typeName,
						// 	fullName: fileName + ":" + typeName, // genericType.escapedText,
						// 	kind: getTypeKind(genericTypeSymbol),
						// 	constructors: constructors,
						// 	decorators: null,
						// 	properties: properties
						// });
					}

					// const signature = checker.getResolvedSignature(node);
					// const declaration = signature.declaration as ts.FunctionDeclaration;
				}

				// // Type type
				// const type: ts.Type = checker.getTypeAtLocation(node);

				// if ((type.symbol.valueDeclaration as any).members.some(m => m.name && m.name.escapedText == "_" + TYPE_ID_PROPERTY_NAME))
				// {
				// 	const signature = checker.getResolvedSignature(node);
				// 	const declaration = signature.declaration as ts.FunctionDeclaration;
				//
				// 	type.symbol.members.forEach(member => {
				// 		member.escapedName
				// 	});
				// }

				// console.log(node.kind);
			}

			// let kind = ts.SyntaxKind[node.kind];
			// console.log(kind);

			const visitedNode = ts.visitEachChild(node, visit, context);
			
			if (ts.isSourceFile(visitedNode) && sourceFileGetTypeCalls.length) {
				// TODO: Předělat, aby se volalo "(window||global)[_TSRTR_][typeid] = description";
				return ts.factory.updateSourceFile(visitedNode, [
					...sourceFileGetTypeCalls.map(expr => ts.factory.createExpressionStatement(expr)), 
					...visitedNode.statements 
				]);
			}
			
			return visitedNode;
		};
		
		return visit(node);
	}
}