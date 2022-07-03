import { TypeKind }                     from "../enums";
import { TypeProvider }                 from "../Type";
import type { Type }                    from "../Type";
import { ConditionalTypeDescription }   from "./conditional-type";
import { ConstructorImportDescription } from "./constructor-import";
import { DecoratorDescription }         from "./decorator";
import { IndexedAccessTypeDescription } from "./indexed-access-type";
import {
	ConstructorDescription,
	MethodDescription
}                                       from "./method";
import { PropertyDescription }          from "./property";

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
	 * Conditional type description
	 */
	ct?: ConditionalTypeDescription;

	/**
	 * Indexed access type description
	 */
	iat?: IndexedAccessTypeDescription;
}
