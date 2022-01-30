/* eslint-disable */

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
	 * Some subtype of string, number, boolean
	 * @example <caption>type Foo = "hello world" | "hello"</caption>
	 * String "hello world" is literal type and it is subtype of string.
	 *
	 * <caption>type TheOnlyTrue = true;</caption>
	 * Same as true is literal type and it is subtype of boolean.
	 */
	LiteralType,

	/**
	 * Fixed lenght arrays literals
	 * @example <caption>type Coords = [x: number, y: number, z: number];</caption>
	 */
	Tuple,

	/**
	 * Generic parameter type
	 * @description Represent generic type parameter of generic types. Eg. it is TType of class Animal<TType> {}.
	 */
	TypeParameter,

	/**
	 * Conditional type
	 */
	ConditionalType = 9,

	/**
	 * Indexed access type
	 * @description Eg. get<K extends keyof TypeKind>(key: K): ==>> TypeKind[K] <<==
	 */
	IndexedAccess = 10,

	/**
	 * Typescript "module"
	 * @description Value module or namespace module
	 */
	Module = 11,

	/**
	 * Specific method used as type
	 */
	Method = 12,
}

export enum Accessor
{
	None,
	Getter,
	Setter
}

export enum AccessModifier
{
	Private,
	Protected,
	Public
}

/**
 * @internal
 */
export interface ConditionalTypeDescription
{
	/**
	 * Extends type
	 */
	e: Type;

	/**
	 * True type
	 */
	tt: Type;

	/**
	 * False type
	 */
	ft: Type;
}

export interface ConditionalType
{
	/**
	 * Extends type
	 */
	extends: Type;

	/**
	 * True type
	 */
	trueType: Type;

	/**
	 * False type
	 */
	falseType: Type;
}

/**
 * @internal
 */
export interface IndexedAccessTypeDescription
{
	/**
	 * Object type
	 */
	ot: Type;

	/**
	 * Index type
	 */
	it: Type;
}

export interface IndexedAccessType
{
	/**
	 * Object type
	 */
	objectType: Type;

	/**
	 * Index type
	 */
	indexType: Type;
}

/**
 * @internal
 */
export interface ParameterDescription
{
	/**
	 * Name of the parameter
	 */
	n: string;

	/**
	 * Type of the parameter
	 */
	t: Type;

	/**
	 * Optional parameter
	 */
	o: boolean;
}

/**
 * @internal
 */
export interface PropertyDescription
{
	/**
	 * Name of the property
	 */
	n: string;

	/**
	 * Property type
	 */
	t: Type;

	/**
	 * Optional property
	 */
	o: boolean;

	/**
	 * Decorators
	 */
	d?: Array<DecoratorDescription>;

	/**
	 * Access modifier
	 */
	am?: AccessModifier;

	/**
	 * Accessor
	 */
	acs?: Accessor;

	/**
	 * Readonly
	 */
	ro?: boolean;
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
	 * Optional property
	 */
	optional: boolean;

	/**
	 * Property decorators
	 */
	decorators: ReadonlyArray<Decorator>;

	/**
	 * Access modifier
	 */
	accessModifier: AccessModifier;

	/**
	 * Accessor
	 */
	accessor: Accessor;

	/**
	 * Readonly
	 */
	readonly: boolean;
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
	type: Type;

	/**
	 * Parameter is optional
	 */
	optional: boolean;
}

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
	tp?: Array<Type>;

	/**
	 * Optional method
	 */
	o: boolean;

	/**
	 * Access modifier
	 */
	am: AccessModifier;
}

const Mapper = {
	/**
	 * @internal
	 * @param d
	 */
	mapDecorators(d: DecoratorDescription): Decorator
	{
		return ({ name: d.n, fullName: d.fn });
	},

	/**
	 * @internal
	 * @param p
	 */
	mapProperties(p: PropertyDescription): Property
	{
		return ({
			name: p.n,
			type: resolveLazyType(p.t),
			decorators: p.d?.map(Mapper.mapDecorators) || [],
			optional: p.o,
			accessModifier: p.am ?? AccessModifier.Public,
			accessor: p.acs ?? Accessor.None,
			readonly: p.ro ?? false
		});
	},

	/**
	 * @internal
	 * @param c
	 */
	mapConstructors(c: ConstructorDescription): Constructor
	{
		return Reflect.construct(Constructor, [c], ConstructorActivator);
	},

	/**
	 * @internal
	 * @param p
	 * @return {{name: string, optional: boolean, type: Type}}
	 */
	mapMethodParameters(p: ParameterDescription): MethodParameter
	{
		return ({
			name: p.n,
			type: resolveLazyType(p.t),
			optional: p.o
		});
	}
};

export class MethodBase
{
	private readonly _parameters: Array<MethodParameter>;

	/**
	 * Internal constructor
	 * @internal
	 */
	protected constructor(params: Array<ParameterDescription>)
	{
		this._parameters = params.map(Mapper.mapMethodParameters);
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
	private readonly _returnType: Type;
	private readonly _optional: boolean;
	private readonly _typeParameters: Array<Type>;
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
		return this._returnType;
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
		this._typeParameters = description.tp?.map(t => resolveLazyType(t)) || [];
		this._returnType = resolveLazyType(description.rt);
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
		return this._typeParameters.slice();
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<Decorator>
	{
		return this._decorators.slice();
	}
}

class MethodActivator extends Method
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

class ConstructorActivator extends Constructor
{
}

/**
 * This data is not set when the config mode is set to "universal"
 * @internal
 */
export interface ConstructorImportDescription
{
	/**
	 * This is the name of the actual declaration
	 * In the example above, this would be "SomeClass"
	 */
	n: string | undefined;
	/**
	 * The exported name of this constructor from its source file.
	 * For example;
	 * "export class SomeClass {}" would be "SomeClass"
	 * "export default class SomeClass {}" would be "default"
	 */
	en: string | undefined;
	/**
	 * The absolute path of the source file for this constructor
	 */
	srcPath: string | undefined;
	/**
	 * The absolute path for the javascript file of this constructor
	 */
	outPath: string | undefined;
}

/**
 * Method details
 */
export class ConstructorImport
{
	private readonly _name: string | undefined;
	private readonly _exportName: string | undefined;
	private readonly _sourcePath: string | undefined;
	private readonly _outPath: string | undefined;

	/**
	 * @internal
	 */
	constructor(description: ConstructorImportDescription | undefined)
	{
		if (new.target != ConstructorImportActivator)
		{
			throw new Error("You cannot create instance of Method manually!");
		}

		if (!description)
		{
			return;
		}
		this._name = description.n;
		this._exportName = description.en;
		this._sourcePath = description.srcPath;
		this._outPath = description.outPath;
	}

	/**
	 * This is the name of the actual declaration
	 * In the example above, this would be "SomeClass"
	 */
	get name(): string | undefined
	{
		return this._name;
	}

	/**
	 * The exported name of this constructor from its source file.
	 * For example;
	 * "export class SomeClass {}" would be "SomeClass"
	 * "export default class SomeClass {}" would be "default"
	 */
	get exportName(): string | undefined
	{
		return this._exportName;
	}

	/**
	 * The absolute path of the source file for this constructor
	 */
	get sourcePath(): string | undefined
	{
		return this._sourcePath;
	}

	/**
	 * The absolute path for the javascript file of this constructor
	 */
	get outPath(): string | undefined
	{
		return this._outPath;
	}
}

class ConstructorImportActivator extends ConstructorImport
{
}

/**
 * @internal
 */
export interface TypeProperties
{
	/**
	 * Type name
	 */
	n?: string;

	/**
	 * Type fullname
	 */
	fn?: string;

	/**
	 * TypeKind
	 */
	k: TypeKind;

	/**
	 * Constructors
	 */
	ctors?: Array<ConstructorDescription>;

	/**
	 * Properties
	 */
	props?: Array<PropertyDescription>;

	/**
	 * Methods
	 */
	meths?: Array<MethodDescription>;

	/**
	 * Decorators
	 */
	decs?: Array<DecoratorDescription>;

	/**
	 * Generic type parameters
	 */
	tp?: Array<Type>;

	/**
	 * Is union type
	 */
	union?: boolean;

	/**
	 * Is intersection type
	 */
	inter?: boolean;

	/**
	 * Unified or intersecting types
	 */
	types?: Array<Type>;

	/**
	 * Some path/export information about the module it-self. Will help dynamically import modules.
	 * This data is not set when the config mode is set to "universal"
	 */
	ctorDesc?: ConstructorImportDescription;

	/**
	 * Ctor getter
	 */
	ctor?: () => Function;

	/**
	 * Extended base type
	 */
	bt?: Type;

	/**
	 * Implemented interface
	 */
	iface?: Type;

	/**
	 * Literal value
	 */
	v?: any;

	/**
	 * Type arguments
	 */
	args?: Array<Type>;

	/**
	 * Default type
	 */
	def?: Type;

	/**
	 * Constraining type
	 */
	con?: Type;

	/**
	 * Conditional type description
	 */
	ct?: ConditionalTypeDescription;

	/**
	 * Indexed access type description
	 */
	iat?: IndexedAccessTypeDescription;
}

const typesMetaCache: { [key: number]: Type } = {};

/**
 * Object representing TypeScript type in memory
 */
export class Type
{
	public static readonly Object: Type;
	/** @internal */
	private _ctor?: () => Function;
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
	private _types?: Array<Type>;
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
	 * Returns a value indicating whether the Type is container for unified Types or not
	 */
	get union(): boolean
	{
		return this._isUnion;
	}

	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not
	 */
	get intersection(): boolean
	{
		return this._isIntersection;
	}

	/**
	 * List of underlying types in case Type is union or intersection
	 */
	get types(): ReadonlyArray<Type> | undefined
	{
		return this._types?.slice();
	}

	/**
	 * Constructor function in case Type is class
	 */
	get ctor(): Function | undefined
	{
		return this._ctor?.();
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
		this._methods = description.meths?.map(m => Reflect.construct(Method, [m], MethodActivator)) || [];
		this._decorators = description.decs?.map(Mapper.mapDecorators) || [];
		this._typeParameters = description.tp?.map(t => resolveLazyType(t)) || [];
		this._ctor = description.ctor;
		this._ctorDesc = Reflect.construct(ConstructorImport, [description.ctorDesc], ConstructorImportActivator);
		this._baseType = resolveLazyType(description.bt) ?? (description.ctor == Object ? undefined : Type.Object);
		this._interface = resolveLazyType(description.iface);
		this._isUnion = description.union || false;
		this._isIntersection = description.inter || false;
		this._types = description.types?.map(t => resolveLazyType(t));
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
	 * Returns true if types are equals
	 * @param type
	 */
	is(type: Type)
	{
		return type != undefined && this._fullName == type._fullName && !!this._fullName;
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
		return this.union || this.intersection;
	}

	/**
	 * Check if this is a native type("string", "number", "boolean" etc.)
	 */
	isNative(): boolean
	{
		return this.kind === TypeKind.Native;
	}

	/**
	 * Check if this type is a string
	 */
	isString(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "string";
	}

	/**
	 * Check if this type is a number
	 */
	isNumber(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "number";
	}

	/**
	 * Check if this type is a boolean
	 */
	isBoolean(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "boolean";
	}

	/**
	 * Check if this type is an array
	 */
	isArray(): boolean
	{
		return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "Array";
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
	 * @private
	 * @internal
	 */
	private flattenInheritedMembers(): {
		properties: { [propertyName: string]: Property },
		methods: { [methodName: string]: Method }
	}
	{
		const interfaceMembers = this.interface?.flattenInheritedMembers() ?? { properties: {}, methods: {} };
		const baseTypeMembers = this.baseType?.flattenInheritedMembers() ?? { properties: {}, methods: {} };

		const properties = Object.assign(interfaceMembers.properties, baseTypeMembers.properties);
		const methods = Object.assign(interfaceMembers.methods, baseTypeMembers.methods);

		for (let property of this.getProperties())
		{
			properties[property.name] = property;
		}

		for (let method of this.getMethods())
		{
			methods[method.name] = method;
		}

		return {
			properties,
			methods
		};
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
				currentProperties.some(currentProperty =>
						targetProperty.optional || (
							currentProperty.name == targetProperty.name
							&& currentProperty.type.isAssignableTo(targetProperty.type)
						)
				)
			)
			// same for methods. All targets methods must be present in current Type (methods are matched by name and parameters' types)
			&& targetMethods.every(targetMethod =>
				currentMethods.some(currentMethod => {
					const currentMethodParameters = currentMethod.getParameters();

					return targetMethod.optional || (
						currentMethod.name == targetMethod.name
						&& targetMethod.getParameters().every((targetMethodParam, i) => {
							const currentMethodParam: MethodParameter | undefined = currentMethodParameters[i];

							if (currentMethodParam == undefined)
							{
								return targetMethodParam.optional;
							}

							return currentMethodParam.type.isAssignableTo(targetMethodParam.type);
						})
					);
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
		if (target.kind == TypeKind.Native && target.name == "any")
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
			if (!(this.union == target.union && this.intersection == target.intersection))
			{
				return false;
			}

			return this.types?.every(thisType => target.types?.some(targetType => thisType.isAssignableTo(targetType))) || false;
		}

		return this.isDerivedFrom(target)
			// anonymous type check
			|| this.isStructurallyAssignableTo(target)
			|| false;
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
// TODO: Uncomment and use this line. Waiting for TypeScript issue to be resolved. https://github.com/microsoft/TypeScript/issues/46155
// export function getType<T = void>(..._: (T extends void ? ["You must provide a type parameter"] : [])): Type | undefined
/** @internal */
export function getType<T>(description?: TypeProperties | number | string, typeId?: number): Type | undefined
{
	// Return type from storage
	if (typeof description == "number")
	{
		return Type._getTypeMeta(description);
	}

	// Construct Type instance
	if (description && description.constructor === Object)
	{
		const type = Reflect.construct(Type, [], TypeActivator);

		// Store Type if it has ID
		if (typeId)
		{
			Type._storeTypeMeta(typeId, type);
		}

		type.initialize(description);

		return type;
	}

	return undefined;
}

/** @internal */
getType.__tst_reflect__ = true;

/**
 * getType for circular dependencies
 * @internal
 */
getType.lazy = function (typeId: number) {
	return function lazyType() {
		return (getType as any)(typeId);
	};
};

/**
 * @internal
 */
function resolveLazyType(type?: Type | Function)
{
	if (typeof type == "function" && type.name == "lazyType")
	{
		return type();
	}

	return type;
}

/**
 * Class decorator which marks classes to be processed and included in metadata lib file.
 * @reflectDecorator
 */
export function reflect<TType>()
{
	getType<TType>();
	return function <T>(Constructor: { new(...args: any[]): T }) {
	};
}

/**
 * To identify functions by package
 */
export const TYPE_ID_PROPERTY_NAME = "__tst_reflect__";

/**
 * Name of JSDoc comment marking method as it use type of generic parameter.
 */
export const REFLECT_GENERIC_DECORATOR = "reflectGeneric";

/**
 * Name of JSDoc comment marking function as decorator.
 * @type {string}
 */
export const REFLECT_DECORATOR_DECORATOR = "reflectDecorator";

/**
 * Name of the getType() function
 */
export const GET_TYPE_FNC_NAME = "getType";

/**
 * Name of the getType.lazy() function
 * @type {string}
 */
export const GET_TYPE_LAZY_FNC_NAME = "lazy";
