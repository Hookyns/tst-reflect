import * as ts          from "typescript";
import {
	TypeKind,
	AccessModifier,
	Accessor
}                       from "tst-reflect";
import type { Context } from "./contexts/Context";

/**
 * @internal
 */
export type GetTypeCall = ts.CallExpression;

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.Node | undefined;

/**
 * @internal
 */
export type MetadataEntry = [number, ts.ObjectLiteralExpression];

/**
 * @internal
 */
export type MetadataLibrary = Array<MetadataEntry>;

/**
 * @internal
 */
export type CtorsLibrary = Array<ts.EntityName | ts.DeclarationName>;

/**
 * @internal
 */
export interface ParameterDescriptionSource
{
	// Name of the parameter
	n: string;
	// Index of the parameter in the method
	i?: number;
	// Is optional parameter?
	// method(param?:string)
	o?: boolean;
	t: GetTypeCall|undefined;
}

/**
 * @internal
 */
export interface PropertyDescriptionSource
{
	/**
	 * Name of the property
	 */
	n: string;

	/**
	 * Type of the property
	 */
	t: GetTypeCall;

	/**
	 * Decorators
	 */
	d?: Array<DecoratorDescriptionSource>;

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

	/**
	 * Optional
	 */
	o?: boolean;
}

/**
 * @internal
 */
export interface DecoratorDescriptionSource
{
	n: string;
	fn?: string;
}

/**
 * @internal
 */
export interface MethodDescriptionSource
{
	/**
	 * Method name
	 */
	n: string;

	/**
	 * Parameters
	 */
	params?: Array<ParameterDescriptionSource>;

	/**
	 * Return type
	 */
	rt: GetTypeCall;

	/**
	 * Decorators
	 */
	d?: Array<DecoratorDescriptionSource>;

	/**
	 * Generic type parameters
	 */
	tp?: Array<GetTypeCall>;

	/**
	 * Optional method
	 */
	o: boolean;

	/**
	 * Access modifier
	 */
	am: AccessModifier;
}

/**
 * @internal
 */
export interface ConstructorDescriptionSource
{
	params: Array<ParameterDescriptionSource>;
}

/**
 * @internal
 */
interface ConditionalTypeDescriptionSource
{
	/**
	 * Extends type
	 */
	e: GetTypeCall;

	/**
	 * True type
	 */
	tt: GetTypeCall;

	/**
	 * False type
	 */
	ft: GetTypeCall;
}

/**
 * @internal
 */
interface IndexedAccessTypeDescriptionSource
{
	/**
	 * Object type
	 */
	ot: GetTypeCall;

	/**
	 * Index type
	 */
	it: GetTypeCall;
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

	/**
	 * Kind
	 */
	k: TypeKind;

	/**
	 * Value of literal type in case that kind is {@link TypeKind.LiteralType}
	 */
	v?: string | number | boolean;

	/**
	 * Constructors
	 */
	ctors?: Array<ConstructorDescriptionSource>;

	/**
	 * Properties
	 */
	props?: Array<PropertyDescriptionSource>;

	/**
	 * Methods
	 */
	meths?: Array<MethodDescriptionSource>;

	/**
	 * Decorators
	 */
	decs?: Array<DecoratorDescriptionSource>;

	/**
	 * Union
	 */
	union?: boolean;

	/**
	 * Intersection
	 */
	inter?: boolean;

	/**
	 * Containing types
	 */
	types?: Array<GetTypeCall>;

	/**
	 * Constructor return function
	 */
	ctor?: ts.ArrowFunction;

	/**
	 * Base type
	 */
	bt?: GetTypeCall;

	/**
	 * Interface
	 */
	iface?: GetTypeCall;

	/**
	 * Type arguments
	 * @description In case of generic type description
	 */
	args?: Array<GetTypeCall>;

	/**
	 * Type parameters
	 */
	tp?: Array<GetTypeCall>;

	/**
	 * Constraining type
	 */
	con?: GetTypeCall;

	/**
	 * Default type
	 */
	def?: GetTypeCall;

	/**
	 * Conditional type description
	 */
	ct?: ConditionalTypeDescriptionSource;

	/**
	 * Indexed access type description
	 */
	iat?: IndexedAccessTypeDescriptionSource;
}

/**
 * @internal
 */
export type TypeDescriptionResult = {
	/**
	 * Type is successfully described
	 */
	ok: true;

	/**
	 * Type description
	 */
	typeDescription: TypePropertiesSource;
} | {
	ok: false
};
