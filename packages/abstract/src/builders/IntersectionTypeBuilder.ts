import { TypeKind }        from "../enums";
import Metadata            from "../Metadata";
import { Module }          from "../Module";
import { Type }            from "../Type";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class IntersectionTypeBuilder extends TypeBuilderBase
{
	private types: Set<Type> = new Set<Type>();

	constructor()
	{
		super();
		this.typeName = "dynamic<Intersection>";
	}

	/**
	 * Add types to intersection
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
		const types = Array.from(this.types);

		// Intersection of primitive types is not possible
		if (types.some(t => t.isPrimitive())) // TODO: Not true. StringLiteral is Primitive and eg. `"foo" & string` is possible; result type is literal "foo"; "foo" is subtype of string.
		{
			return Type.Never;
		}

		const type = new Type({
			id: Symbol(),
			name: this.typeName,
			fullName: this.fullName,
			kind: TypeKind.Intersection,
			types: types.map(t => t.id),
			module: this.moduleReference
		});

		Metadata.addType(type);
		
		return type;
	}
}