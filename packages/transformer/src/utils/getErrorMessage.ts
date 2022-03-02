import * as ts                 from "typescript";
import { PACKAGE_ID }          from "../helpers";
import { getNodeLocationText } from "./getNodeLocationText";

export function getErrorMessage(atNode: ts.Node, message: string)
{
	return `${PACKAGE_ID}: ${message}\n\tat ${getNodeLocationText(atNode)}`;
}