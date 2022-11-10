import { Type } from "../Type.ts";

let typeIdCounter = 0;

export abstract class TypeBuilderBase
{
	protected typeName: string = "dynamic";
	protected fullName: string;

	constructor()
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

	setName(typeName: string)
	{

		this.typeName = typeName;
	}

	/**
	 * Build Type from configured properties.
	 */
	abstract build(): Type;
}