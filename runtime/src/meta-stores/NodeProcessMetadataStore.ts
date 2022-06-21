import { REFLECT_STORE_SYMBOL } from "../consts";
import { Type }                 from "../Type";
import { MetadataStore }        from "./MetadataStore";
import { MetadataStoreBase }    from "./MetadataStoreBase";

/** @internal */
declare global
{
	export var process: NodeJS.Process;
	namespace NodeJS
	{
		interface Process
		{
			[REFLECT_STORE_SYMBOL]: NodeProcessMetadataStore;
		}
	}
}

export class NodeProcessMetadataStore extends MetadataStoreBase
{

	private _store: { [p: number]: Type } = {};

	public static initiate(): MetadataStore
	{
		if (!process)
		{
			throw new Error("This environment does not support the nodejs process store. Are you running this from a browser?");
		}

		if (process[REFLECT_STORE_SYMBOL])
		{
			return process[REFLECT_STORE_SYMBOL];
		}

		process[REFLECT_STORE_SYMBOL] = new NodeProcessMetadataStore();

		(Type as any)._setStore(process[REFLECT_STORE_SYMBOL]);

		return process[REFLECT_STORE_SYMBOL];
	}

	public static get(): MetadataStore
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
		return function lazyType() {
			return process[REFLECT_STORE_SYMBOL].get(id) ?? undefined;
		};
	}
}