import * as ts          from "typescript";
import {TypeKind, Type} from "tst-reflect";

/**
 * @internal
 */
export type GetTypeCall = ts.CallExpression;

/**
 * @internal
 */
export interface SourceFileContext
{
	typesProperties: { [typeId: number]: ts.ObjectLiteralExpression };
	visitor: ts.Visitor;
	getTypeIdentifier?: ts.Identifier;
}

/**
 * @internal
 */
export interface ParameterDescriptionSource
{
	n: string;
	t: GetTypeCall
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
	params: Array<ParameterDescriptionSource>
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
	 * Constructors
	 */
	ctors?: Array<ConstructorDescriptionSource>;

	/**
	 * Properties
	 */
	props?: Array<PropertyDescriptionSource>

	/**
	 * Decorators
	 */
	decs?: Array<DecoratorDescriptionSource>

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
}