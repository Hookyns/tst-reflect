import { MetaStoreImpl }        from "./MetaStoreImpl";
import { NodeProcessMetaStore } from "./NodeProcessStore";
import { WindowMetaStore }      from "./WindowStore";

export * from './InlineStore';
export * from './WindowStore';
export * from './MetaStoreImpl';
export * from './NodeProcessStore';


export function getMetaFileStore(): MetaStoreImpl
{
	if (typeof process !== "undefined")
	{
		return NodeProcessMetaStore.get();
	}
	if (typeof window !== "undefined")
	{
		return WindowMetaStore.get();
	}

	throw new Error(`Failed to initialize a store for your environment, the global "process" and "window" vars aren't available.`);
}
