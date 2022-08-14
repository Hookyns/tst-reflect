import { Accessor }                  from "tst-reflect";
import * as ts                       from "typescript";
import { Context }                   from "./contexts/Context";
import { PropertyDescriptionSource } from "./declarations";
import { getDecorators }             from "./getDecorators";
import { getTypeCall }               from "./getTypeCall";
import {
	getAccessModifier,
	getAccessor,
	getCtorTypeReference,
	getDeclaration,
	getType,
	getUnknownTypeCall,
	isArrayType,
	isReadonly
}                                    from "./helpers";

/**
 * Return properties of type
 * @param symbol
 * @param type
 * @param context
 */
export function getProperties(symbol: ts.Symbol | undefined, type: ts.Type, context: Context): Array<PropertyDescriptionSource> | undefined
{
	if (isArrayType(type))
	{
		const resolvedTypeArguments: readonly ts.Type[] = context.typeChecker.getTypeArguments(type);

		if (resolvedTypeArguments)
		{
			const properties = resolvedTypeArguments.map((type: ts.Type, index: number) =>
			{
				// TODO: Returning properties for Array is OK only in case that Array is Literal (eg. [number, string]). If it's generic Array (eg. Array<string>), it has unknown props but known generic type.
				return {
					n: index.toString(),
					t: getTypeCall(type, undefined, context)
				};
			});

			return properties.length ? properties : undefined;
		}

		return undefined;
	}

	return type.getProperties()
		.filter(m =>
			(m.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property
			|| (m.flags & ts.SymbolFlags.GetAccessor) === ts.SymbolFlags.GetAccessor
			|| (m.flags & ts.SymbolFlags.SetAccessor) === ts.SymbolFlags.SetAccessor
		)
		.map<PropertyDescriptionSource>((memberSymbol: ts.Symbol) =>
		{
			const declaration = getDeclaration(memberSymbol);
			const accessor = getAccessor(declaration);
			let type = getType(memberSymbol, context.typeChecker);

			return {
				n: memberSymbol.escapedName.toString(),
				t: type && getTypeCall(type, memberSymbol, context, getCtorTypeReference(memberSymbol)) || getUnknownTypeCall(context),
				d: getDecorators(memberSymbol, context),
				am: getAccessModifier(declaration?.modifiers),
				acs: accessor,
				ro: isReadonly(declaration?.modifiers) || accessor == Accessor.Getter,
				o: declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && !!declaration.questionToken
			};
		});
}
