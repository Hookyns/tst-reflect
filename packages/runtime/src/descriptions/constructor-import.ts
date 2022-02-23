// /**
//  * This data is not set when the config mode is set to "universal"
//  * @internal
//  */
// export interface ConstructorImportDescription
// {
// 	/**
// 	 * This is the name of the actual declaration
// 	 * In the example above, this would be "SomeClass"
// 	 */
// 	n: string | undefined;
// 	/**
// 	 * The exported name of this constructor from its source file.
// 	 * For example;
// 	 * "export class SomeClass {}" would be "SomeClass"
// 	 * "export default class SomeClass {}" would be "default"
// 	 */
// 	en: string | undefined;
// 	/**
// 	 * The absolute path of the source file for this constructor
// 	 */
// 	srcPath: string | undefined;
// 	/**
// 	 * The absolute path for the javascript file of this constructor
// 	 */
// 	outPath: string | undefined;
// }
//
// /**
//  * Method details
//  */
// export class ConstructorImport
// {
// 	private readonly _name: string | undefined;
// 	private readonly _exportName: string | undefined;
// 	private readonly _sourcePath: string | undefined;
// 	private readonly _outPath: string | undefined;
//
// 	/**
// 	 * @internal
// 	 */
// 	constructor(description: ConstructorImportDescription | undefined)
// 	{
// 		if (new.target != ConstructorImportActivator)
// 		{
// 			throw new Error("You cannot create instance of Method manually!");
// 		}
//
// 		if (!description)
// 		{
// 			return;
// 		}
// 		this._name = description.n;
// 		this._exportName = description.en;
// 		this._sourcePath = description.srcPath;
// 		this._outPath = description.outPath;
// 	}
//
// 	/**
// 	 * This is the name of the actual declaration
// 	 * In the example above, this would be "SomeClass"
// 	 */
// 	get name(): string | undefined
// 	{
// 		return this._name;
// 	}
//
// 	/**
// 	 * The exported name of this constructor from its source file.
// 	 * For example;
// 	 * "export class SomeClass {}" would be "SomeClass"
// 	 * "export default class SomeClass {}" would be "default"
// 	 */
// 	get exportName(): string | undefined
// 	{
// 		return this._exportName;
// 	}
//
// 	/**
// 	 * The absolute path of the source file for this constructor
// 	 */
// 	get sourcePath(): string | undefined
// 	{
// 		return this._sourcePath;
// 	}
//
// 	/**
// 	 * The absolute path for the javascript file of this constructor
// 	 */
// 	get outPath(): string | undefined
// 	{
// 		return this._outPath;
// 	}
// }
//
// /**
//  * @internal
//  */
// export class ConstructorImportActivator extends ConstructorImport
// {
// }
