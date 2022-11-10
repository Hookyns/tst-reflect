import type { Type } from "../Type.ts";
import { TypeKind } from "../enums.ts";
import { TypeProvider } from "../Type.ts";
import { ConditionalTypeDescription } from "./conditional-type.ts";
import { ConstructorImportDescription } from "./constructor-import.ts";
import { DecoratorDescription } from "./decorator.ts";
import { FunctionTypeDescription } from "./function-type.ts";
import { IndexedAccessTypeDescription } from "./indexed-access-type.ts";
import { IndexDescription } from "./IndexInfo.ts";
import {
	ConstructorDescription,
	MethodDescription
} from "./methodInfo.ts";
import { PropertyDescription } from "./propertyInfo.ts";

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
	 * Indexes
	 */
	indxs?: Array<IndexDescription>;

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
	tp?: Array<Type | TypeProvider>;

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
	types?: Array<Type | TypeProvider>;

	/**
	 * Some path/export information about the module it-self. Will help dynamically import modules.
	 * This data is not set when the config mode is set to "universal"
	 */
	ctorDesc?: ConstructorImportDescription;

	/**
	 * Ctor getter
	 */
	ctor?: () => Promise<{ new(...args: any[]): any }>;

	/**
	 * Extended base type
	 */
	bt?: Type | TypeProvider;

	/**
	 * Implemented interface
	 */
	iface?: Type | TypeProvider;

	/**
	 * Literal value
	 */
	v?: any;

	/**
	 * Type arguments
	 */
	args?: Array<Type | TypeProvider>;

	/**
	 * Default type
	 */
	def?: Type | TypeProvider;

	/**
	 * Constraining type
	 */
	con?: Type | TypeProvider;

	/**
	 * Conditional type description.
	 */
	ct?: ConditionalTypeDescription;

	/**
	 * Indexed access type description.
	 */
	iat?: IndexedAccessTypeDescription;

	/**
	 * Function signatures.
	 */
	sg?: FunctionTypeDescription[];

	/**
	 * Type is a generic type.
	 */
	isg?: boolean;

	/**
	 * Generic type definition.
	 */
	gtd?: Type | TypeProvider;
}
