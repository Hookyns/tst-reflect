import type { NativeTypeKind } from "../enums/TypeKind";

export type AsyncCtorReference = () => Promise<{ new(...args: any[]): any }>;
export type SyncCtorReference = () => { new(...args: any[]): any };
export type ModuleIdentifier = number | symbol;
export type ModuleReference = ModuleIdentifier;
export type NativeTypeReference = { kind: NativeTypeKind };
export type TypeIdentifier = number | symbol;
export type TypeReference = TypeIdentifier | NativeTypeReference;