import { TypeKind }        from "../enums";
import { Type }            from "../Type";
import { TypeBuilderBase } from "./TypeBuilderBase";

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