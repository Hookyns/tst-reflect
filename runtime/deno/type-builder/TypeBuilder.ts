import { FunctionTypeDescription } from "../descriptions/function-type.ts";
import { MethodDescription } from "../descriptions/methodInfo.ts";
import { PropertyDescription } from "../descriptions/propertyInfo.ts";
import type { Type } from "../Type.ts";
import { ArrayTypeBuilder } from "./ArrayBuilder.ts";
import { FunctionBuilder } from "./FunctionBuilder.ts";
import { IntersectionTypeBuilder } from "./IntersectionTypeBuilder.ts";
import { MethodBuilder } from "./MethodBuilder.ts";
import { ObjectLiteralTypeBuilder } from "./ObjectLiteralTypeBuilder.ts";
import { PropertyBuilder } from "./PropertyBuilder.ts";
import { UnionTypeBuilder } from "./UnionTypeBuilder.ts";

export class TypeBuilder
{
	private constructor()
	{
	}

	static createUnion(types: Type[]): UnionTypeBuilder
	{
		return new UnionTypeBuilder().addTypes(...types);
	}

	static createIntersection(types: Type[]): IntersectionTypeBuilder
	{
		return new IntersectionTypeBuilder().addTypes(...types);
	}

	static createArray(): ArrayTypeBuilder
	{
		return new ArrayTypeBuilder();
	}

	static createObject(): ObjectLiteralTypeBuilder
	{
		return new ObjectLiteralTypeBuilder();
	}

	static createProperty(description: PropertyDescription): PropertyBuilder
	{
		return new PropertyBuilder(description);
	}

	static createMethod(description: MethodDescription): MethodBuilder
	{
		return new MethodBuilder(description);
	}
}