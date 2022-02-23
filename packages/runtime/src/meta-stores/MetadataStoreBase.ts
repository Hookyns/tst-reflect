// import { TypeKind }           from "../enums";
// import { NativeTypes }        from "../reflect";
// import {
// 	Type,
// 	TypeActivator
// }                             from "../Type";
// import type { MetadataStore } from "./MetadataStore";
//
// export abstract class MetadataStoreBase implements MetadataStore
// {
// 	/**
// 	 * @inheritDoc
// 	 */
// 	abstract readonly store: { [key: number]: Type };
//
// 	/**
// 	 * @inheritDoc
// 	 */
// 	abstract get(id: number): Type | undefined;
//
// 	/**
// 	 * @inheritDoc
// 	 */
// 	abstract getLazy(id: number): () => Type | undefined;
//
// 	/**
// 	 * @inheritDoc
// 	 */
// 	abstract set(id: number, description: any): Type;
//
// 	/**
// 	 * @inheritDoc
// 	 */
// 	wrap(description: any): Type
// 	{
// 		if (description.n)
// 		{
// 			const standardNativeType = NativeTypes.get(description.n.toLowerCase());
//
// 			if (standardNativeType)
// 			{
// 				return standardNativeType;
// 			}
// 		}
//
// 		const type: Type = Reflect.construct(Type, [], TypeActivator);
// 		type.initialize(description);
// 		return type;
// 	}
// }