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

	const metadata = context.metadata.modules.map(module => {
		let { types, ...moduleProperties } = module;
		types ??= [];
		
		return [
			moduleProperties,
			...types // TODO: Serialize into Array
		]
	});

	context.setResult(metadata);
};