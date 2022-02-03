export module foobar
{
	export function foo()
	{
	}

	export class Bar
	{
	}
}

export type SimpleUnionType = string | number;

export type UnionType<TResult> = {
	ok: true,
	result: TResult
} | {
	ok: false
}

export type IntersectionType = {
	name: string;
	email: string;
} & {
	name: string;
	username: string;
}

export interface SomeInterface
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];
	arrayProp: Array<string>;
	moduleProp?: typeof foobar;

	optionalMethod?(this: SomeInterface, size: number): void;
}

export type DefaultType = undefined;