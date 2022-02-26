import { ModuleIdentifier } from "../declarations";
import { Module }           from "../Module";
import { Type }            from "../Type";

let typeIdCounter = 0;

export abstract class TypeBuilderBase
{
	protected typeName: string = "dynamic";
	protected fullName: string;
	protected moduleReference: ModuleIdentifier = Module.Dynamic.id;

	protected constructor()
	{
		this.fullName = TypeBuilderBase.generateFullName();
	}

	/**
	 * Generates full name for dynamic type.
	 * @description Generated name should be unique.
	 * @private
	 */
	private static generateFullName()
	{
		return "@@dynamic/" + Date.now().toString(16) + (++typeIdCounter);
	}

	/**
	 * Set name of the type.
	 * @param typeName
	 */
	setName(typeName: string)
	{

		this.typeName = typeName;
	}

	/**
	 * Set parent module.
	 * @param module
	 */
	setModule(module: ModuleIdentifier)
	{
		this.moduleReference = module;
	}

	/**
	 * Build Type from configured properties.
	 */
	abstract build(): Type;
}