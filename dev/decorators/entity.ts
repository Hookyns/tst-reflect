import { getType } from 'tst-reflect';

/**
 * @reflect
 */
export function entity<TType extends Function>(Class: TType) {
	const typeT = getType<TType>();
	console.log(typeT.name, Class);
}