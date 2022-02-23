import { TypeKind }             from "@rtti/abstract";
import * as ts                  from "typescript";
import { Context }              from "./contexts/Context";
import { TypePropertiesSource } from "./declarations";

export default function getLiteralProperties(type: ts.Type, context: Context): TypePropertiesSource | undefined
{
	const props: { n?: string, k: TypeKind, v: any } = { k: TypeKind.Unknown, v: (type as any).value };

	// TODO: Add names of types in runtime

	switch (type.flags)
	{
		case ts.TypeFlags.NumberLiteral:
			props.k = TypeKind.NumberLiteral;
			return props;
		case ts.TypeFlags.StringLiteral:
			props.k = TypeKind.StringLiteral;
			return props;
		case ts.TypeFlags.BooleanLiteral:
			props.k = TypeKind.BooleanLiteral;
			return props;
		case ts.TypeFlags.BigIntLiteral:
			props.k = TypeKind.BigIntLiteral;
			return props;
	}

	return undefined;
}