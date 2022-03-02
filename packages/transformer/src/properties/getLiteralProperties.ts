import { TypeKind }       from "@rtti/abstract";
import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { TypeProperties } from "../declarations";
import { getTypeId }      from "../utils/typeHelpers";

export function getLiteralProperties(context: Context, typeNode: ts.TypeNode, type: ts.Type): TypeProperties | undefined
{
	const props: TypeProperties = {
		id: getTypeId(type),
		kind: TypeKind.Unknown,
		value: (type as any).value
	};

	switch (type.flags)
	{
		case ts.TypeFlags.NumberLiteral:
			props.kind = TypeKind.NumberLiteral;
			return props;
		case ts.TypeFlags.StringLiteral:
			props.kind = TypeKind.StringLiteral;
			return props;
		case ts.TypeFlags.BooleanLiteral:
			props.kind = TypeKind.BooleanLiteral;
			return props;
		case ts.TypeFlags.BigIntLiteral:
			props.kind = TypeKind.BigIntLiteral;
			return props;
	}

	if (ts.isNoSubstitutionTemplateLiteral(typeNode))
	{
		props.kind = TypeKind.TemplateLiteral;
		props.value = typeNode.text;
		return props;
	}
	else if (ts.isTemplateLiteral(typeNode))
	{
		props.kind = TypeKind.TemplateLiteral;
		props.value = undefined;
		props.template = {
			head: (typeNode as ts.TemplateExpression).head.text,
			templateSpans: (typeNode as ts.TemplateExpression).templateSpans.map(span => ({ expression: span.expression.getText(), literal: span.literal.text }))
		};
	}

	return undefined;
}