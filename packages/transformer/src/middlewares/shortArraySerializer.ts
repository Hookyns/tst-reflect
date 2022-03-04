import {
	MetadataMiddleware,
	MiddlewareContext,
	NextMetadataMiddleware
} from "./index";

export const shortArraySerializer: MetadataMiddleware = function shortArraySerializer(context: MiddlewareContext, next: NextMetadataMiddleware)
{
	next.invoke();

	if (context.result)
	{
		return;
	}

	context.setResult({});
};