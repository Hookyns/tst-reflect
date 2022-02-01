import { Type, TypeActivator } from "../reflect";
import { MetaStoreImpl }                             from "./MetaStoreImpl";

let store: InlineStore | null = null;

export class InlineStore implements MetaStoreImpl
{
	private _store: { [p: number]: Type } = {};

	public static initiate(): MetaStoreImpl
	{
		if (store)
		{
			return store;
		}

		store = new InlineStore();

		(Type as any)._setStore(store);

		return store;
	}

	public static get(): MetaStoreImpl
	{
		return store || this.initiate();
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
			return InlineStore.get().get(id) ?? undefined;
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

