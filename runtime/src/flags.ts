/**
 * Kind of type
 */
export enum TypeKind {
	/**
	 * Interface
	 */
	Interface,

	/**
	 * Class
	 */
	Class,

	/**
	 * Native JavaScript/TypeScript type
	 */
	Native,

	/**
	 * Container for other types in case of types union or intersection
	 */
	Container,

	/**
	 * Type reference created during type checking
	 * @description Usually Array<...>, ReadOnly<...> etc.
	 */
	TransientTypeReference,

	/**
	 * Some specific object
	 * @description Eg. "{ foo: string, bar: boolean }"
	 */
	Object,

	/**
	 * Some subtype of string, number, boolean
	 * @example <caption>type Foo = "hello world" | "hello"</caption>
	 * String "hello world" is literal type and it is subtype of string.
	 *
	 * <caption>type TheOnlyTrue = true;</caption>
	 * Same as true is literal type and it is subtype of boolean.
	 */
	LiteralType,

	/**
	 * Fixed lenght arrays literals
	 * @example <caption>type Coords = [x: number, y: number, z: number];</caption>
	 */
	Tuple,

	/**
	 * Generic parameter type
	 * @description Represent generic type parameter of generic types. Eg. it is TType of class Animal<TType> {}.
	 */
	TypeParameter,

	/**
	 * Conditional type
	 */
	ConditionalType = 9,

	/**
	 * Indexed access type
	 * @description Eg. get<K extends keyof TypeKind>(key: K): ==>> TypeKind[K] <<==
	 */
	IndexedAccess   = 10,

	/**
	 * Typescript "module"
	 * @description Value module or namespace module
	 */
	Module          = 11,

	/**
	 * Specific method used as type
	 */
	Method          = 12,
}

export enum Accessor {
	None,
	Getter,
	Setter
}

export enum AccessModifier {
	Private,
	Protected,
	Public
}
