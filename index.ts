import * as ts                   from "typescript";
import {ConfigObject, setConfig} from "./src/config";

export default function transform<T extends ts.Node>(program: ts.Program, config?: ConfigObject): ts.TransformerFactory<T>
{
	setConfig(config);
	const { getVisitor } = require("./src/visitation");

	return (context) => {
		return (node) => ts.visitNode(node, getVisitor(context, program));
	};
}