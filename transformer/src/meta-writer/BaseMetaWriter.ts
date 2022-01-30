import * as fs                     from "fs";
import * as ts                     from "typescript";
import TransformerContext          from "../contexts/TransformerContext";
import { getRequireRelativePath } from "../helpers";
import {
	color,
	log,
	LogLevel
}                                  from "../log";
import { nodeGenerator }           from "../NodeGenerator";

export type MetaWriterType = 'libfile' | 'inline' | 'extended:ts:libfile';

export class BaseMetaWriter
{

	protected type: MetaWriterType = 'libfile';
	protected context: TransformerContext;
	protected metaWrittenState: Map<string, boolean> = new Map();
	protected tsPrinter: ts.Printer;
	protected metadataFilePath: string;
	protected getTypeIdentifier?: ts.Identifier;

	private _addedLibImport: string[] = [];

	/**
	 * Construct metadata library generator.
	 */
	constructor(metadataFilePath: string, context: TransformerContext)
	{
		this.context = context;
		this.tsPrinter = ts.createPrinter();
		this.metadataFilePath = metadataFilePath;
	}

	public hasWrittenMetaForFile(filePath: string)
	{
		return this.metaWrittenState.get(filePath) ?? false;
	}

	public metaWrittenForFile(filePath: string)
	{
		this.metaWrittenState.set(filePath, true);
	}

	/**
	 * Create or truncate metadata library file and prepare library stuff.
	 */
	public createBaseMeta()
	{
		const { statement, getTypeIdentifier } = nodeGenerator.createGetTypeImport();
		this.getTypeIdentifier = getTypeIdentifier;

		// SourceFile with import {getType} from "tst-reflect"
		this.writeSourceFile([statement]);
	}

	protected writeSourceFile(statements: ts.Statement[])
	{
		const initialSourceFile = ts.factory.createSourceFile(
			statements,
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);

		const source = this.tsPrinter.printFile(initialSourceFile);
		fs.writeFileSync(this.metadataFilePath, source, { encoding: "utf8", flag: "w" });
	}

	getPathRelativeToLib(filePath: string)
	{
		return getRequireRelativePath(this.metadataFilePath, filePath);
	}

	getRelativeMetaLibPath(relativeToSourceFile: ts.SourceFile): string
	{
		return getRequireRelativePath(relativeToSourceFile.fileName, this.metadataFilePath);
	}

	public logMessage(message: string, ...args: any[])
	{
		log.log(LogLevel.Trace, color.magenta, `[${this.type}] : ${message}`, ...(args || []));
	}

	addedMetaLibImport(fileName: string)
	{
		this._addedLibImport.push(fileName);
	}

	hasAddedMetaLibImport(fileName: string)
	{
		return this._addedLibImport.includes(fileName);
	}
}
