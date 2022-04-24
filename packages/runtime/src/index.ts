import {
	TypeReference,
	Metadata,
	Type,
	ModuleReference,
	Module
} from "@rtti/abstract";

export * from "./consts";
export * from "./reflect";

const resolver = {
	resolveType(typeRef: TypeReference): Type
	{
		return Metadata.resolveType(typeRef);
	},
	resolveModule(moduleRef: ModuleReference): Module
	{
		return Metadata.resolveModule(moduleRef);
	}
};

const globalObject: any = typeof globalThis === "object"
	? globalThis
	: typeof window === "object"
		? window
		: global;

globalObject["__τ"] = resolver;

declare global
{
	const __τ: typeof resolver;
}