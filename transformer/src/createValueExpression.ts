﻿import * as ts       from "typescript";
import {isExpression} from "./helpers";

export function createValueExpression(value: any): ts.Expression
{
	if (value != undefined)
	{
		if (typeof value == "string")
		{
			return ts.factory.createStringLiteral(value);
		}

		if (typeof value == "number")
		{
			return ts.factory.createNumericLiteral(value.toString());
		}

		if (typeof value == "boolean")
		{
			return value ? ts.factory.createTrue() : ts.factory.createFalse();
		}

		if (value instanceof Array)
		{
			return ts.factory.createArrayLiteralExpression(value.map(val => createValueExpression(val)));
		}

		if (value.constructor == Object)
		{
			let propertyAssignments: Array<ts.PropertyAssignment> = [];

			for (let prop in value)
			{
				// Ignoring properties assigned to undefined
				if (value.hasOwnProperty(prop) && value[prop] !== undefined)
				{
					propertyAssignments.push(ts.createPropertyAssignment(prop, createValueExpression(value[prop])));
				}
			}

			return ts.createObjectLiteral(propertyAssignments);
		}

		if (isExpression(value))
		{
			return value;
		}
	}

	return ts.factory.createNull();
}