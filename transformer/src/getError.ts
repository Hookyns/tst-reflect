import * as ts                 from "typescript";
import { getNodeLocationText } from "./getNodeLocationText";
import { PACKAGE_ID }          from "./helpers";

export function getError(atNode: ts.Node, message: string)
{
    return new Error(`${PACKAGE_ID}: ${message}\n\tat ${getNodeLocationText(atNode)}`);
}