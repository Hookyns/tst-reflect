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
export type PackageInfo = {
	rootDir: string;
	name: string;
}

/**
 * @internal
 */
export type GetTypeCall = ts.CallExpression;

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.VisitResult<ts.Node>;

/**
 * @internal
 */
export type MetadataEntry = [typeId: number, properties: ts.ObjectLiteralExpression, localType: boolean];

/**
 * @internal
 */
export type MetadataLibrary = Array<MetadataEntry>;

/**
 * @internal
 */
export type CtorsLibrary = Array<ts.PropertyAccessExpression>;

/**
 * @internal
 */
export type TypeDescription = {
	/**
	 * Properties of the type
	 */
	properties: TypePropertiesSource,

	/**
	 * Type is not exported
	 */
	localType: boolean
};

/**
 * @internal
 */
export interface ParameterDescriptionSource
{
	/**
	 * Name of the parameter
	 */
	n: string;

	/**
	 * Parameter is optional.
	 * eg. method(param?:string)
	 */
	o?: boolean;

	t: GetTypeCall | undefined;
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
	 * Index key type in case of Index.
	 */
	it?: GetTypeCall;

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
export interface IndexDescriptionSource
{
	/**
	 * Index key type.
	 */
	k?: GetTypeCall;

	/**
	 * Type of the index value.
	 */
	t: GetTypeCall;

	/**
	 * Readonly index.
	 */
	ro?: boolean;
}

/**
 * @internal
 */
export interface DecoratorDescriptionSource
{
	/**
	 * Name of the decorator
	 */
	n: string;

	/**
	 * Full name of the decorator
	 */
	fn?: string;

	/**
	 * List of constant arguments
	 */
	args?: Array<any>;
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
export interface FunctionTypeDescriptionSource
{
	/**
	 * Parameters
	 */
	params?: Array<ParameterDescriptionSource>;

	/**
	 * Return type
	 */
	rt: GetTypeCall;

	/**
	 * Generic type parameters
	 */
	tp?: Array<GetTypeCall>;
}

/**
 * This data is not set when the config mode is set to "universal"
 *
 * @internal
 */
export interface ConstructorImportDescriptionSource
{
	/**
	 * This is the name of the actual declaration
	 * In the example above, this would be "SomeClass"
	 */
	n: string;
	/**
	 * The exported name of this constructor from its source file.
	 * For example;
	 * "export class SomeClass {}" would be "SomeClass"
	 * "export default class SomeClass {}" would be "default"
	 */
	en: string;
	/**
	 * The absolute path of the source file for this constructor
	 */
	srcPath: string;
	/**
	 * The absolute path for the javascript file of this constructor
	 */
	outPath: string;
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
	 * Indexes
	 */
	indxs?: Array<IndexDescriptionSource>;

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
	 * The information required to create the constructor return function at runtime
	 * This data is not set when the config mode is set to "universal"
	 */
	ctorDesc?: ts.ObjectLiteralExpression;

	/**
	 * Function returning Promise to resolve constructor.
	 * @description It reflect tsconfig module.
	 * In case of ESM dynamic import() is generated, otherwise Promise.resolve().
	 */
	ctor?: ts.FunctionExpression;

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

	/**
	 * Function type description.
	 */
	fnc?: FunctionTypeDescriptionSource;

	/**
	 * Type is a generic type.
	 */
	isg?: boolean;

	/**
	 * Generic type definition.
	 */
	gtd?: GetTypeCall;
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
