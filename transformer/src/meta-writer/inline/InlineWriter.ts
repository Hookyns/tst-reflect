import TransformerContext             from "../../contexts/TransformerContext";
import { hasRuntimePackageImport }    from "../../helpers";
import { MetaWriter, MetaWriterType } from "../base/MetaWriter";
import { InlineMetaTransformer }      from "./InlineMetaTransformer";
import { InlineNodeGenerator }        from "./InlineNodeGenerator";
import * as ts                        from 'typescript';

export class InlineWriter extends MetaWriter
{
	protected type: MetaWriterType = 'inline';

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(
			metadataFilePath,
			context,
			ts.factory.createIdentifier('____tst_reflect_set'),
			ts.factory.createIdentifier('____tst_reflect_set')
		);

		this.nodeGenerator = new InlineNodeGenerator();
		this.metaLibTransformer = new InlineMetaTransformer(this.metaFileGetTypeIdentifier);

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
		return [false, undefined];
	}

	/**
	 * With inline, we're just going to try and import the reflect package where ever we need it
	 *
	 * If we already have the import... and it's only getType, we'll just remove that import.
	 * I don't think it matters too much though
	 *
	 * @param {ts.SourceFile} sourceFile
	 * @returns {ts.SourceFile}
	 */
	addLibImportToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		if (this.hasAddedMetaLibImport(sourceFile.fileName))
		{
			return sourceFile;
		}

		const [has, namedImports, getTypeImportNodePos] = hasRuntimePackageImport(sourceFile);

		let newStatements = [...sourceFile.statements];

		// If we have the import already and it's only "getType", lets just yeet it
		if (has && getTypeImportNodePos !== -1)
		{
			newStatements = sourceFile.statements.filter(n => n.pos !== getTypeImportNodePos);
		}

		this.logMessage(`Added lib import to source file:${sourceFile.fileName}`);

		this.addedMetaLibImport(sourceFile.fileName);

		return ts.factory.updateSourceFile(sourceFile, [
			...this.nodeGenerator.sourceFileMetaLibStatements(),
			...newStatements
		]);
	}
}
