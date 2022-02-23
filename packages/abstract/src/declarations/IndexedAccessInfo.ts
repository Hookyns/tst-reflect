import { Metadata }      from "../index";
import type { Type }     from "../Type";
import { TypeReference } from "./declarations";

export class IndexedAccessInfo
{
	private readonly _objectTypeReference: TypeReference;
	private readonly _indexTypeReference: TypeReference;

	private _objectType?: Type;
	private _indexType?: Type;

	/**
	 * True type
	 */
	get objectType(): Type
	{
		return this._objectType ?? (this._objectType = Metadata.resolveType(this._objectTypeReference));
	}

	/**
	 * False type
	 */
	get indexType(): Type
	{
		return this._indexType ?? (this._indexType = Metadata.resolveType(this._indexTypeReference));
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: IndexedAccessInfoInitializer)
	{
		this._objectTypeReference = initializer.objectType;
		this._indexTypeReference = initializer.indexType;
	}
}

export interface IndexedAccessInfoInitializer
{
	objectType: TypeReference;
	indexType: TypeReference;
}