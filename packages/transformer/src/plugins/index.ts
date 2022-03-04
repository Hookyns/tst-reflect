import * as ts               from "typescript";
import { SourceFileContext } from "../contexts/SourceFileContext";

/**
 * Interface for Plugins visiting and transforming SourceFiles.
 */
export interface SourceFileVisitorPlugin
{
	visit(sourceFile: ts.SourceFile, context: SourceFileContext): ts.SourceFile;
}