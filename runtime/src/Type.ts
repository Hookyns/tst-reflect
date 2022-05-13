import type { MetadataStore }     from "./meta-stores";
import {
	Constructor,
	Method,
}                                 from "./descriptions/method";
import type { Decorator }         from "./descriptions/decorator";
import type { IndexedAccessType } from "./descriptions/indexed-access-type";
import type { ConditionalType }   from "./descriptions/conditional-type";
import {
	ConstructorImport,
	ConstructorImportActivator
}                                 from "./descriptions/constructor-import";
import type { Property, }         from "./descriptions/property";
import type { MethodParameter, }  from "./descriptions/parameter";
import type { EnumInfo }          from "./descriptions/enum-info";
import type { TypeProperties }    from "./descriptions/type-properties";
import { TypeKind }               from "./enums";
import {
	Mapper,
	resolveLazyType
}                                 from "./mapper";
import { flatten }                from "./flatten";

/**
 * Object representing TypeScript type in memory
 */
export class Type
{
	public static readonly Object: Type;
	public static readonly Unknown: Type;
	public static readonly Any: Type;
	public static readonly Void: Type;
	public static readonly String: Type;
	public static readonly Number: Type;
	public static readonly BigInt: Type;
	public static readonly Boolean: Type;
	public static readonly Date: Type;
	public static readonly Null: Type;
	public static readonly Undefined: Type;
	public static readonly Never: Type;

	/** @internal */
	private _ctor?: () => Promise<{ new(...args: any[]): any }>;
	/** @internal */
	private _ctorDesc?: ConstructorImport;
	/** @internal */
	private _kind!: TypeKind;
	/** @internal */
	private _name!: string;
	/** @internal */
	private _fullName!: string;
	/** @internal */
	private _isUnion!: boolean;
	/** @internal */
	private _isIntersection!: boolean;
	/** @internal */
	private _types!: Array<Type>;
	/** @internal */
	private _properties!: Array<Property>;
	/** @internal */
	private _methods!: Array<Method>;
	/** @internal */
	private _decorators!: Array<Decorator>;
	/** @internal */
	private _constructors!: Array<Constructor>;
	/** @internal */
	private _typeParameters!: Array<Type>;
	/** @internal */
	private _baseType?: Type;
	/** @internal */
	private _interface?: Type;
	/** @internal */
	private _literalValue?: any;
	/** @internal */
	private _typeArgs!: Array<Type>;
	/** @internal */
	private _conditionalType?: ConditionalType;
	/** @internal */
	private _indexedAccessType?: IndexedAccessType;
	/** @internal */
	private _genericTypeConstraint?: Type;
	/** @internal */
	private _genericTypeDefault?: Type;

	/** @internal */
	private static _store: MetadataStore = {
		store: {},
		get(id: number)
		{
			return undefined;
		},
		set(id: number, description: any)
		{
			return Type.Unknown;
		},
		getLazy(id: number)
		{
			return () => undefined;
		},
		wrap(description: any)
		{
			return Type.Unknown;
		}
	};

	/**
	 * Internal Type constructor
	 * @internal
	 */
	constructor()
	{
		if (new.target != TypeActivator)
		{
			throw new Error("You cannot create instance of Type manually!");
		}
	}

	/**
	 * @internal
	 * @param {TypeProperties} description
	 */
	initialize(description: TypeProperties)
	{
		this._name = description.n || "";
		this._fullName = description.fn || description.n || "";
		this._kind = description.k;
		this._constructors = description.ctors?.map(Mapper.mapConstructors) || [];
		this._properties = description.props?.map(Mapper.mapProperties) || [];
		this._methods = description.meths?.map(Mapper.mapMethods) || [];
		this._decorators = description.decs?.map(Mapper.mapDecorators) || [];
		this._typeParameters = description.tp?.map(t => resolveLazyType(t)) || [];
		this._ctor = description.ctor;
		this._ctorDesc = Reflect.construct(ConstructorImport, [description.ctorDesc], ConstructorImportActivator);
		this._interface = resolveLazyType(description.iface);
		this._isUnion = description.union || false;
		this._isIntersection = description.inter || false;
		this._types = description.types?.map(t => resolveLazyType(t)) || [];
		this._literalValue = description.v;
		this._typeArgs = description.args?.map(t => resolveLazyType(t)) || [];
		this._conditionalType = description.ct ? {
			extends: description.ct.e,
			trueType: resolveLazyType(description.ct.tt),
			falseType: resolveLazyType(description.ct.ft)
		} : undefined;
		this._conditionalType = description.ct ? {
			extends: description.ct.e,
			trueType: resolveLazyType(description.ct.tt),
			falseType: resolveLazyType(description.ct.ft)
		} : undefined;
		this._indexedAccessType = description.iat ? {
			objectType: description.iat.ot,
			indexType: resolveLazyType(description.iat.it)
		} : undefined;
		this._genericTypeConstraint = resolveLazyType(description.con);
		this._genericTypeDefault = resolveLazyType(description.def);

		// BaseType of Type.Object must be undefined
		this._baseType = resolveLazyType(description.bt)
			?? (this.isNative() && this.name == "Object" && (!description.props || !description.props.length)
					? undefined
					: Type.Object
			);
	}

	/**
	 * Returns information about generic conditional type.
	 */
	get condition(): ConditionalType | undefined
	{
		return this._conditionalType;
	}

	/**
	 * Returns information about indexed access type.
	 */
	get indexedAccessType(): IndexedAccessType | undefined
	{
		return this._indexedAccessType;
	}

	/**
	 * List of underlying types in case Type is union or intersection
	 */
	get types(): ReadonlyArray<Type>
	{
		return this._types.slice();
	}

	/**
	 * Get meta for the module of the defined constructor
	 * This data is not set when the config mode is set to "universal"
	 */
	get constructorDescription(): ConstructorImport | undefined
	{
		return this._ctorDesc || undefined;
	}

	/**
	 * Base type
	 * @description Base type from which this type extends from or undefined if type is Object.
	 */
	get baseType(): Type | undefined
	{
		return this._baseType;
	}

	/**
	 * Interface which this type implements
	 */
	get interface(): Type | undefined
	{
		return this._interface;
	}

	/**
	 * Get type full-name
	 * @description Contains file path base to project root
	 */
	get fullName(): string
	{
		return this._fullName;
	}

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
	 * Underlying value in case of literal type
	 */
	get literalValue(): any
	{
		return this._literalValue;
	}

	/**
	 * Generic type constrains
	 */
	get genericTypeConstraint(): Type | undefined
	{
		return this._genericTypeConstraint;
	}

	/**
	 * Generic type default value
	 */
	get genericTypeDefault(): any
	{
		return this._genericTypeDefault;
	}

	/**
	 * Search the type store for a specific type
	 *
	 * Runs the provided filter callback on each type. If your filter returns true, it returns this type.
	 *
	 * @param {(type: Type) => boolean} filter
	 * @returns {Type | undefined}
	 */
	static find(filter: (type: Type) => boolean): Type | undefined
	{
		for (let storeKey in this._store.store)
		{
			if (filter(this._store.store[storeKey]))
			{
				return this._store.store[storeKey];
			}
		}

		return undefined;
	}

	/**
	 * Returns all Types contained in metadata.
	 * This method is quite useless with reflection.metadata.type = "inline"; Use "typelib" type.
	 */
	static getTypes(): Type[]
	{
		return Object.values(this._store.store);
	}

	static get store(): MetadataStore
	{
		return this._store;
	}

	/** @internal */
	static _setStore(store: MetadataStore)
	{
		this._store = store;
	}

	/**
	 * Returns true if types are equals
	 * @param type
	 */
	is(type: Type)
	{
		if (this == Type.Unknown)
		{
			return false;
		}

		return type != undefined && this._fullName == type._fullName && !!this._fullName;
	}

	/**
	 * Returns a value indicating whether the Type is container for unified Types or not
	 */
	isUnion(): boolean
	{
		return this._isUnion;
	}

	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not
	 */
	isIntersection(): boolean
	{
		return this._isIntersection;
	}

	/**
	 * Returns true whether current Type is a class with any constructor.
	 */
	isInstantiable(): boolean
	{
		return !!this.getConstructors()?.length;
	}

	/**
	 * Returns a value indicating whether the Type is a class or not
	 */
	isClass(): boolean
	{
		return this.kind == TypeKind.Class;
	}

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
	 * Returns a value indicating whether the Type is an object literal or not
	 */
	isObjectLiteral(): boolean
	{
		return this._kind == TypeKind.Object;
	}

	/**
	 * Returns true if type is union or intersection of types
	 */
	isUnionOrIntersection(): boolean
	{
		return this.isUnion() || this.isIntersection();
	}

	/**
	 * Check if this is a native type ("string", "number", "boolean", "Array" etc.)
	 */
	isNative(): boolean
	{
		return this.kind === TypeKind.Native;
	}

	/**
	 * Check if this is a primitive type ("string", "number", "boolean" etc.)
	 */
	isPrimitive(): boolean
	{
		return this.kind === TypeKind.Native && (
			this == Type.String
			|| this == Type.Number
			|| this == Type.BigInt
			|| this == Type.Undefined
			|| this == Type.Null
			|| this == Type.Void
			|| this == Type.Boolean
			|| this == Type.Never
		);
	}

	/**
	 * Check if this type is a string
	 */
	isString(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "string";
	}

	/**
	 * Check if this type is a number
	 */
	isNumber(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "number";
	}

	/**
	 * Check if this type is a boolean
	 */
	isBoolean(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "boolean";
	}

	/**
	 * Check if this type is an array
	 */
	isArray(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType || this.kind == TypeKind.TransientTypeReference) && (this.name == "Array" || this.name == "ReadonlyArray");
	}

	/**
	 * Check if this type is a promise
	 */
	isPromise(): boolean
	{
		return this.isNative() && this.name == "Promise";
	}

	/**
	 * Check if this type is a Tuple
	 */
	isTuple(): boolean
	{
		return this.kind == TypeKind.Tuple;
	}

	/**
	 * Check if this type is an any
	 */
	isAny(): boolean
	{
		return this.isNative() && this.name == "any";
	}

	/**
	 *
	 * @return {boolean}
	 */
	isObjectLike(): boolean
	{
		return this.isObjectLiteral() || this.isClass() || this.isInterface();
	}

	/**
	 * Determines whether the object represented by the current Type is an Enum.
	 * @return {boolean}
	 */
	isEnum(): boolean
	{
		return this.kind == TypeKind.Enum;
	}

	/**
	 * Returns information about the enumerable elements.
	 */
	getEnum(): EnumInfo | undefined
	{
		if (!this.isEnum())
		{
			return undefined;
		}

		const entries: Array<readonly [enumeratorName: string, value: any]> = this.types
			?.map(type => Object.freeze<readonly [enumeratorName: string, value: any]>([type.name, type.literalValue])) || [];

		return {
			getValues(): any[]
			{
				return entries.map(entry => entry[1]);
			},
			getEntries(): Array<readonly [enumeratorName: string, value: any]>
			{
				return entries.slice();
			},
			getEnumerators(): string[]
			{
				return entries.map(entry => entry[0]);
			}
		};
	}

	/**
	 * Constructor function in case Type is class
	 */
	getCtor(): Promise<{ new(...args: any[]): any } | undefined>
	{
		return this._ctor?.() ?? Promise.resolve(undefined);
	}

	/**
	 * Returns array of type parameters.
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParameters.slice();
	}

	/**
	 * Returns type arguments in case of generic type
	 */
	getTypeArguments(): ReadonlyArray<Type>
	{
		return this._typeArgs.slice();
	}

	/**
	 * Returns constructor description when Type is a class
	 */
	getConstructors(): ReadonlyArray<Constructor> | undefined
	{
		if (!this.isClass())
		{
			return undefined;
		}

		return this._constructors.slice();
	}

	/**
	 * Returns array of properties
	 */
	getProperties(): ReadonlyArray<Property>
	{
		return this._properties.slice();
	}

	/**
	 * Returns array of methods
	 */
	getMethods(): ReadonlyArray<Method>
	{
		return this._methods.slice();
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<Decorator>
	{
		return this._decorators.slice();
	}

	/**
	 * Returns object with all methods and properties from current Type and all methods and properties inherited from base types and interfaces to this Type.
	 * @return {{properties: {[p: string]: Property}, methods: {[p: string]: Method}}}
	 */
	flattenInheritedMembers(): {
		properties: { [propertyName: string]: Property },
		methods: { [methodName: string]: Method }
	}
	{
		return flatten(this);
	}

	/**
	 * Determines whether the class represented by the current Type derives from the class represented by the specified Type
	 * @param {Type} classType
	 */
	isSubclassOf(classType: Type): boolean
	{
		if (!classType.isClass())
		{
			// throw new Error("Argument 'classType' must be Type representing a class.");
			return false;
		}

		return this.isClass() && !!this.baseType && (this.baseType.is(classType) || this.baseType.isSubclassOf(classType));
	}

	/**
	 * Determines whether the current Type derives from the specified Type
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean
	{
		return this.is(targetType)
			|| this.baseType?.isAssignableTo(targetType)
			|| this.interface?.isAssignableTo(targetType)
			|| false;
	}

	/**
	 * Determines whether the Object represented by the current Type is structurally compatible and assignable to the Object represented by the specified Type
	 * @param {Type} target
	 * @return {boolean}
	 * @private
	 */
	isStructurallyAssignableTo(target: Type)
	{
		if (!this.isObjectLike() || !target.isObjectLike())
		{
			return false;
		}

		const currentMembers = this.flattenInheritedMembers();
		const currentProperties = Object.values(currentMembers.properties);
		const currentMethods = Object.values(currentMembers.methods);

		const targetMembers = target.flattenInheritedMembers();
		const targetProperties = Object.values(targetMembers.properties);
		const targetMethods = Object.values(targetMembers.methods);

		// All the target properties are required (may be optional), so all of them must be present in current Type.. to be assignable
		return targetProperties.every(targetProperty =>
					targetProperty.optional || currentProperties.some(currentProperty =>
						currentProperty.name == targetProperty.name
						&& currentProperty.type.isAssignableTo(targetProperty.type)
					)
			)
			// same for methods. All targets methods must be present in current Type (methods are matched by name and parameters' types)
			&& targetMethods.every(targetMethod =>
					targetMethod.optional || currentMethods.some(currentMethod => {
						const currentMethodParameters = currentMethod.getParameters();

						return currentMethod.name == targetMethod.name
							&& targetMethod.getParameters().every((targetMethodParam, i) => {
								const currentMethodParam: MethodParameter | undefined = currentMethodParameters[i];

								if (currentMethodParam == undefined)
								{
									return targetMethodParam.optional;
								}

								return currentMethodParam.type.isAssignableTo(targetMethodParam.type);
							});
					})
			);
	}

	/**
	 * Determines whether an instance of the current Type can be assigned to an instance of the specified Type.
	 * @description This is fulfilled by derived types or compatible types.
	 * @param target
	 */
	isAssignableTo(target: Type): boolean
	{
		if (this.isAny() || target.isAny())
		{
			return true;
		}

		// Container types check
		if (this.kind == TypeKind.Container || target.kind == TypeKind.Container)
		{
			// target type is not container but source is => not assignable
			if (target.kind != TypeKind.Container)
			{
				return false;
			}

			// Source is not container, but it can be subtype
			if (this.kind != TypeKind.Container)
			{
				return target.types?.some(targetType => this.isAssignableTo(targetType)) || false;
			}

			// -- both types are container

			// containers' types do not match (union vs intersection)
			if (!(this.isUnion() == target.isUnion() && this.isIntersection() == target.isIntersection()))
			{
				return false;
			}

			return this.types?.every(thisType => target.types?.some(targetType => thisType.isAssignableTo(targetType))) || false;
		}

		// Both must be array or not
		if (this.isArray() != target.isArray())
		{
			return false;
		}

		// It is array. Type of array must match.
		if (this.isArray())
		{
			return this.getTypeArguments()[0].isDerivedFrom(target.getTypeArguments()[0])
				// anonymous type check
				|| this.isStructurallyAssignableTo(target.getTypeArguments()[0])
				|| false;
		}

		return this.isDerivedFrom(target)
			// anonymous type check
			|| this.isStructurallyAssignableTo(target)
			|| false;
	}

	/**
	 * Returns string representation of the type.
	 */
	toString(): string
	{
		return `{${TypeKind[this.kind]} ${this.name} (${this.fullName})}`;
	}
}

/**
 * @internal
 */
export class TypeActivator extends Type
{
}