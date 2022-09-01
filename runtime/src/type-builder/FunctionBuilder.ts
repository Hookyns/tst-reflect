import { FunctionTypeDescription } from "../descriptions/function-type";
import { ParameterDescription }    from "../descriptions/parameter";
import { TypeKind }                from "../enums";
import { Type }                    from "../Type";
import { TypeBuilderBase }         from "./TypeBuilderBase";

export class FunctionBuilder extends TypeBuilderBase
{
	private parameters: Array<ParameterDescription> = [];
	private returnType: Type = Type.Unknown;

	/**
	 * @internal
	 */
	constructor()
	{
		super();
		this.setName("");
	}

	/**
	 * Create Bu
	 * @param object
	 */
	static fromFunction(object: Function): Type
	{
		if (!object)
		{
			return Type.Undefined;
		}

		const builder = new FunctionBuilder();
		builder.setName(object.name ?? "");

		// TODO: Handle this better.
		const paramsIterator = Array.from(Array(object.length).keys());
		builder.setParameters(paramsIterator.map(i => ({
			n: "param" + i,
			t: Type.Any,
			o: false,
			var: false
		})));

		builder.setReturnType(Type.Unknown);

		return builder.build();
	}

	public setParameters(parameters: ParameterDescription[])
	{
		this.parameters = parameters;
	}

	public setReturnType(returnType: Type)
	{
		this.returnType = returnType;
	}

	/**
	 * Build Function type.
	 */
	build(): Type
	{
		return Type.store.wrap({
			k: TypeKind.Function,
			n: this.typeName,
			fn: this.fullName,
			fnc: {
				params: this.parameters,
				tp: [],
				rt: this.returnType
			} as FunctionTypeDescription
		});
	}
}