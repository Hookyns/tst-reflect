const PACKAGE_ID: string = "tst-reflect"

/**
 * Kind of type
 */
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
	Container,

	/**
	 * Type reference created during type checking
	 * @description Usually Array<...>, ReadOnly<...> etc.
	 */
	TransientTypeReference,

	/**
	 * Some specific object
	 * @description Eg. "{ foo: string, bar: boolean }"
	 */
	Object,

	/**
	 * Some subtype
	 * @description Eg. type Foo = "hello world" | "hello". String "hello world" is literal type and it is subtype of string.
	 */
	LiteralType,
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
export interface PropertyDescription
{
	n: string;
	t: Type;
	d?: Array<DecoratorDescription>;
}

/**
 * Property description
 */
export interface Property
{
	/**
	 * Property name
	 */
	name: string;

	/**
	 * Property type
	 */
	type: Type;

	/**
	 * Property decorators
	 */
	decorators: Array<Decorator>;
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
 * Decoration description
 */
export interface Decorator
{
	/**
	 * Decorator name
	 */
	name: string;

	/**
	 * Decorator full name
	 */
	fullName?: string;
}

/**
 * Method parameter description
 */
export interface MethodParameter
{
	/**
	 * Parameter name
	 */
	name: string;

	/**
	 * Parameter type
	 */
	type: Type
}

/**
 * @internal
 */
export interface ConstructorDescription
{
	params: Array<ParameterDescription>
}

/**
 * Constructor description object
 */
export interface Constructor
{
	/**
	 * Constructor parameters
	 */
	parameters: Array<MethodParameter>
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
	ctor?: () => Function;
	bt?: Type;
	iface?: Type;
	v?: any
	args?: Array<Type>
}

const typesMetaCache: { [key: number]: Type } = {};

/**
 * Object representing TypeScript type in memory
 */
export class Type
{
	public static readonly Object: Type;

	private readonly _ctor?: () => Function;
	private readonly _kind: TypeKind;
	private readonly _name: string;
	private readonly _fullName: string;
	private readonly _isUnion: boolean;
	private readonly _isIntersection: boolean;
	private readonly _types?: Array<Type>;
	private readonly _properties: Array<Property>;
	private readonly _decorators: Array<Decorator>;
	private readonly _constructors: Array<Constructor>;
	private readonly _baseType?: Type;
	private readonly _interface?: Type;
	private readonly _literalValue?: any;
	private readonly _typeArgs: Array<Type>;

	/**
	 * Internal Type constructor
	 * @internal
	 */
	constructor(description: TypeProperties)
	{
		if (new.target != TypeActivator)
		{
			throw new Error("You cannot create instance of Type manually!");
		}

		this._name = description.n || "";
		this._fullName = description.fn || description.n || "";
		this._kind = description.k;
		this._constructors = description.ctors?.map(Type.mapConstructors) || [];
		this._properties = description.props?.map(Type.mapProperties) || [];
		this._decorators = description.decs?.map(Type.mapDecorators) || [];
		this._ctor = description.ctor;
		this._baseType = description.bt ?? (description.ctor == Object ? undefined : Type.Object);
		this._interface = description.iface;
		this._isUnion = description.union || false;
		this._isIntersection = description.inter || false;
		this._types = description.types;
		this._literalValue = description.v;
		this._typeArgs = description.args || [];
	}

	/**
	 * @internal
	 * @param typeId
	 */
	public static _getTypeMeta(typeId: number)
	{
		const type = typesMetaCache[typeId];

		if (!type)
		{
			throw new Error(`Unknown type identifier '${typeId}'. Metadata not found.`);
		}

		return type;
	}

	/**
	 * @internal
	 * @param typeId
	 * @param type
	 */
	public static _storeTypeMeta(typeId: number, type: Type)
	{
		typesMetaCache[typeId] = type;
	}

	/**
	 * @internal
	 * @param d
	 */
	private static mapDecorators(d: DecoratorDescription): Decorator
	{
		return ({name: d.n, fullName: d.fn});
	}

	/**
	 * @internal
	 * @param p
	 */
	private static mapProperties(p: PropertyDescription): Property
	{
		return ({name: p.n, type: p.t, decorators: p.d?.map(Type.mapDecorators) || []});
	}

	/**
	 * @internal
	 * @param c
	 */
	private static mapConstructors(c: ConstructorDescription): Constructor
	{
		return ({parameters: c.params.map(p => ({name: p.n, type: p.t}))});
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns a value indicating whether the Type is container for unified Types or not
	 */
	get union(): boolean
	{
		return this._isUnion;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not
	 */
	get intersection(): boolean
	{
		return this._isIntersection;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * List of underlying types in case Type is union or intersection
	 */
	get types(): Array<Type> | undefined
	{
		return this._types;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Constructor function in case Type is class
	 */
	get ctor(): Function | undefined
	{
		return this._ctor?.();
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Base type
	 * @description Base type from which this type extends from or undefined if type is Object.
	 */
	get baseType(): Type | undefined
	{
		return this._baseType;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get type full-name
	 * @description Contains file path base to project root
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

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get kind of type
	 */
	get kind(): TypeKind
	{
		return this._kind;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns true if types are equals
	 * @param type
	 */
	is(type: Type)
	{
		return this._fullName == type._fullName;
	}

	// noinspection JSUnusedGlobalSymbols
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

	/**
	 * Returns a value indicating whether the Type is an literal or not
	 */
	isLiteral(): boolean
	{
		return this._kind == TypeKind.LiteralType;
	}

	/**
	 * Get underlying value in case of literal type
	 */
	getLiteralValue(): any
	{
		return this._literalValue;
	}

	/**
	 * Returns a value indicating whether the Type is an object literal or not
	 */
	isObjectLiteral(): boolean
	{
		return this._kind == TypeKind.LiteralType;
	}

	/**
	 * Return type arguments in case of generic type
	 */
	getTypeArguments(): Array<Type>
	{
		return this._typeArgs;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns constructor description when Type is a class
	 */
	getConstructors(): Array<Constructor> | undefined
	{
		if (!this.isClass())
		{
			return undefined;
		}

		return this._constructors;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns interface which this type implements
	 */
	getInterface(): Type | undefined
	{
		return this._interface;
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

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Returns true if this type is assignable to target type
	 * @param target
	 */
	isAssignableTo(target: Type): boolean
	{
		let tmpType: Type | undefined = this;

		do
		{
			if (target.fullName == tmpType.fullName)
			{
				return true;
			}

			tmpType = tmpType.baseType
		}
		while (tmpType !== undefined);

		return false;
	}
}

class TypeActivator extends Type
{
}

(Type as any).Object = Reflect.construct(Type, [
	{
		n: "Object",
		fn: "Object",
		ctor: Object,
		k: TypeKind.Native
	}
], TypeActivator);

/**
 * Returns Type of generic parameter
 */
export function getType<T>(): Type | undefined
/** @internal */
export function getType<T>(description?: TypeProperties | number, typeId?: number): Type | undefined
{
	// Return type from storage
	if (typeof description == "number")
	{
		return Type._getTypeMeta(description);
	}

	// Construct Type instance
	if (description && description.constructor === Object)
	{
		const type = Reflect.construct(Type, [description], TypeActivator);

		// Store Type if it has ID
		if (typeId)
		{
			Type._storeTypeMeta(typeId, type);
		}

		return type;
	}

	return undefined;
}

getType.__tst_reflect__ = true

/**
 * To identify functions by package
 */
export const TYPE_ID_PROPERTY_NAME = "__tst_reflect__";

/**
 * Decorator for marking methods as they use type of generic parameters
 */
export function reflectGeneric()
{
	return function (target: any, propertyKey?: string) {
	}
}

reflectGeneric.__tst_reflect__ = true;

/**
 * Name of decorator or JSDoc comment marking method as it use type of generic parameter
 */
export const REFLECT_GENERIC_DECORATOR = "reflectGeneric";