import * as ts          from "typescript";
import { TypeKind }     from "tst-reflect";
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
export type CtorsLibrary = Array<ts.EntityName>;

/**
 * @internal
 */
export interface ParameterDescriptionSource
{
	n: string;
	t: GetTypeCall;
}

/**
 * @internal
 */
export interface PropertyDescriptionSource
{
	n: string;
	t: GetTypeCall,
	d?: Array<DecoratorDescriptionSource>
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