import { TypeKind }        from "../enums";
import { Type }            from "../Type";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class UnionTypeBuilder extends TypeBuilderBase
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
	 * Build Union Type.
	 * Does not return Union if there is only one type.
	 * Returns Type.Undefined if there is no type.
	 */
	build(): Type
	{
		const types = Array.from(this.types);
		
		if (types.length === 0) 
		{
			return Type.Undefined;
		}
		
		if (types.length === 1) 
		{
			return types[0];
		}

		return Type.store.wrap({
				k: TypeKind.Container,
				n: this.typeName,
				fn: this.fullName,
				union: true,
				types: types
			});
	}
}