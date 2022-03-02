import * as ts     from "typescript";
import { Context } from "../contexts/Context";
import {
	PropertyProperties,
	UnknownTypeReference
}                  from "../declarations";

/**
 * Return properties of type
 * @param context
 * @param type
 */
export function getProperties(context: Context, type: ts.Type): Array<PropertyProperties> | undefined
{
	const properties = type.getProperties();

	// TODO: Properties
	// if (symbol?.members)
	// {
	// 	const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);
	//
	// 	const properties = members
	// 		.filter(m => (m.flags & ts.SymbolFlags.Property) == ts.SymbolFlags.Property || (m.flags & ts.SymbolFlags.GetAccessor) == ts.SymbolFlags.GetAccessor || (m.flags & ts.SymbolFlags.SetAccessor) == ts.SymbolFlags.SetAccessor)
	// 		.map((memberSymbol: ts.Symbol) =>
	// 		{
	// 			const declaration = getDeclaration(memberSymbol);
	// 			const accessor = getAccessor(declaration);
	// 			const resolvedType = getType(memberSymbol, context);
	//
	// 			return {
	// 				name: memberSymbol.escapedName.toString(),
	// 				type: resolvedType ? context.metadata.addType(resolvedType) : UnknownTypeReference,
	// 				// t: resolvedType ? getTypeCall(resolvedType, memberSymbol, context, getCtorTypeReference(memberSymbol)) : getUnknownTypeCall(context),
	// 				decorators: getDecorators(memberSymbol, context),
	// 				accessModifier: getAccessModifier(declaration?.modifiers),
	// 				accessor: accessor,
	// 				readonly: isReadonly(declaration?.modifiers) || accessor == Accessor.Getter,
	// 				optional: declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && !!declaration.questionToken
	// 			};
	// 		});
	//
	// 	return properties.length ? properties : undefined;
	// }

	// Note: array
	// // If type is Array
	// const resolvedTypeArguments: readonly ts.Type[] = context.typeChecker.getTypeArguments(type as ts.TypeReference);//(type as any).resolvedTypeArguments;
	//
	// if (resolvedTypeArguments)
	// {
	// 	const properties = resolvedTypeArguments.map((type: ts.Type, index: number) =>
	// 	{
	// 		// TODO: Returning properties for Array is OK only in case that Array is Literal (eg. [number, string]). If it's generic Array (eg. Array<string>), it has unknown props but known generic type.
	// 		return {
	// 			name: index.toString(),
	// 			type: getTypeCall(type, undefined, context)
	// 		};
	// 	});
	//
	// 	return properties.length ? properties : undefined;
	// }

	return undefined;
}
