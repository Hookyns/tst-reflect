import { ModuleReference } from "./declarations";
import type { Type }       from "./Type";

export class Module
{
	/**
	 * Module for all the native types.
	 */
	public static readonly Native: Module = new Module({ id: Symbol("Native module ID"), name: "native", path: "" });

	/**
	 * Module for dynamic types without specific module.
	 */
	public static readonly Dynamic: Module = new Module({ id: Symbol("Dynamic module ID"), name: "dynamic", path: "" });

	/**
	 * Unknown module.
	 */
	public static readonly Unknown: Module = new Module({ id: Symbol("Unknown module ID"), name: "unknown", path: "" });

	private readonly _children: Module[];
	private readonly _types: Type[];
	private readonly _id: ModuleReference;

	/**
	 * The name of the module.
	 * @description It is filename of the module in the most of the cases.
	 */
	public readonly name: string;

	/**
	 * The path of the module.
	 */
	public readonly path: string;

	/**
	 * Module identifier.
	 */
	get id(): ModuleReference
	{
		return this._id;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ModuleInitializer)
	{
		// if (!initializer)
		// {
		// 	throw new Error("Initializer is undefined.");
		// }

		this._id = initializer.id;
		this.name = initializer.name;
		this.path = initializer.path;
		this._children = initializer.children || [];
		this._types = initializer.types || [];
	}

	/**
	 * Returns array of modules required by this Module.
	 * @description These are all the imported modules.
	 */
	getChildren(): Module[]
	{
		return this._children.slice();
	}

	/**
	 * Returns array of types from the module.
	 */
	getTypes(): Type[]
	{
		return this._types.slice();
	}
}

export interface ModuleInitializer
{
	id: ModuleReference;
	name: string;
	path: string;
	children?: Module[];
	types?: Type[];
}