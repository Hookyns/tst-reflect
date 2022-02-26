/**
 * Kind of type
 */
export enum TypeKind
{
	Object,
	Interface,
	Class,
	TypeParameter,
	ConditionalType,
	IndexedAccess,
	Module,
	Union,
	Intersection,
	Method,
	Function,
	GeneratorFunction,
	Any,
	Unknown,
	Never,
	Undefined,
	Null,
	Void,
	String,
	Number,
	BigInt,
	Boolean,
	Enum,
	StringLiteral,
	NumberLiteral,
	BigIntLiteral,
	BooleanLiteral,
	EnumLiteral,
	TemplateLiteral,
	Date,
	Array,
	Tuple,
	Map,
	WeakMap,
	Set,
	WeakSet,
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array,
	Symbol,
	UniqueSymbol,
	Promise,
	Error,
	RegExp,
	RegExpLiteral,
	ArrayBuffer,
	SharedArrayBuffer,
	Atomics,
	DataView,
	Generator,
	Proxy,
	Jsx
}

export type NativeTypeKind =
	TypeKind.Any
	| TypeKind.Unknown
	| TypeKind.Void
	| TypeKind.Never
	| TypeKind.Null
	| TypeKind.Undefined
	| TypeKind.Object
	| TypeKind.String
	| TypeKind.Number
	| TypeKind.BigInt
	| TypeKind.Boolean
	| TypeKind.Date
	| TypeKind.Symbol
	| TypeKind.RegExp
	| TypeKind.Int8Array
	| TypeKind.Uint8Array
	| TypeKind.Uint8ClampedArray
	| TypeKind.Int16Array
	| TypeKind.Uint16Array
	| TypeKind.Int32Array
	| TypeKind.Uint32Array
	| TypeKind.Float32Array
	| TypeKind.Float64Array
	| TypeKind.BigInt64Array
	| TypeKind.BigUint64Array;