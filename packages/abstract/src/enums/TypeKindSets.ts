import { TypeKind } from "./TypeKind";

export const LiteralTypeKinds = [
	TypeKind.StringLiteral,
	TypeKind.NumberLiteral,
	TypeKind.BooleanLiteral,
	TypeKind.BigIntLiteral,
	TypeKind.RegExpLiteral,
	TypeKind.TemplateLiteral,
];

export const PrimitiveTypeKinds = [
	TypeKind.String,
	TypeKind.Number,
	TypeKind.BigInt,
	TypeKind.Boolean,
	TypeKind.Symbol,
	TypeKind.Null,
	TypeKind.Undefined,
	TypeKind.Void,
	TypeKind.Never,
];