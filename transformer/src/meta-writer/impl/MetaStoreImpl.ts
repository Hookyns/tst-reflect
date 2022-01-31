import { Type }                 from "tst-reflect";
import { TypePropertiesSource } from "../../declarations";


export interface MetaStoreImpl
{
	get store(): { [key: number]: Type };

	/**
	 * Get a type from the store by its number id
	 *
	 * @param {number} id
	 * @returns {Type | undefined}
	 */
	get(id: number): Type | undefined;

	//	__getDescription: (typeId: number) => any;

	/**
	 * Get a type, but it's wrapped in a function to prevent any circular dependencies.
	 *
	 * @param {number} id
	 * @returns {() => (Type | undefined)}
	 */
	getLazy(id: number): () => Type | undefined;

	//	__lazyTypeGetter: (typeId: number) => () => Type | undefined;

	/**
	 * This is used when we return a basic type object from the transformer, but it's
	 * not a type that can be assigned an id. So we just wrap it in a Type class.
	 *
	 * @param {TypePropertiesSource} description
	 * @returns {Type}
	 */
	wrap(description: TypePropertiesSource): Type;

	//__createType: (description?: any | number | string) => Type;

	/**
	 * Set a type on the store
	 *
	 * @param {number} id
	 * @param {TypePropertiesSource} description
	 * @returns {Type}
	 */
	set(id: number, description: TypePropertiesSource): Type;

	//	__setDescription: (typeId: number, data: any) => void;

}
