import { AccessModifier } from "../enums";
import { Metadata }       from "../index";
import type { Type }      from "../Type";
import { TypeReference }  from "./declarations";
import { DecoratorInfo }  from "./DecoratorInfo";
import {
	MethodInfoBase,
	MethodInfoBaseInitializer
}                         from "./MethodInfoBase";

/**
 * Represents a method of a type.
 */
export class MethodInfo extends MethodInfoBase
{
	private readonly _name: string;
	private readonly _returnTypeReference: TypeReference;
	private readonly _optional: boolean;
	private readonly _typeParametersReference: Array<TypeReference>;
	private readonly _decorators: Array<DecoratorInfo>;
	private readonly _accessModifier: AccessModifier;

	private _returnType?: Type;
	private _typeParameters?: Array<Type>;

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
		return this._returnType ?? (this._returnType = Metadata.resolveType(this._returnTypeReference));
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
	constructor(initializer: MethodInfoInitializer)
	{
		super(initializer);

		this._name = initializer.name;
		this._typeParametersReference = initializer.typeParameters || [];
		this._returnTypeReference = initializer.returnType;
		this._optional = !!initializer.optional;
		this._accessModifier = initializer.accessModifier ?? AccessModifier.Public;
		this._decorators = initializer.decorators || [];
	}

	/**
	 * Returns array of generic type parameters.
	 * @return {Array<Type>}
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParameters?.slice() ?? (this._typeParameters = this._typeParametersReference.map(type => Metadata.resolveType(type)));
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators.slice();
	}
}

export interface MethodInfoInitializer extends MethodInfoBaseInitializer
{
	name: string;
	typeParameters?: TypeReference[];
	returnType: TypeReference;
	optional?: boolean;
	accessModifier?: AccessModifier;
	decorators?: DecoratorInfo[];
}