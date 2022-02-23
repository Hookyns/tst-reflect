import { TypeKind }        from "../enums";
import Metadata            from "../Metadata";
import { Type }            from "../Type";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class ArrayTypeBuilder extends TypeBuilderBase
{
	private type?: Type;

	constructor()
	{
		super();
		this.typeName = "dynamic<Array>";
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
		const type = new Type({
			id: Symbol(),
			kind: TypeKind.Array,
			name: this.typeName,
			fullName: this.fullName,
			typeArgs: [this.type?.id ?? Type.Any.id],
			ctor: () => Promise.resolve(Array),
			ctorSync: () => Array,
			module: this.moduleReference
		});
		
		Metadata.addType(type);
		
		return type;
	}
}