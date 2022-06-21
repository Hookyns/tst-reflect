import { TypeKind }           from "../enums";
import { NativeTypes }        from "../reflect";
import {
	Type,
	TypeActivator
}                             from "../Type";
import type { MetadataStore } from "./MetadataStore";

export abstract class MetadataStoreBase implements MetadataStore
{
	/**
	 * @inheritDoc
	 */
	abstract readonly store: { [key: number]: Type };

	/**
	 * @inheritDoc
	 */
	abstract get(id: number): Type | undefined;

	/**
	 * @inheritDoc
	 */
	abstract getLazy(id: number): () => Type | undefined;

	/**
	 * @inheritDoc
	 */
	set(id: number, description: any): Type
	{
		return this.wrap(description, id);
	}

	/**
	 * @inheritDoc
	 */
	wrap(description: any, _storeWithId?: number): Type
	{
		if (description.k == TypeKind.Native && description.n)
		{
			const standardNativeType = NativeTypes.get(description.n.toLowerCase());

			if (standardNativeType)
			{
				return standardNativeType;
			}
		}

		const type: Type = Reflect.construct(Type, [], TypeActivator);

		if (_storeWithId != undefined)
		{
			this.store[_storeWithId] = type;
		}

		type.initialize(description);
		return type;
	}
}