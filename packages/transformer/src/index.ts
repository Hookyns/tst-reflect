import * as ts                      from "typescript";
import { TransformerContext }       from "./contexts/TransformerContext";
import { SourceFileVisitorFactory } from "./factories/SourceFileVisitorFactory";

export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	TransformerContext.init(program);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		const sourceFileVisitor = new SourceFileVisitorFactory(context, program).create();
		return (node) => ts.visitNode(node, sourceFileVisitor);
	};
}
