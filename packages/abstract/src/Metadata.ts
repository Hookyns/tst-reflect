import {
	ModuleIdentifier,
	TypeIdentifier,
	TypeReference
}                 from "./declarations";
import { Module } from "./Module";
import {
	NativeTypes,
	Type
}                 from "./Type";

class MetadataLibrary
{
	private readonly modules: Map<ModuleIdentifier, Module> = new Map<ModuleIdentifier, Module>();
	private readonly types: Map<TypeIdentifier, Type> = new Map<TypeIdentifier, Type>();

	/**
	 * Add Module with its Types to the Metadata.
	 * @param modules
	 */
	addModule(...modules: Module[]): MetadataLibrary
	{
		for (let module of modules)
		{
			this.modules.set(module.id ?? Symbol(), module);

			// Add types from the module
			this.addType(...module.getTypes());
		}

		return this;
	}

	/**
	 * Add Types to the Metadata.
	 * @param types
	 */
	addType(...types: Type[]): MetadataLibrary
	{
		for (let type of types)
		{
			this.types.set(type.id ?? Symbol(), type);
		}

		return this;
	}

	/**
	 * Returns the first Type in the Metadata that satisfies the provided predicate.
	 * If no Types satisfy the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Type | undefined}
	 */
	findType(predicate: (type: Type) => boolean): Type | undefined
	{
		for (const [_, type] of this.types)
		{
			if (predicate(type))
			{
				return type;
			}
		}

		return undefined;
	}

	/**
	 * Returns all the Types contained in the Metadata.
	 */
	getTypes(): Type[]
	{
		return Array.from(this.types.values());
	}

	/**
	 * Returns the first Module in the Metadata that satisfies the provided predicate.
	 * If no Modules satisfy the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Module | undefined}
	 */
	findModule(predicate: (module: Module) => boolean): Module | undefined
	{
		for (const [_, module] of this.modules)
		{
			if (predicate(module))
			{
				return module;
			}
		}

		return undefined;
	}

	/**
	 * Returns all Modules contained in Metadata.
	 */
	getModules(): Module[]
	{
		return Array.from(this.modules.values());
	}

	/**
	 * Returns a Type instance identified by the reference. Returns Type.Unknown if no Type found.
	 * @param reference
	 */
	resolveType(reference: TypeReference): Type
	{
		if (typeof (reference) === "object")
		{
			const nativeType: Type | undefined = NativeTypes[reference.kind];

			if (nativeType)
			{
				return nativeType;
			}
			
			console.error("Type referenced by", reference, "not found.");
			return Type.Unknown;
		}
		
		return this.types.get(reference) ?? Type.Unknown;
	}

	/**
	 * Returns a Module instance identified by the reference. Returns Module.Unknown if no Module found.
	 * @param reference
	 */
	resolveModule(reference: ModuleIdentifier): Module
	{
		return this.modules.get(reference) ?? Module.Unknown;
	}
}

const globalObject: any = typeof globalThis === "object"
	? globalThis
	: typeof window === "object"
		? window
		: global;

const MetadataSymbol = Symbol.for("@rtti/abstract/Metadata");
const instance: MetadataLibrary = globalObject[MetadataSymbol] || (globalObject[MetadataSymbol] = new MetadataLibrary());

// noinspection JSUnusedGlobalSymbols
export default instance;