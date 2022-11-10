import { InlineMetadataStore } from "./InlineMetadataStore.ts";
import { MetadataStore } from "./MetadataStore.ts";
import { NodeProcessMetadataStore } from "./NodeProcessMetadataStore.ts";
import { WindowMetadataStore } from "./WindowMetadataStore.ts";

export * from "./MetadataStore.ts";
export * from "./InlineMetadataStore.ts";
export * from "./WindowMetadataStore.ts";
export * from "./NodeProcessMetadataStore.ts";

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
