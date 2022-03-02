import { ModuleReference }     from "@rtti/abstract";
import * as ts                 from "typescript";
import { TransformerContext }  from "../contexts/TransformerContext";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TransformerTypeReference,
	TypeProperties
}                              from "../declarations";
import { getTypeProperties }   from "../properties/getTypeProperties";
import { getNodeLocationText } from "../utils/getNodeLocationText";
import { getTypeId }           from "../utils/typeHelpers";

/**
 * Class containing metadata of one Module/SourceFile.
 */
export class ModuleMetadata
{
	/**
	 * Static counter of SourceFiles.
	 */
	private static sourceFileIdCounter = 1;

	private readonly moduleProperties: ModuleMetadataProperties;
	private readonly types = new Map<ts.Type, TypeProperties>();
	private readonly typesStack: TransformerTypeReference[] = [];

	/**
	 * @param context
	 * @param sourceFile
	 */
	constructor(private readonly context: TransformerContext, private readonly sourceFile: ts.SourceFile)
	{
		this.moduleProperties = this.gatherModuleProperties();
	}

	private static getSourceFileId(sourceFile: ts.SourceFile): number
	{
		return (sourceFile as any).__reflectId ?? (sourceFile as any).id ?? ((sourceFile as any).__reflectId = ModuleMetadata.sourceFileIdCounter++); // TODO: Check if sourcefile has "id"
	}

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties({ withoutTypes = false }: { withoutTypes?: boolean }): ModuleProperties
	{
		return {
			...this.moduleProperties,
			types: withoutTypes ? undefined : Array.from(this.types.values())
		};
	}

	/**
	 * Add type into the module metadata and return its properties.
	 * @param typeNode
	 * @param type
	 */
	addType(typeNode: ts.TypeNode, type: ts.Type): TransformerTypeReference
	{
		let existingProperties = this.types.get(type);

		if (!existingProperties)
		{
			const typeId = getTypeId(type);

			// Type is already in the stack (this type is circular).
			if (this.typesStack.includes(typeId))
			{
				return typeId;
			}

			this.typesStack.push(typeId);
			existingProperties = getTypeProperties(this.context.currentSourceFileContext!.context, typeNode, type);
			this.typesStack.pop();

			if (existingProperties.id === undefined)
			{
				return existingProperties;
			}

			this.types.set(type, existingProperties);
		}

		if (existingProperties.id === undefined)
		{
			return existingProperties;
		}

		return existingProperties.id;
	}

	private gatherModuleProperties(): ModuleMetadataProperties
	{
		const name = this.sourceFile.moduleName == undefined ? "" : this.sourceFile.moduleName;

		return {
			name,
			id: ModuleMetadata.getSourceFileId(this.sourceFile),
			path: this.sourceFile.fileName,
			children: this.getChildrenReferences(this.sourceFile)
		};
	}

	private getChildrenReferences(sourceFile: ts.SourceFile)
	{
		const index = sourceFile.statements.findIndex(s => !ts.isImportDeclaration(s));
		const references: Array<ModuleReference> = [];

		let importDeclaration: ts.ImportDeclaration;
		for (let i = 0; i < index; i++)
		{
			importDeclaration = sourceFile.statements[i] as ts.ImportDeclaration;

			if (importDeclaration.importClause?.isTypeOnly)
			{
				continue;
			}

			const sourceFileContext = this.context.currentSourceFileContext!;

			if (ts.isStringLiteral(importDeclaration.moduleSpecifier))
			{
				const childSourceFile = this.context.program.getSourceFile(importDeclaration.moduleSpecifier.text); // TODO: Check if it is right

				if (childSourceFile)
				{
					references.push(ModuleMetadata.getSourceFileId(childSourceFile));
				}
				else
				{
					sourceFileContext.log.error(`SourceFile of '${importDeclaration.moduleSpecifier.text}' not found.\r\n\tAt ${getNodeLocationText(importDeclaration)}`);
				}
			}
			else
			{
				sourceFileContext.log.error("Invalid module specifier.\r\n\tAt " + getNodeLocationText(importDeclaration));
			}
		}

		return references;
	}
}