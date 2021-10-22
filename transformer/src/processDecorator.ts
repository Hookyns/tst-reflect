import * as ts                                            from "typescript";
import { Context }                                        from "./contexts/Context";
import { FunctionLikeDeclarationGenericParametersDetail } from "./FunctionLikeDeclarationGenericParametersDetail";
import { getGenericParametersDetails }                    from "./getGenericParametersDetails";
import getTypeCall                                        from "./getTypeCall";
import { updateCallExpression }                           from "./updateCallExpression";

export function processDecorator(node: ts.Decorator, decoratorType: ts.Type, context: Context): ts.Decorator | undefined
{
    if (!ts.isCallExpression(node.expression))
    {
        return undefined;
    }

    // Method/function declaration
    const declaration = decoratorType.symbol.declarations?.[0] as ts.FunctionLikeDeclarationBase;

    if (!declaration)
    {
        return undefined;
    }

    // Try to get State
    const state: FunctionLikeDeclarationGenericParametersDetail = getGenericParametersDetails(declaration, context, []);

    if (!state || !state.usedGenericParameters || !state.indexesOfGenericParameters || !state.requestedGenericsReflection)
    {
        return undefined;
    }

    // Decorator has no generic parameters in nature; we just abusing it so only one generic parameter makes sense
    const genericParamName = state.usedGenericParameters[0];

    const genericTypeNode = node.parent; // TODO: mělo by asi být node.parent.type

    const genericType = context.typeChecker.getTypeAtLocation(genericTypeNode);
    const genericTypeSymbol = genericType.getSymbol();

    return ts.factory.updateDecorator(node, updateCallExpression(node.expression, state, [{
        genericTypeName: genericParamName,
        reflectedType: getTypeCall(
            genericType,
            genericTypeSymbol,
            context,
            genericTypeNode.name
        )
    }]));
}