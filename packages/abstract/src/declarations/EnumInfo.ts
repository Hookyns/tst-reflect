import type { Type } from "../Type";

/**
 * Represents an enum type.
 */
export class EnumInfo
{
	private readonly _entries: Array<readonly [enumeratorName: string, value: any]>;

	/**
	 * @param enumType
	 */
	constructor(enumType: Type)
	{
		if (!enumType?.isEnum())
		{
			throw new Error("Argument must be type representing Enum.");
		}

		this._entries = enumType.getTypes().map(type => Object.freeze<readonly [enumeratorName: string, value: any]>([type.name, type.value])) || [];
	}

	/**
	 * Get enum enumerators/items (keys).
	 */
	getEnumerators(): string[]
	{
		return this._entries.map(entry => entry[0]);
	}

	/**
	 * Get values.
	 */
	getValues(): any[]
	{
		return this._entries.map(entry => entry[1]);
	}

	/**
	 * Get enum entries (key:value pairs).
	 */
	getEntries(): Array<readonly [enumeratorName: string, value: any]>
	{
		return this._entries.slice();
	}
}