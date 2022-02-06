import type { Type } from "../Type";

export interface MetadataStore
{
	readonly store: { [key: number]: Type };

	/**
	 * Get a type from the store by its number id
	 *
	 * @param {number} id
	 * @returns {Type | undefined}
	 */
	get(id: number): Type | undefined;

	/**
	 * Get a type, but it's wrapped in a function to prevent any circular dependencies.
	 *
	 * @param {number} id
	 * @returns {() => (Type | undefined)}
	 */
	getLazy(id: number): () => Type | undefined;

	/**
	 * This is used when we return a basic type object from the transformer, but it's
	 * not a type that can be assigned an id. So we just wrap it in a Type class.
	 *
	 * @param {any} description
	 * @returns {Type}
	 */
	wrap(description: any): Type;

	/**
	 * Set a type on the store
	 *
	 * @param {number} id
	 * @param {any} description
	 * @returns {Type}
	 */
	set(id: number, description: any): Type;
}