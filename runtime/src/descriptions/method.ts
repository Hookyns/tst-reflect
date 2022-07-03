import { AccessModifier } from "../enums";
import { Mapper }         from "../mapper";
import {
	LazyType,
	TypeProvider
}                         from "../Type";
import type { Type }      from "../Type";
import {
	Decorator,
	DecoratorDescription
}                         from "./decorator";
import {
	MethodParameter,
	ParameterDescription
}                         from "./parameter";

/**
 * @internal
 */
export interface MethodDescription
{
	/**
	 * Method name
	 */
	n: string;

	/**
	 * Parameters
	 */
	params: Array<ParameterDescription>;

	/**
	 * Return type
	 */
	rt: Type;

	/**
	 * Decorators
	 */
	d?: Array<DecoratorDescription>;

	/**
	 * Generic type parameters
	 */
	tp?: Array<Type | TypeProvider>;

	/**
	 * Optional method
	 */
	o: boolean;

	/**
	 * Access modifier
	 */
	am: AccessModifier;
}

export abstract class MethodBase
{
	private readonly _parameters: Array<MethodParameter>;

	/**
	 * Internal constructor
	 * @internal
	 */
	protected constructor(params: Array<ParameterDescription>)
	{
		this._parameters = params?.map(param => new MethodParameter(param)) || [];
	}

	/**
	 * Parameters of this method
	 */
	getParameters(): ReadonlyArray<MethodParameter>
	{
		return this._parameters.slice();
	}
}

/**
 * Method details
 */
export class Method extends MethodBase
{
	private readonly _name: string;
	private readonly _returnType: LazyType;
	private readonly _optional: boolean;
	private readonly _typeParameters: Array<LazyType>;
	private readonly _decorators: Array<Decorator>;
	private readonly _accessModifier: AccessModifier;

	/**
	 * Name of this method
	 */
	get name(): string
	{
		return this._name;
	}

	/**
	 * Return type of this method
	 */
	get returnType(): Type
	{
		return this._returnType.type;
	}

	/**
	 * Method is optional
	 */
	get optional(): boolean
	{
		return this._optional;
	}

	/**
	 * Access modifier
	 */
	get accessModifier(): AccessModifier
	{
		return this._accessModifier;
	}

	/**
	 * Internal method constructor
	 * @internal
	 */
	constructor(description: MethodDescription)
	{
		super(description.params);

		if (new.target != MethodActivator)
		{
			throw new Error("You cannot create instance of Method manually!");
		}

		this._name = description.n;
		this._typeParameters = description.tp?.map(t => new LazyType(t)) || [];
		this._returnType = new LazyType(description.rt);
		this._optional = description.o;
		this._accessModifier = description.am;
		this._decorators = description.d?.map(Mapper.mapDecorators) || [];
	}

	/**
	 * Returns list of generic type parameter.
	 * @return {Array<Type>}
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParameters.map(tp => tp.type);
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<Decorator>
	{
		return this._decorators.slice();
	}
}

/**
 * @internal
 */
export class MethodActivator extends Method
{
}

/**
 * @internal
 */
export interface ConstructorDescription
{
	params: Array<ParameterDescription>;
}

/**
 * Constructor details
 */
export class Constructor extends MethodBase
{
	/**
	 * Internal constructor
	 * @internal
	 */
	constructor(description: ConstructorDescription)
	{
		super(description.params);

		if (new.target != ConstructorActivator)
		{
			throw new Error("You cannot create instance of Constructor manually!");
		}
	}
}

/**
 * @internal
 */
export class ConstructorActivator extends Constructor
{
}
