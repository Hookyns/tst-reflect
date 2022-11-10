import { AccessModifier } from "../enums.ts";
import { Mapper } from "../mapper.ts";
import {
	LazyType,
	TypeProvider
} from "../Type.ts";
import type { Type } from "../Type.ts";
import {
	Decorator,
	DecoratorDescription
} from "./decorator.ts";
import {
	Parameter,
	ParameterDescription
} from "./parameter.ts";

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
	private readonly _parameters: Array<Parameter>;

	/**
	 * Internal constructor
	 * @internal
	 */
	protected constructor(params: Array<ParameterDescription>)
	{
		this._parameters = params?.map(param => new Parameter(param)) || [];
	}

	/**
	 * Parameters of this method
	 */
	getParameters(): ReadonlyArray<Parameter>
	{
		return this._parameters.slice();
	}
}

/**
 * Method details
 */
export class MethodInfo extends MethodBase
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

		if (new.target != MethodInfoActivator)
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
export class MethodInfoActivator extends MethodInfo
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
export class ConstructorInfo extends MethodBase
{
	/**
	 * Internal constructor
	 * @internal
	 */
	constructor(description: ConstructorDescription)
	{
		super(description.params);

		if (new.target != ConstructorInfoActivator)
		{
			throw new Error("You cannot create instance of Constructor manually!");
		}
	}
}

/**
 * @internal
 */
export class ConstructorInfoActivator extends ConstructorInfo
{
}
