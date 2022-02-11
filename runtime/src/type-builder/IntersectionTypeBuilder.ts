import { TypeKind }        from "../enums";
import { Type }            from "../Type";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class IntersectionTypeBuilder extends TypeBuilderBase
{
	private types: Set<Type> = new Set<Type>();

	/**
	 * Add types to union
	 * @param types
	 */
	addTypes(...types: Type[])
	{
		for (let type of types)
		{
			this.types.add(type);
		}

		return this;
	}

	/**
	 * @inheritDoc
	 */
	build(): Type
	{
		return Type.store.wrap({
			k: TypeKind.Container,
			n: this.typeName,
			fn: this.fullName,
			inter: true,
			types: Array.from(this.types)
		});
	}
}