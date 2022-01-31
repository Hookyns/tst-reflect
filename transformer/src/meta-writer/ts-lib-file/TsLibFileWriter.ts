import TransformerContext             from "../../contexts/TransformerContext";
import { MetaWriter, MetaWriterType } from "../base/MetaWriter";
import { TsLibFileNodeGenerator }     from "./TsLibFileNodeGenerator";
import { TsLibFileMetaTransformer }   from "./TsLibFileMetaTransformer";

export class TsLibFileWriter extends MetaWriter
{
	protected type: MetaWriterType = 'ts-lib-file';

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(metadataFilePath, context);

		this.nodeGenerator = new TsLibFileNodeGenerator();
		this.metaLibTransformer = new TsLibFileMetaTransformer(this.metaFileGetTypeIdentifier);

		this.createBaseMeta();
	}

	/**
	 * Does this meta writer use a stub file?
	 *
	 * For example,
	 * ts version uses a file with pre-made store etc.
	 * js version is generated on the fly
	 * inline doesn't use one
	 *
	 * If it uses a stub file, we return [yes, stub file name]
	 * If not, [no, undefined]
	 *
	 * @returns {[boolean, string|undefined]}
	 */
	usesStubFile(): [boolean, string | undefined]
	{
		return [true, "ts-lib-file-stub.ts"];
	}

}
