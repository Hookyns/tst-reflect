import {
	Decorator,
	DecoratorActivator,
	DecoratorDescription
}                           from "./descriptions/decorator";
import {
	IndexDescription,
	IndexInfo
} from "./descriptions/IndexInfo";
import {
	ConstructorInfo,
	ConstructorInfoActivator,
	ConstructorDescription,
	MethodInfo,
	MethodInfoActivator,
	MethodDescription
}                           from "./descriptions/methodInfo";
import {
	PropertyInfo,
	PropertyInfoActivator,
	PropertyDescription
}                    from "./descriptions/propertyInfo";

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
	mapProperties(p: PropertyDescription): PropertyInfo
	{
		return Reflect.construct(PropertyInfo, [p], PropertyInfoActivator);
	},

	/**
	 * @internal
	 * @param i
	 */
	mapIndexes(i: IndexDescription): IndexInfo
	{
		return new IndexInfo(i);
	},

	/**
	 * @internal
	 * @param c
	 */
	mapConstructors(c: ConstructorDescription): ConstructorInfo
	{
		return Reflect.construct(ConstructorInfo, [c], ConstructorInfoActivator);
	},

	/**
	 * @internal
	 * @param m
	 */
	mapMethods(m: MethodDescription): MethodInfo
	{
		return Reflect.construct(MethodInfo, [m], MethodInfoActivator);
	}
};
