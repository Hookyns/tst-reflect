import * as ts                 from "typescript";
import { getNodeLocationText } from "./getNodeLocationText";
import { PACKAGE_ID }          from "./helpers";

export function getErrorMessage(atNode: ts.Node, message: string)
{
	return `${PACKAGE_ID}: ${message}\n\tat ${getNodeLocationText(atNode)}`;
}