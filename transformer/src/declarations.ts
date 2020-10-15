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
	ctor?: ts.ArrowFunction;
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
}