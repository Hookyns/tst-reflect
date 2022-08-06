import {
	LazyType,
	TypeProvider
}                    from "../Type";
import type { Type } from "../Type";
import {
	Parameter,
	ParameterDescription
}                    from "./parameter";

/**
 * @internal
 */
export interface FunctionTypeDescription
{
	/**
	 * Parameters
	 */
	params: Array<ParameterDescription>;

	/**
	 * Return type
	 */
	rt: Type;

	/**
	 * Generic type parameters
	 */
	tp?: Array<Type | TypeProvider>;
}

/**
 * Function details.
 */
export class FunctionInfo
{
	private readonly _parameters: Array<Parameter>;
	private readonly _returnType: LazyType;
	private readonly _typeParameters: Array<LazyType>;

	/**
	 * Return type of this function.
	 */
	get returnType(): Type
	{
		return this._returnType.type;
	}

	/**
	 * Internal FunctionInfo constructor.
	 * @internal
	 */
	constructor(description: FunctionTypeDescription)
	{
		this._parameters = description.params?.map(param => new Parameter(param)) || [];
		this._typeParameters = description.tp?.map(t => new LazyType(t)) || [];
		this._returnType = new LazyType(description.rt);
	}

	/**
	 * Get list of parameters.
	 */
	getParameters(): ReadonlyArray<Parameter>
	{
		return this._parameters.slice();
	}

	/**
	 * Get list of generic type parameter.
	 * @return {Array<Type>}
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParameters.map(tp => tp.type);
	}
}