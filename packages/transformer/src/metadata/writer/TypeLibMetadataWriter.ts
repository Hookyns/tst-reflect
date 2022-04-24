import { Context }            from "contexts/Context";
import {
	MetadataType,
	MetadataTypeValues
}                             from "../../config-options";
import { TransformerContext } from "../../contexts/TransformerContext";
import { MetadataWriterBase } from "./MetadataWriterBase";

export class TypeLibMetadataWriter extends MetadataWriterBase
{
	protected type: MetadataType = MetadataTypeValues.typeLib;

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(metadataFilePath, context);

		this.createBaseMeta();
	}

	/**
	 * @inheritDoc
	 */
	getRequireRelativePath(context: Context, filePath: string): string
	{
		return this.getRelativePath(filePath, this.metadataFilePath);
	}
}
