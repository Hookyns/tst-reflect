import {ConfigObject, setConfig} from "./src/config";

﻿import * as ts                  from "typescript";

export default function transform<T extends ts.Node>(program: ts.Program, config?: ConfigObject): ts.TransformerFactory<T>
{
	config ??= {};
	config.rootDir ??= program.getCurrentDirectory();
	setConfig(config);

	const {getVisitor} = require("./src/visitation");

	return (context) => {
		return (node) => ts.visitNode(node, getVisitor(context, program));
	};
}