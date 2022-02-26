// noinspection JSUnusedGlobalSymbols

import Metadata    from "./Metadata";
import {
	AsyncCtorReference,
	ConditionInfo,
	ConstructorInfo,
	DecoratorInfo,
	EnumInfo,
	GenericInfo,
	IndexedAccessInfo,
	MethodInfo,
	ModuleIdentifier,
	ParameterInfo,
	PropertyInfo,
	SyncCtorReference,
	TypeIdentifier,
	TypeReference
} from "./declarations";
import {
	LiteralTypeKinds,
	PrimitiveTypeKinds,
	TypeKind
}                  from "./enums";
import { Module }  from "./Module";
import { flatten } from "./utils/flatten";

export interface TypeInitializer
{
	id?: TypeIdentifier;
	kind: TypeKind;
	name: string;
	module: ModuleIdentifier;
	fullName?: string;
	exported?: boolean;

	ctor?: AsyncCtorReference;
	ctorSync?: SyncCtorReference;

	decorators?: Array<DecoratorInfo>;
	properties?: Array<PropertyInfo>;
	constructors?: Array<ConstructorInfo>;
	methods?: Array<MethodInfo>;

	value?: any;
	condition?: ConditionInfo;
	indexedAccess?: IndexedAccessInfo;
	baseType?: TypeReference;
	interface?: TypeReference;

	typeParameters?: Array<TypeReference>;
	types?: Array<TypeReference>;
	typeArgs?: Array<TypeReference>;
}

const NID = Module.Native.id;

/**
 * Object representing TypeScript type in memory
 */
export class Type
{
	public static readonly Any: Type = new Type({ name: "any", kind: TypeKind.Any, module: NID });
	public static readonly Unknown: Type = new Type({ name: "unknown", kind: TypeKind.Unknown, module: NID });
	public static readonly Void: Type = new Type({ name: "void", kind: TypeKind.Void, module: NID });
	public static readonly Never: Type = new Type({ name: "never", kind: TypeKind.Never, module: NID });
	public static readonly Null: Type = new Type({ name: "null", kind: TypeKind.Null, module: NID });
	public static readonly Undefined: Type = new Type({ name: "undefined", kind: TypeKind.Undefined, module: NID });
	public static readonly Object: Type = new Type({ name: "Object", kind: TypeKind.Object, module: NID });
	public static readonly String: Type = new Type({ name: "String", kind: TypeKind.String, module: NID });
	public static readonly Number: Type = new Type({ name: "Number", kind: TypeKind.Number, module: NID });
	public static readonly BigInt: Type = new Type({ name: "BigInt", kind: TypeKind.BigInt, module: NID });
	public static readonly Boolean: Type = new Type({ name: "Boolean", kind: TypeKind.Boolean, module: NID });
	public static readonly Date: Type = new Type({ name: "Date", kind: TypeKind.Date, module: NID });
	public static readonly Symbol: Type = new Type({ name: "Symbol", kind: TypeKind.Symbol, module: NID });
	public static readonly RegExp: Type = new Type({ name: "RegExp", kind: TypeKind.RegExp, module: NID });
	public static readonly Int8Array: Type = new Type({ name: "Int8Array", kind: TypeKind.Int8Array, module: NID });
	public static readonly Uint8Array: Type = new Type({ name: "Uint8Array", kind: TypeKind.Uint8Array, module: NID });
	public static readonly Uint8ClampedArray: Type = new Type({ name: "Uint8ClampedArray", kind: TypeKind.Uint8ClampedArray, module: NID });
	public static readonly Int16Array: Type = new Type({ name: "Int16Array", kind: TypeKind.Int16Array, module: NID });
	public static readonly Uint16Array: Type = new Type({ name: "Uint16Array", kind: TypeKind.Uint16Array, module: NID });
	public static readonly Int32Array: Type = new Type({ name: "Int32Array", kind: TypeKind.Int32Array, module: NID });
	public static readonly Uint32Array: Type = new Type({ name: "Uint32Array", kind: TypeKind.Uint32Array, module: NID });
	public static readonly Float32Array: Type = new Type({ name: "Float32Array", kind: TypeKind.Float32Array, module: NID });
	public static readonly Float64Array: Type = new Type({ name: "Float64Array", kind: TypeKind.Float64Array, module: NID });
	public static readonly BigInt64Array: Type = new Type({ name: "BigInt64Array", kind: TypeKind.BigInt64Array, module: NID });
	public static readonly BigUint64Array: Type = new Type({ name: "BigUint64Array", kind: TypeKind.BigUint64Array, module: NID });

	private _module?: Module;
	private _baseType?: Type;
	private _interface?: Type;
	private _types?: Array<Type>;
	private _typeArgs?: Array<Type>;
	private _typeParameters?: Array<Type>;
	private _enum?: EnumInfo;
	private _flattened?: { properties: { [p: string]: PropertyInfo }; methods: { [p: string]: MethodInfo } };

	private readonly _id: TypeIdentifier;
	private readonly _ctor?: AsyncCtorReference;
	private readonly _ctorSync?: SyncCtorReference;
	private readonly _kind: TypeKind;
	private readonly _name: string;
	private readonly _fullName: string;
	private readonly _exported: boolean;

	private readonly _properties: Array<PropertyInfo>;
	private readonly _methods: Array<MethodInfo>;
	private readonly _decorators: Array<DecoratorInfo>;
	private readonly _constructors: Array<ConstructorInfo>;

	private readonly _value?: any;
	private readonly _condition?: ConditionInfo;
	private readonly _indexedAccess?: IndexedAccessInfo;
	private readonly _generic?: GenericInfo;

	private readonly _moduleReference: ModuleIdentifier;
	private readonly _baseTypeReference?: TypeReference;
	private readonly _interfaceReference?: TypeReference;

	private readonly _typesReference: Array<TypeReference>;
	private readonly _typeArgsReference: Array<TypeReference>;
	private readonly _typeParametersReference: Array<TypeReference>;

	/**
	 * Type identifier.
	 */
	get id(): TypeIdentifier
	{
		return this._id;
	}

	// /**
	//  * Setter to change IDs of Native types to Ids generated by transformer.
	//  * @internal
	//  */
	// set id(newId: TypeReference)
	// {
	// 	(this as any)._id = newId;
	// }

	/**
	 * @param initializer
	 */
	constructor(initializer: TypeInitializer)
	{
		this._id = initializer.id ?? Symbol();
		this._ctor = initializer.ctor;
		this._ctorSync = initializer.ctorSync;
		this._kind = initializer.kind;
		this._name = initializer.name;
		this._fullName = initializer.fullName || "";
		this._moduleReference = initializer.module;
		this._exported = initializer.exported || false;

		this._properties = initializer.properties || [];
		this._methods = initializer.methods || [];
		this._decorators = initializer.decorators || [];
		this._constructors = initializer.constructors || [];

		this._value = initializer.value;
		this._condition = initializer.condition;
		this._indexedAccess = initializer.indexedAccess;

		this._baseTypeReference = initializer.baseType;
		this._interfaceReference = initializer.interface;

		this._typesReference = initializer.types || [];
		this._typeParametersReference = initializer.typeParameters || [];
		this._typeArgsReference = initializer.typeArgs || [];
	}

	/**
	 * Module which declare type represented by the this Type instance.
	 */
	get module(): Module
	{
		return this._module ?? (this._module = Metadata.resolveModule(this._moduleReference));
	}

	/**
	 * Information about generic conditional type.
	 */
	get condition(): ConditionInfo | undefined
	{
		return this._condition;
	}

	/**
	 * Information about generic type.
	 */
	get generic(): GenericInfo | undefined
	{
		return this._generic;
	}

	/**
	 * Information about indexed access type.
	 */
	get indexedAccess(): IndexedAccessInfo | undefined
	{
		return this._indexedAccess;
	}

	/**
	 * Base type
	 * @description Base type from which this type extends from or undefined if type is Object.
	 */
	get baseType(): Type | undefined
	{
		if (!this._baseTypeReference)
		{
			return undefined;
		}

		return this._baseType ?? (this._baseType = Metadata.resolveType(this._baseTypeReference));
	}

	/**
	 * Interface which this type implements
	 */
	get interface(): Type | undefined
	{
		if (!this._interfaceReference)
		{
			return undefined;
		}

		return this._interface ?? (this._interface = Metadata.resolveType(this._interfaceReference));
	}

	/**
	 * Full qualified name of the type.
	 * @description Contains file path based to project root.
	 */
	get fullName(): string
	{
		return this._fullName;
	}

	/**
	 * Name of the type.
	 */
	get name(): string
	{
		return this._name;
	}

	/**
	 * Kind of the type.
	 */
	get kind(): TypeKind
	{
		return this._kind;
	}

	/**
	 * Type is exported from its Module.
	 */
	get exported(): boolean
	{
		return this._exported;
	}

	/**
	 * Underlying value in case of literal type.
	 */
	get value(): any
	{
		return this._value;
	}

	/**
	 * Returns true if types are equal.
	 * @param target
	 */
	is(target: Type)
	{
		if (this === Type.Unknown || target === Type.Unknown)
		{
			return false;
		}

		return target != undefined && this._fullName == target._fullName && !!this._fullName;
	}

	/**
	 * Returns a value indicating whether the Type is container for unified Types or not.
	 */
	isUnion(): boolean
	{
		return this.kind === TypeKind.Union;
	}

	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not.
	 */
	isIntersection(): boolean
	{
		return this.kind === TypeKind.Intersection;
	}

	/**
	 * Returns true whether current Type is instantiable.
	 */
	isInstantiable(): boolean
	{
		return this.isClass();
	}

	/**
	 * Returns a value indicating whether the Type is a class or not.
	 */
	isClass(): boolean
	{
		return this.kind == TypeKind.Class;
	}

	/**
	 * Returns a value indicating whether the Type is a interface or not.
	 */
	isInterface(): boolean
	{
		return this.kind == TypeKind.Interface;
	}

	/**
	 * Returns true whether the Type is a Promise.
	 */
	isPromise(): boolean
	{
		return this.kind === TypeKind.Promise;
	}

	/**
	 * Returns a value indicating whether the Type is an literal or not.
	 */
	isLiteral(): boolean
	{
		return LiteralTypeKinds.indexOf(this.kind) !== -1;
	}

	/**
	 * Returns a value indicating whether the Type is an object literal or not.
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
	 * Check if this is a primitive type ("string", "number", "boolean" etc.).
	 */
	isPrimitive(): boolean
	{
		return PrimitiveTypeKinds.indexOf(this.kind) !== -1;
	}

	/**
	 * Check if this type is a string.
	 */
	isString(): boolean
	{
		return this.kind === TypeKind.String || this.kind === TypeKind.StringLiteral || this.kind === TypeKind.TemplateLiteral;
	}

	/**
	 * Check if this type is a number.
	 */
	isNumber(): boolean
	{
		return this.kind === TypeKind.Number || this.kind === TypeKind.NumberLiteral;
	}

	/**
	 * Check if this type is a bigint.
	 */
	isBigInt(): boolean
	{
		return this.kind === TypeKind.BigInt || this.kind === TypeKind.BigIntLiteral;
	}

	/**
	 * Check if this type is a boolean.
	 */
	isBoolean(): boolean
	{
		return this.kind === TypeKind.Boolean || this.kind === TypeKind.BooleanLiteral;
		// return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "boolean";
	}

	/**
	 * Check if this type is an array.
	 */
	isArray(): boolean
	{
		return this.kind === TypeKind.Array || this.kind === TypeKind.Tuple;
		// return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name == "Array";
	}

	/**
	 * Check if this type is a Tuple.
	 */
	isTuple(): boolean
	{
		return this.kind === TypeKind.Tuple;
	}

	/**
	 * Check if this type is an "any".
	 */
	isAny(): boolean
	{
		return this.kind === TypeKind.Any;
	}

	/**
	 * Check if this type is an "never".
	 */
	isNever(): boolean
	{
		return this.kind === TypeKind.Never;
	}

	/**
	 * Check if this type is an "void".
	 */
	isVoid(): boolean
	{
		return this.kind === TypeKind.Void;
	}

	/**
	 * Check if this type is an "undefined".
	 */
	isUndefined(): boolean
	{
		return this.kind === TypeKind.Undefined;
	}

	/**
	 * Check if this type is an "null".
	 */
	isNull(): boolean
	{
		return this.kind === TypeKind.Null;
	}

	/**
	 * Check if this type is an "unknown".
	 */
	isUnknown(): boolean
	{
		return this.kind === TypeKind.Unknown;
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

		return this._enum ?? (this._enum = new EnumInfo(this));
	}

	/**
	 * Constructor function in case Type is class.
	 */
	getCtor(): Promise<{ new(...args: any[]): any } | undefined>
	{
		return this._ctor?.() ?? Promise.resolve(undefined);
	}

	/**
	 * List of underlying types in case Type is union or intersection.
	 */
	getTypes(): ReadonlyArray<Type>
	{
		if (!this._typesReference)
		{
			return [];
		}

		return (this._types ?? (this._types = this._typesReference.map(type => Metadata.resolveType(type)))).slice();
	}

	/**
	 * Returns array of type parameters.
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		if (!this._typeParametersReference)
		{
			return [];
		}

		return (this._typeParameters ?? (this._typeParameters = this._typeParametersReference.map(type => Metadata.resolveType(type)))).slice();
	}

	/**
	 * Returns type arguments in case of generic type.
	 */
	getTypeArguments(): ReadonlyArray<Type>
	{
		if (!this._typeArgsReference)
		{
			return [];
		}

		return (this._typeArgs ?? (this._typeArgs = this._typeArgsReference.map(type => Metadata.resolveType(type)))).slice();
	}

	/**
	 * Returns constructor description when Type is a class.
	 */
	getConstructors(): ReadonlyArray<ConstructorInfo> | undefined
	{
		if (!this.isClass())
		{
			return undefined;
		}

		return this._constructors.slice();
	}

	/**
	 * Returns array of properties.
	 */
	getProperties(): ReadonlyArray<PropertyInfo>
	{
		return this._properties.slice();
	}

	/**
	 * Returns array of methods.
	 */
	getMethods(): ReadonlyArray<MethodInfo>
	{
		return this._methods.slice();
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators.slice();
	}

	/**
	 * Returns object with all methods and properties from current Type and all methods and properties inherited from base types and interfaces to this Type.
	 */
	flattenInheritedMembers(): {
		properties: { [propertyName: string]: PropertyInfo },
		methods: { [methodName: string]: MethodInfo }
	}
	{
		return this._flattened ?? (this._flattened = flatten(this));
	}

	/**
	 * Determines whether the class represented by the current Type derives from the class represented by the specified Type.
	 * @param {Type} classType
	 */
	isSubclassOf(classType: Type): boolean
	{
		return classType.isClass() && this.isClass() && this.baseType !== undefined && (this.baseType.is(classType) || this.baseType.isSubclassOf(classType));
	}

	/**
	 * Determines whether the current Type derives from the specified Type.
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
	 * Determines whether the Object represented by the current Type is structurally compatible and assignable to the Object represented by the specified Type.
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
								const currentMethodParam: ParameterInfo | undefined = currentMethodParameters[i];

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
		if (this.isUnionOrIntersection() || target.isUnionOrIntersection())
		{
			// target type is not container but source is => not assignable
			if (!target.isUnionOrIntersection())
			{
				return false;
			}

			const targetTypes = target.getTypes();

			// Source is not container, but it can be subtype
			if (!this.isUnionOrIntersection())
			{
				return targetTypes.some(targetType => this.isAssignableTo(targetType)) || false;
			}

			// -- both types are container

			// containers' types do not match (union vs intersection)
			if (!(this.isUnion() == target.isUnion() && this.isIntersection() == target.isIntersection()))
			{
				return false;
			}

			return this.getTypes().every(thisType => targetTypes.some(targetType => thisType.isAssignableTo(targetType))) || false;
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

export const NativeTypes: { [typeKind: number]: Type } = {
	[TypeKind.Any]: Type.Any,
	[TypeKind.Unknown]: Type.Unknown,
	[TypeKind.Void]: Type.Void,
	[TypeKind.Never]: Type.Never,
	[TypeKind.Null]: Type.Null,
	[TypeKind.Undefined]: Type.Undefined,
	[TypeKind.Object]: Type.Object,
	[TypeKind.String]: Type.String,
	[TypeKind.Number]: Type.Number,
	[TypeKind.BigInt]: Type.BigInt,
	[TypeKind.Boolean]: Type.Boolean,
	[TypeKind.Date]: Type.Date,
	[TypeKind.Symbol]: Type.Symbol,
	[TypeKind.RegExp]: Type.RegExp,
	[TypeKind.Int8Array]: Type.Int8Array,
	[TypeKind.Uint8Array]: Type.Uint8Array,
	[TypeKind.Uint8ClampedArray]: Type.Uint8ClampedArray,
	[TypeKind.Int16Array]: Type.Int16Array,
	[TypeKind.Uint16Array]: Type.Uint16Array,
	[TypeKind.Int32Array]: Type.Int32Array,
	[TypeKind.Uint32Array]: Type.Uint32Array,
	[TypeKind.Float32Array]: Type.Float32Array,
	[TypeKind.Float64Array]: Type.Float64Array,
	[TypeKind.BigInt64Array]: Type.BigInt64Array,
	[TypeKind.BigUint64Array]: Type.BigUint64Array,
} as const;