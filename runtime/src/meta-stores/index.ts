import { InlineMetadataStore }      from "./InlineMetadataStore";
import { MetadataStore }            from "./MetadataStore";
import { NodeProcessMetadataStore } from "./NodeProcessMetadataStore";
import { WindowMetadataStore }      from "./WindowMetadataStore";

export * from "./MetadataStore";
export * from "./InlineMetadataStore";
export * from "./WindowMetadataStore";
export * from "./NodeProcessMetadataStore";

// Default store
InlineMetadataStore.initiate();

/**
 * Function used in transformer templates for metadata files.
 * @return {MetadataStore}
 */
export function getMetadataStore(): MetadataStore
{
	if (typeof process !== "undefined")
	{
		return NodeProcessMetadataStore.get();
	}

	if (typeof window !== "undefined")
	{
		return WindowMetadataStore.get();
	}

	throw new Error(`Failed to initialize a store for your environment, the global "process" and "window" vars aren't available.`);
}
