import { getType } from "tst-reflect";

type ComponentConstructor<T = {}> = new (...args: any[]) => T;

/**
 * @reflect
 */
export function inject<TType>() {
	const type = getType<TType>();

	console.log("injectable", type.getConstructors().map(ctor => ctor.getParameters()));

	return function<TType extends ComponentConstructor>(ComponentConstructor: TType) {
		return class extends ComponentConstructor {
			constructor(...args: any[])
			{
				// console.log("INJECTABLE", args[0]);
				super(...args, ...["resolved", "services"]);
			}
		}
	};
}
