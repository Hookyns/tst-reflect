import { Type } from "./Type.ts";
import { setTypeBuilder } from "./flatten.ts";
import { TypeBuilder } from "./type-builder/TypeBuilder.ts";

setTypeBuilder(TypeBuilder);

export * from "./consts.ts";
export * from "./enums.ts";
export * from "./meta-stores/index.ts";
export * from "./descriptions/decorator.ts";
export * from "./descriptions/parameter.ts";
export * from "./descriptions/propertyInfo.ts";
export * from "./descriptions/methodInfo.ts";
export * from "./descriptions/conditional-type.ts";
export * from "./descriptions/indexed-access-type.ts";
export * from "./descriptions/constructor-import.ts";
export * from "./descriptions/enum-info.ts";
export * from "./descriptions/type-properties.ts";
export {
	Type,
	LazyType
} from "./Type.ts";
export type {
	TypeProvider
} from "./Type.ts";
export {
	getType,
	reflect
} from "./reflect.ts";