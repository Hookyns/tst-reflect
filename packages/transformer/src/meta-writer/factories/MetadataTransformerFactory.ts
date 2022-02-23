import * as ts                  from "typescript";
import { IMetadataTransformer } from "../IMetadataTransformer";

export class MetadataTransformerFactory
{
	constructor(private metadataTransformerCtor: { new(getTypeIdentifier: ts.Identifier): IMetadataTransformer })
	{
	}

	/**
	 * Create new instance of MetadataTransformer
	 * @param getTypeIdentifier
	 */
	create(getTypeIdentifier: ts.Identifier): IMetadataTransformer
	{
		return new this.metadataTransformerCtor(getTypeIdentifier);
	}
}