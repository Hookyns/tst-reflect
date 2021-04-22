import * as ts from "typescript";

export default function getLiteralName(type: ts.Type) {
	switch (type.flags)
	{
		case ts.TypeFlags.NumberLiteral:
			return "number";
		case ts.TypeFlags.StringLiteral:
			return "string";
		case ts.TypeFlags.BooleanLiteral:
			return "boolean";
		case ts.TypeFlags.EnumLiteral:
			return "enum";
		case ts.TypeFlags.BigIntLiteral:
			return "bigint";
	}
	
	return "";
}