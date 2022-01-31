import { REFLECT_STORE_SYMBOL, Type, TypeActivator } from "../reflect";
import { MetaStoreImpl }                             from "./MetaStoreImpl";

/** @internal */
declare global
{
	export var process: NodeJS.Process;
	namespace NodeJS
	{
		interface Process
		{
			[REFLECT_STORE_SYMBOL]: NodeProcessMetaStore;
		}
	}
}

export class NodeProcessMetaStore implements MetaStoreImpl
{

	private _store: { [p: number]: Type } = {};

	public static initiate(): MetaStoreImpl
	{
		if (!process)
		{
			throw new Error('This environment does not support the nodejs process store. Are you running this from a browser?');
		}

		if (process[REFLECT_STORE_SYMBOL])
		{
			return process[REFLECT_STORE_SYMBOL];
		}

		process[REFLECT_STORE_SYMBOL] = new NodeProcessMetaStore();

		(Type as any)._setStore(process[REFLECT_STORE_SYMBOL]);

		return process[REFLECT_STORE_SYMBOL];
	}

	public static get(): MetaStoreImpl
	{
		return process[REFLECT_STORE_SYMBOL] || this.initiate();
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
			return process[REFLECT_STORE_SYMBOL].get(id) ?? undefined;
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

