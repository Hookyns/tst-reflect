import TransformerContext    from "../contexts/TransformerContext";
import { MetaWriter }        from "./base/MetaWriter";
import { InlineWriter }      from "./inline";
import { TsLibFileWriter }   from "./ts-lib-file";

export function createMetaWriter(context: TransformerContext): MetaWriter | undefined
{
	switch (context.config.useMetadataType)
	{
		case "inline":
			return new InlineWriter(context.config.projectDir, context);
		case "ts-lib-file":
			return new TsLibFileWriter(context.config.metadataFilePath, context);
	}
}
