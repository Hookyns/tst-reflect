import { TypeKind } from "../enums.ts";
import { Type } from "../Type.ts";
import { TypeBuilderBase } from "./TypeBuilderBase.ts";

export class ArrayTypeBuilder extends TypeBuilderBase
{
	private type?: Type;

	/**
	 * @internal
	 */
	constructor()
	{
		super();
		this.typeName = "Array";
	}

	/**
	 * Set generic type of the Array
	 * @param type
	 */
	setGenericType(type: Type)
	{
		this.type = type;
		return this;
	}

	/**
	 * @inheritDoc
	 */
	build(): Type
	{
		return Type.store.wrap({
			k: TypeKind.Native,
			n: this.typeName,
			fn: this.fullName,
			args: [this.type ?? Type.Any],
			ctor: () => Array
		});
	}
}