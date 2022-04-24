import * as ts                from "typescript";
import { TransformerContext } from "../contexts/TransformerContext";

export function getSourceFile(importDeclaration: ts.ImportDeclaration, context: TransformerContext): ts.SourceFile | undefined
{
	return context.checker.getSymbolAtLocation(importDeclaration.moduleSpecifier)?.valueDeclaration as ts.SourceFile;
}