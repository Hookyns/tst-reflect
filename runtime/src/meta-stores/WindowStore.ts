import { REFLECT_STORE_SYMBOL } from "../const";
import {
	Type,
	TypeActivator
}                               from "../reflect";
import { MetaStoreImpl }        from "./MetaStoreImpl";

/** @internal */
declare global
{
	export var window: Window & typeof globalThis;

	interface Window
	{
		[REFLECT_STORE_SYMBOL]: WindowMetaStore;
	}

}

export class WindowMetaStore implements MetaStoreImpl
{

	private _store: { [p: number]: Type } = {};

	public static initiate(): MetaStoreImpl
	{
		if (!window)
		{
			throw new Error('This environment does not support window store. Are you running this in a nodejs environment?');
		}

		if (window[REFLECT_STORE_SYMBOL])
		{
			return window[REFLECT_STORE_SYMBOL];
		}

		window[REFLECT_STORE_SYMBOL] = new WindowMetaStore();

		(Type as any)._setStore(window[REFLECT_STORE_SYMBOL]);

		return window[REFLECT_STORE_SYMBOL];
	}

	public static get(): MetaStoreImpl
	{
		return window[REFLECT_STORE_SYMBOL] || this.initiate();
	}

	get store(): { [p: number]: Type }
	{
		return this._store;
	}

	get(id: number): Type | undefined
	{
		return this._store[id] ?? undefined;
	}

	getLazy(id: number): () => (Type | undefined)
	{
		return function () {
			return window[REFLECT_STORE_SYMBOL].get(id) ?? undefined;
		};
	}

	set(id: number, description: any): Type
	{
		const type = this.wrap(description);

		this._store[id] = type;

		return type;
	}

	wrap(description: any): Type
	{
		const type = Reflect.construct(Type, [], TypeActivator);
		type.initialize(description);
		return type;
	}

}

