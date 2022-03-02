import * as ts                      from "typescript";
import { createValueExpression }    from "../utils/createValueExpression";
import { TransformerTypeReference } from "../declarations";
import type { TransformerContext }  from "../contexts/TransformerContext";
import type { MetadataLibrary }     from "./MetadataLibrary";

export class MetadataFactory
{
	private readonly typeFactoryIdentifier: ts.Identifier;
	// private readonly metadataIdentifier: ts.Identifier;
	
	constructor(private readonly metadata: MetadataLibrary, private readonly context: TransformerContext)
	{
		this.typeFactoryIdentifier = ts.factory.createIdentifier("__τ"); // TODO: Load from config! reflection.typeFactory
		// this.metadataIdentifier = ts.factory.createIdentifier("__Ω");
		
		// TODO: Create `import { Metadata } from "@rtti/abstract";` (import or require based on tsconfig) in each file and generate `Metadata.resolveType(id)` in place of getType<T>() calls.
	}

	/**
	 * Create runtime Type resolver.
	 * @param reference
	 */
	createTypeResolver(reference: TransformerTypeReference): ts.Expression
	{
		return ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				this.typeFactoryIdentifier,
				ts.factory.createIdentifier("resolveType")
			),
			undefined,
			[typeof reference === "object" ? createValueExpression(reference) : ts.factory.createNumericLiteral(reference)]
		);
	}
}