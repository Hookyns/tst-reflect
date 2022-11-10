import { Type } from "../Type.ts";
import { MetadataStore } from "./MetadataStore.ts";
import { MetadataStoreBase } from "./MetadataStoreBase.ts";

let __inlineMetadataStore: InlineMetadataStore | null = null;

export class InlineMetadataStore extends MetadataStoreBase
{
	private _store: { [p: number]: Type } = {};

	public static initiate(): MetadataStore
	{
		if (__inlineMetadataStore)
		{
			return __inlineMetadataStore;
		}

		__inlineMetadataStore = new InlineMetadataStore();

		(Type as any)._setStore(__inlineMetadataStore);

		return __inlineMetadataStore;
	}

	public static get(): MetadataStore
	{
		return __inlineMetadataStore || this.initiate();
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
			return InlineMetadataStore.get().get(id) ?? undefined;
		};
	}
}