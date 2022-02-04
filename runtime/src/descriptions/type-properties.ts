import { TypeKind }                     from "../enums";
import type { Type }                    from "../reflect";
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
