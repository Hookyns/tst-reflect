import { Type } from "./reflect";

export * from "./reflect";
export * from "./consts";
export * from "./enums";
export * from "./meta-stores";
export * from "./descriptions/decorator";
export * from "./descriptions/parameter";
export * from "./descriptions/property";
export * from "./descriptions/method";
export * from "./descriptions/conditional-type";
export * from "./descriptions/indexed-access-type";
export * from "./descriptions/constructor-import";
export * from "./descriptions/enum-info";
export * from "./descriptions/type-properties";

/**
 * Returns Type of generic parameter
 */
export function getType<T>(): Type
{
	if (!(((typeof window === "object" && window) || (typeof global === "object" && global) || globalThis) as any)["tst-reflect-disable"])
	{
		console.debug("[ERR] tst-reflect: You call getType() method directly. " +
			"You have probably wrong configuration, because tst-reflect-transformer package should replace this call by the Type instance.\n" +
			"If you have right configuration it may be BUG so try to create an issue.\n" +
			"If it is not an issue and you don't want to see this debug message, " +
			"create field 'tst-reflect-disable' in global object (window | global | globalThis) eg. `window['tst-reflect-disable'] = true;`");
	}

	// In case of direct call, we'll return Unknown type.
	return Type.Unknown;
}

/** @internal */
getType.__tst_reflect__ = true;

/**
 * Class decorator which marks classes to be processed and included in metadata lib file.
 * @reflectDecorator
 */
export function reflect<TType>()
{
	getType<TType>();
	return function <T>(Constructor: { new(...args: any[]): T }) {
	};
}
