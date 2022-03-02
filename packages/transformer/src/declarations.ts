import { TemplateInfoInitializer } from "@rtti/abstract/dist/declarations/TemplateInfo";
import { NativeTypeKind }          from "@rtti/abstract/dist/enums/TypeKind";
import * as ts                     from "typescript";
import type {
	TypeInitializer,
	ModuleReference,
	NativeTypeReference,
	GenericInfoInitializer,
	PropertyInfoInitializer,
	DecoratorInfoInitializer
}                                  from "@rtti/abstract";
import {
	AccessModifier,
	ModuleIdentifier,
	TypeKind,
}                                  from "@rtti/abstract";
import type { Context }            from "./contexts/Context";
import { SourceFileContext }       from "./contexts/SourceFileContext";

/**
 * TypeReference used inside transformer
 */
export type TransformerTypeReference = number | NativeTypeReference;

type BaseTypeProperties =
	Omit<TypeInitializer, "ctor" | "ctorSync" | "id" | "name" | "module" | "kind" | "template" | "constructors" | "generic" | "properties" | "methods" | "decorators">
	& {
	notExported?: true;

	name?: string;
	module?: ModuleReference;

	ctor?: ts.Expression;
	ctorSync?: ts.Expression;

	template?: TemplateProperties;
	constructors?: ConstructorProperties[];
	generic?: GenericProperties;

	properties?: PropertyProperties[];
	methods?: MethodProperties[];
	decorators?: DecoratorProperties[];
};
export type NativeTypeProperties = BaseTypeProperties & { kind: NativeTypeKind, id?: undefined };
type NonNativeTypeProperties = BaseTypeProperties & { id: number, kind: TypeKind };

/**
 * Properties of a Type
 */
export type TypeProperties = NativeTypeProperties | NonNativeTypeProperties;

/**
 * Reference to the Unknown type.
 */
export const UnknownTypeReference: TransformerTypeReference = { kind: TypeKind.Unknown };
/**
 * The Unknown type properties.
 */
export const UnknownTypeProperties: TypeProperties = { kind: TypeKind.Unknown };

/**
 * Reference to the Any type.
 */
export const AnyTypeReference: TransformerTypeReference = { kind: TypeKind.Unknown };

/**
 * Properties of a Module
 */
export type ModuleProperties = {
	id?: ModuleReference;
	name: string;
	path: string;
	children?: ModuleReference[];
	types?: TypeProperties[];
};

export type ModuleMetadataProperties = Omit<ModuleProperties, "types" | "id"> & { id: ModuleIdentifier };

export interface MetadataSource
{
	modules: ModuleProperties[];
}

/**
 * Interface of "Next" middleware object.
 */
export interface NextMetadataMiddleware
{
	invoke(): MetadataSource;
}

/**
 * Middleware handling generated type properties before emitting to the result javascript code.
 */
export type MetadataMiddleware = (
	context: SourceFileContext,
	next: NextMetadataMiddleware
) => MetadataSource | ts.CallExpression | ts.ArrayLiteralExpression | ts.ObjectLiteralExpression;


/**
 * Interface for Plugins visiting and transforming SourceFiles.
 */
export interface SourceFileVisitorPlugin
{
	visit(sourceFile: ts.SourceFile, context: SourceFileContext): ts.SourceFile;
}

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
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.VisitResult<ts.Node>;


export interface ImportInfo
{
	path: string;
	exportName: string;
}

export interface ParameterProperties
{
	name: string;
	type: TransformerTypeReference;
	optional?: boolean;
	rest?: boolean;
}

export interface MethodBaseProperties
{
	parameters: Array<ParameterProperties>;
}

export interface ConstructorProperties extends MethodBaseProperties
{
}

export interface MethodProperties extends MethodBaseProperties
{
	name: string;
	typeParameters?: TransformerTypeReference[];
	returnType: TransformerTypeReference;
	optional?: boolean;
	accessModifier?: AccessModifier;
	decorators?: DecoratorProperties[];
}

export interface TemplateProperties extends TemplateInfoInitializer
{
}

export interface GenericProperties extends Omit<GenericInfoInitializer, "constraint" | "default">
{
	constraint?: TransformerTypeReference;
	default?: TransformerTypeReference;
}

export interface PropertyProperties extends Omit<PropertyInfoInitializer, "decorators" | "type">
{
	type: TransformerTypeReference;
	decorators?: Array<DecoratorProperties>;
}

export interface DecoratorProperties extends DecoratorInfoInitializer
{
}


// /**
//  * @internal
//  */
// export type GetTypeCall = ts.CallExpression;


// /**
//  * @internal
//  */
// export type MetadataEntry = [typeId: number, properties: ts.ObjectLiteralExpression, localType: boolean];

// /**
//  * @internal
//  */
// export type MetadataLibrary = Array<MetadataEntry>;
//
// /**
//  * @internal
//  */
// export type CtorsLibrary = Array<ts.PropertyAccessExpression>;

// /**
//  * @internal
//  */
// export type TypeDescription = {
// 	/**
// 	 * Properties of the type
// 	 */
// 	properties: TypePropertiesSource,
//
// 	/**
// 	 * Type is not exported
// 	 */
// 	localType: boolean
// };
//
// /**
//  * @internal
//  */
// export interface ParameterDescriptionSource
// {
// 	// Name of the parameter
// 	n: string;
// 	// Is optional parameter?
// 	// method(param?:string)
// 	o?: boolean;
// 	t: GetTypeCall | undefined;
// }
//
// /**
//  * @internal
//  */
// export interface PropertyDescriptionSource
// {
// 	/**
// 	 * Name of the property
// 	 */
// 	n: string;
//
// 	/**
// 	 * Type of the property
// 	 */
// 	t: GetTypeCall;
//
// 	/**
// 	 * Decorators
// 	 */
// 	d?: Array<DecoratorDescriptionSource>;
//
// 	/**
// 	 * Access modifier
// 	 */
// 	am?: AccessModifier;
//
// 	/**
// 	 * Accessor
// 	 */
// 	acs?: Accessor;
//
// 	/**
// 	 * Readonly
// 	 */
// 	ro?: boolean;
//
// 	/**
// 	 * Optional
// 	 */
// 	o?: boolean;
// }
//
// /**
//  * @internal
//  */
// export interface DecoratorDescriptionSource
// {
// 	/**
// 	 * Name of the decorator
// 	 */
// 	n: string;
//
// 	/**
// 	 * Full name of the decorator
// 	 */
// 	fn?: string;
//
// 	/**
// 	 * List of constant arguments
// 	 */
// 	args?: Array<any>;
// }
//
// /**
//  * @internal
//  */
// export interface MethodDescriptionSource
// {
// 	/**
// 	 * Method name
// 	 */
// 	n: string;
//
// 	/**
// 	 * Parameters
// 	 */
// 	params?: Array<ParameterDescriptionSource>;
//
// 	/**
// 	 * Return type
// 	 */
// 	rt: GetTypeCall;
//
// 	/**
// 	 * Decorators
// 	 */
// 	d?: Array<DecoratorDescriptionSource>;
//
// 	/**
// 	 * Generic type parameters
// 	 */
// 	tp?: Array<GetTypeCall>;
//
// 	/**
// 	 * Optional method
// 	 */
// 	o: boolean;
//
// 	/**
// 	 * Access modifier
// 	 */
// 	am: AccessModifier;
// }
//
// /**
//  * This data is not set when the config mode is set to "universal"
//  *
//  * @internal
//  */
// export interface ConstructorImportDescriptionSource
// {
// 	/**
// 	 * This is the name of the actual declaration
// 	 * In the example above, this would be "SomeClass"
// 	 */
// 	n: string;
// 	/**
// 	 * The exported name of this constructor from its source file.
// 	 * For example;
// 	 * "export class SomeClass {}" would be "SomeClass"
// 	 * "export default class SomeClass {}" would be "default"
// 	 */
// 	en: string;
// 	/**
// 	 * The absolute path of the source file for this constructor
// 	 */
// 	srcPath: string;
// 	/**
// 	 * The absolute path for the javascript file of this constructor
// 	 */
// 	outPath: string;
// }
//
// /**
//  * @internal
//  */
// export interface ConstructorDescriptionSource
// {
// 	params: Array<ParameterDescriptionSource>;
// }
//
// /**
//  * @internal
//  */
// interface ConditionalTypeDescriptionSource
// {
// 	/**
// 	 * Extends type
// 	 */
// 	e: GetTypeCall;
//
// 	/**
// 	 * True type
// 	 */
// 	tt: GetTypeCall;
//
// 	/**
// 	 * False type
// 	 */
// 	ft: GetTypeCall;
// }
//
// /**
//  * @internal
//  */
// interface IndexedAccessTypeDescriptionSource
// {
// 	/**
// 	 * Object type
// 	 */
// 	ot: GetTypeCall;
//
// 	/**
// 	 * Index type
// 	 */
// 	it: GetTypeCall;
// }
//
// /**
//  * @internal
//  */
// export interface TypePropertiesSource
// {
// 	/**
// 	 * Name
// 	 * @name name
// 	 */
// 	n?: string;
//
// 	/**
// 	 * Full Name
// 	 * @alias fullName
// 	 */
// 	fn?: string;
//
// 	/**
// 	 * Kind
// 	 */
// 	k: TypeKind;
//
// 	/**
// 	 * Value of literal type in case that kind is {@link TypeKind.LiteralType}
// 	 */
// 	v?: string | number | boolean | BigInt;
//
// 	/**
// 	 * Constructors
// 	 */
// 	ctors?: Array<ConstructorDescriptionSource>;
//
// 	/**
// 	 * Properties
// 	 */
// 	props?: Array<PropertyDescriptionSource>;
//
// 	/**
// 	 * Methods
// 	 */
// 	meths?: Array<MethodDescriptionSource>;
//
// 	/**
// 	 * Decorators
// 	 */
// 	decs?: Array<DecoratorDescriptionSource>;
//
// 	/**
// 	 * Containing types
// 	 */
// 	types?: Array<GetTypeCall>;
//
// 	/**
// 	 * The information required to create the constructor return function at runtime
// 	 * This data is not set when the config mode is set to "universal"
// 	 */
// 	ctorDesc?: ts.ObjectLiteralExpression;
//
// 	/**
// 	 * Function returning Promise to resolve constructor.
// 	 * @description It reflect tsconfig module.
// 	 * In case of ESM dynamic import() is generated, otherwise Promise.resolve().
// 	 */
// 	ctor?: ts.FunctionExpression;
//
// 	/**
// 	 * Base type
// 	 */
// 	bt?: GetTypeCall;
//
// 	/**
// 	 * Interface
// 	 */
// 	iface?: GetTypeCall;
//
// 	/**
// 	 * Type arguments
// 	 * @description In case of generic type description
// 	 */
// 	args?: Array<GetTypeCall>;
//
// 	/**
// 	 * Type parameters
// 	 */
// 	tp?: Array<GetTypeCall>;
//
// 	/**
// 	 * Constraining type
// 	 */
// 	con?: GetTypeCall;
//
// 	/**
// 	 * Default type
// 	 */
// 	def?: GetTypeCall;
//
// 	/**
// 	 * Conditional type description
// 	 */
// 	ct?: ConditionalTypeDescriptionSource;
//
// 	/**
// 	 * Indexed access type description
// 	 */
// 	iat?: IndexedAccessTypeDescriptionSource;
// }
//
// /**
//  * @internal
//  */
// export type TypeDescriptionResult = {
// 	/**
// 	 * Type is successfully described
// 	 */
// 	ok: true;
//
// 	/**
// 	 * Type description
// 	 */
// 	typeDescription: TypePropertiesSource;
// } | {
// 	ok: false
// };
