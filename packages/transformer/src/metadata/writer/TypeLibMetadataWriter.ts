import * as fs from "fs";
import { Context }            from "contexts/Context";
import * as ts from "typescript";
import {
	MetadataType,
	MetadataTypeValues
}                             from "../../config-options";
import { TransformerContext } from "../../contexts/TransformerContext";
import { MetadataWriterBase } from "./MetadataWriterBase";

export class TypeLibMetadataWriter extends MetadataWriterBase
{
	protected type: MetadataType = MetadataTypeValues.typeLib;
	private readonly modulesToWrite: Array<ts.Expression> = [];

	constructor(metadataFilePath: string, context: TransformerContext)
	{
		super(metadataFilePath, context);
		this.prepareTypeLibFile();
		// this.createBaseMeta();
	}

	/**
	 * @inheritDoc
	 */
	getRequireRelativePath(context: Context, filePath: string): string
	{
		return this.getRelativePath(filePath, this.metadataFilePath);
	}

	/**
	 * @inheritDoc
	 */
	writeModule(expression: ts.Expression): void
	{
		this.modulesToWrite.push(expression);
	}
	
	private prepareTypeLibFile() {
		process.on("exit", () => {
			this.write();
		});
	}

	/**
	 * Write metadata to the file.
	 * @private
	 */
	private write() {
		// SourceFile with import {getType} from "tst-reflect"
		const initialSourceFile = ts.factory.createSourceFile(
			[
				...this.modulesToWrite.map(module => ts.factory.createExpressionStatement(module))
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);

		const tsPrinter = ts.createPrinter();
		const source = tsPrinter.printFile(initialSourceFile);
		fs.writeFileSync(this.metadataFilePath, source, { encoding: "utf8", flag: "w" });
	}
}
