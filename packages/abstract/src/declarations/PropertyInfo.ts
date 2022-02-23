import {
	AccessModifier,
	Accessor,
	Metadata
}                        from "../index";
import { DecoratorInfo } from "./DecoratorInfo";
import { TypeReference } from "./declarations";
import type { Type }     from "../Type";

/**
 * Details about property of an objec.
 */
export class PropertyInfo
{
	private readonly _typeReference: TypeReference;
	private _type?: Type;

	/**
	 * Property decorators
	 * @internal
	 */
	private _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * Property name
	 */
	readonly name: string;

	/**
	 * Property type
	 */
	get type(): Type
	{
		return this._type ?? (this._type = Metadata.resolveType(this._typeReference));
	}

	/**
	 * Optional property
	 */
	readonly optional: boolean;

	/**
	 * Access modifier
	 */
	readonly accessModifier: AccessModifier;

	/**
	 * Accessor
	 */
	readonly accessor: Accessor;

	/**
	 * Readonly
	 */
	readonly readonly: boolean;

	/**
	 * @param initializer
	 */
	constructor(initializer: PropertyInfoInitializer)
	{
		this.name = initializer.name;
		this._typeReference = initializer.type;
		this._decorators = initializer.decorators || [];
		this.optional = !!initializer.optional;
		this.accessModifier = initializer.accessModifier ?? AccessModifier.Public;
		this.accessor = initializer.accessor ?? Accessor.None;
		this.readonly = !!initializer.readonly;
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators.slice();
	}
}

export interface PropertyInfoInitializer
{
	name: string;
	type: TypeReference;
	decorators?: Array<DecoratorInfo>;
	optional?: boolean;
	readonly?: boolean;
	accessModifier?: AccessModifier;
	accessor?: Accessor;
}