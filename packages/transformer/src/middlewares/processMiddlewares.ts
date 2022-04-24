import * as ts                  from "typescript";
import { SourceFileContext }    from "../contexts/SourceFileContext";
import { MetadataSource }       from "../declarations";
import {
	MetadataMiddleware,
	MiddlewareContext,
	MiddlewareResult,
	NextMetadataMiddleware
}                               from "./index";
import { shortArraySerializer } from "./shortArraySerializer";

export function processMiddlewares(sourceFileContext: SourceFileContext, source: MetadataSource): MiddlewareResult
{
	const middlewares: MetadataMiddleware[] = sourceFileContext.transformerContext.config.metadataMiddlewares;

	// Add our default middleware
	middlewares.push(shortArraySerializer);

	// MIDDLEWARES
	let middlewareIndex = 0;
	let middlewareResult: MiddlewareResult | undefined = undefined;

	const middlewareContext: MiddlewareContext = {
		sourceFileContext,
		metadata: source,
		get result(): MiddlewareResult | undefined
		{
			return middlewareResult;
		},
		setResult(expression: MiddlewareResult)
		{
			middlewareResult = expression;
		}
	};

	const nextMetadataMiddleware: NextMetadataMiddleware = {
		invoke()
		{
			middlewares[middlewareIndex++]?.(middlewareContext, nextMetadataMiddleware);
		}
	};

	nextMetadataMiddleware.invoke();

	if (middlewareResult)
	{
		return middlewareResult;
	}

	return ts.factory.createObjectLiteralExpression();
}