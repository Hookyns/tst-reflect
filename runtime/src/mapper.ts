import {
	Decorator,
	DecoratorActivator,
	DecoratorDescription
}                    from "./descriptions/decorator";
import {
	Constructor,
	ConstructorActivator,
	ConstructorDescription,
	Method,
	MethodActivator,
	MethodDescription
}                    from "./descriptions/method";
import {
	Parameter,
	ParameterDescription
}                    from "./descriptions/parameter";
import {
	Property,
	PropertyActivator,
	PropertyDescription
}                    from "./descriptions/property";
import type { Type } from "./Type";

export const Mapper = {
	/**
	 * @internal
	 * @param d
	 */
	mapDecorators(d: DecoratorDescription): Decorator
	{
		return Reflect.construct(Decorator, [d], DecoratorActivator);
	},

	/**
	 * @internal
	 * @param p
	 */
	mapProperties(p: PropertyDescription): Property
	{
		return Reflect.construct(Property, [p], PropertyActivator);
	},

	/**
	 * @internal
	 * @param c
	 */
	mapConstructors(c: ConstructorDescription): Constructor
	{
		return Reflect.construct(Constructor, [c], ConstructorActivator);
	},

	/**
	 * @internal
	 * @param m
	 */
	mapMethods(m: MethodDescription): Method
	{
		return Reflect.construct(Method, [m], MethodActivator);
	}
};
