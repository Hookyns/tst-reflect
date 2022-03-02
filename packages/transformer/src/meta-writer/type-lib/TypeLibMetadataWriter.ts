import { Context }                from "contexts/Context";
import {
	MetadataType,
	MetadataTypeValues
}                                 from "../../config-options";
import { TransformerContext }     from "../../contexts/TransformerContext";
import { getRequireRelativePath } from "../../helpers";
import { MetadataWriterBase }     from "../MetadataWriterBase";

export class TypeLibMetadataWriter extends MetadataWriterBase
{
	protected type: MetadataType = MetadataTypeValues.typeLib;

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(
			metadataFilePath,
			context,
			// new TypeLibMetadataNodeGenerator(),
			// new MetadataTransformerFactory(TypeLibMetadataTransformer)
		);

		this.createBaseMeta();
	}

	// /**
	//  * Does this meta writer use a stub file?
	//  *
	//  * For example,
	//  * ts version uses a file with pre-made store etc.
	//  * js version is generated on the fly
	//  * inline doesn't use one
	//  *
	//  * If it uses a stub file, we return [yes, stub file name]
	//  * If not, [no, undefined]
	//  *
	//  * @returns {[boolean, string|undefined]}
	//  */
	// usesStubFile(): [boolean, string | undefined]
	// {
	// 	return [true, "type-lib-file-stub.template.ts"];
	// }

	/**
	 * @inheritDoc
	 */
	getRequireRelativePath(context: Context, filePath: string): string
	{
		return this.getPathRelativeToLib(filePath);
	}

	/**
	 * Allows us to get a file path in relation to the location of our metadata lib file
	 *
	 * For example, meta lib file is in "src/meta-lib.ts", and we want to import
	 * "src/Services/UserService" it would be "./Services/UserService"
	 *
	 * @param {string} filePath
	 * @returns {string}
	 */
	private getPathRelativeToLib(filePath: string)
	{
		return getRequireRelativePath(this.metadataFilePath, filePath);
	}
}
