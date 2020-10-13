export type GetTypeCall = import("typescript").CallExpression;

export enum TypeKind
{
	/**
	 * Interface
	 */
	Interface,

	/**
	 * Class
	 */
	Class,

	/**
	 * Native JavaScript/TypeScript type
	 */
	Native,

	/**
	 * Container for other types in case of types union or intersection
	 */
	Container
}

/**
 * @internal
 */
export interface ParameterDescription
{
	n: string;
	t: Type
}

/**
 * @internal
 */
export interface ParameterDescriptionSource
{
	n: string;
	t: GetTypeCall
}

export interface MethodParameter
{
	name: string;
	type: Type
}

/**
 * @internal
 */
export interface PropertyDescription
{
	n: string;
	t: Type
}

/**
 * @internal
 */
export interface PropertyDescriptionSource
{
	n: string;
	t: GetTypeCall
}

export interface Property
{
	name: string;
	type: Type
}

/**
 * @internal
 */
export interface DecoratorDescription
{
	n: string;
	fn: string;
}

/**
 * @internal
 */
export interface DecoratorDescriptionSource
{
	n: string;
	fn?: string;
}

export interface Decorator
{
	name: string;
	fullName?: string;
}

/**
 * @internal
 */
export interface ConstructorDescription
{
	params: Array<ParameterDescription>
}

/**
 * @internal
 */
export interface ConstructorDescriptionSource
{
	params: Array<ParameterDescriptionSource>
}

export interface Constructor
{
	parameters: Array<MethodParameter>
}

/**
 * @internal
 */
export interface TypePropertiesSource
{
	/**
	 * Name
	 * @name name
	 */
	n?: string;
	/**
	 * Full Name
	 * @alias fullName
	 */
	fn?: string;
	k: TypeKind;
	ctors?: Array<ConstructorDescriptionSource>;
	props?: Array<PropertyDescriptionSource>
	decs?: Array<DecoratorDescriptionSource>
	union?: boolean;
	inter?: boolean;
	types?: Array<GetTypeCall>;
}

/**
 * @internal
 */
export interface TypeProperties
{
	n?: string;
	fn?: string;
	k: TypeKind;
	ctors?: Array<ConstructorDescription>;
	props?: Array<PropertyDescription>;
	decs?: Array<DecoratorDescription>;
	union?: boolean;
	inter?: boolean;
	types?: Array<Type>;
}

const typesMetaCache: { [key: number]: Type } = {};

export class Type
{
	private readonly _kind: TypeKind;
	private readonly _name: string;
	private readonly _fullName: string;
	private readonly _isUnion: boolean;
	private readonly _isIntersection: boolean;
	private readonly _types?: Array<Type>;
	private readonly _properties: Array<Property>;
	private readonly _decorators: Array<Decorator>;
	private readonly _constructors: Array<Constructor>;

	/**
	 * @internal
	 */
	constructor(description: TypeProperties)
	{
		this._name = description.n || "";
		this._fullName = description.fn || "";
		this._kind = description.k;
		this._constructors = description.ctors?.map(Type.mapConstructors) || [];
		this._properties = description.props?.map(Type.mapProperties) || [];
		this._decorators = description.decs?.map(Type.mapDecorators) || [];

		this._isUnion = description.union || false;
		this._isIntersection = description.inter || false;
		this._types = description.types;
	}

	/**
	 * @internal
	 * @param typeId
	 */
	public static _getTypeMeta(typeId: number) {
		const type = typesMetaCache[typeId];
		
		if (!type)  {
			throw new Error("Unknown type identifier. Metadata not found.");
		}
		
		return type;
	}

	/**
	 * @internal
	 * @param typeId
	 * @param type
	 */
	public static _storeTypeMeta(typeId: number, type: Type) {
		typesMetaCache[typeId] = type;
	}

	/**
	 * @internal
	 * @param d
	 */
	private static mapDecorators(d: DecoratorDescription)
	{
		return ({name: d.n, fullName: d.fn});
	}

	/**
	 * @internal
	 * @param p
	 */
	private static mapProperties(p: PropertyDescription)
	{
		return ({name: p.n, type: p.t});
	}

	/**
	 * @internal
	 * @param c
	 */
	private static mapConstructors(c: ConstructorDescription)
	{
		return ({parameters: c.params.map(p => ({name: p.n, type: p.t}))});
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Return true if type is container holding types union
	 */
	get isUnion(): boolean
	{
		return this._isUnion;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Return true if type is container holding types intersection
	 */
	get isIntersection(): boolean
	{
		return this._isIntersection;
	}

	get types(): Array<Type> | undefined
	{
		return this._types;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get type full-name
	 */
	get fullName(): string
	{
		return this._fullName;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get type name
	 */
	get name(): string
	{
		return this._name;
	}

	/**
	 * Get kind of type
	 */
	get kind(): TypeKind
	{
		return this._kind;
	}

	/**
	 * Returns a value indicating whether the Type is a class or not
	 */
	isClass(): boolean
	{
		return this.kind == TypeKind.Class;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns a value indicating whether the Type is a interface or not
	 */
	isInterface(): boolean
	{
		return this.kind == TypeKind.Interface;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns constructor description when Type is a class
	 */
	getConstructors(): Array<Constructor> | null
	{
		if (!this.isClass())
		{
			return null;
		}

		return this._constructors;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns array of properties
	 */
	getProperties(): Array<Property>
	{
		return this._properties;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns array of decorators
	 */
	getDecorators(): Array<Decorator>
	{
		return this._decorators;
	}
}

/**
 * Returns Type of generic parameter
 */
export function getType<T>(): Type
/** @internal */
export function getType<T>(typeId?: number, description?: TypeProperties): Type
{
	if (typeof typeId != "number") {
		throw new Error("Cannot be called. Call of this function should be replaced by Type while TS compilation. Check if 'tsrtr' transformer is used.");
	}
	
	if (description && description.constructor === Object) {
		const type = new Type(description);
		Type._storeTypeMeta(typeId, type);
		return type;
	}

	return Type._getTypeMeta(typeId);
}

// To identify getType function in transformer
export const TYPE_ID_PROPERTY_NAME = "__tsrts__";
getType[TYPE_ID_PROPERTY_NAME] = true;