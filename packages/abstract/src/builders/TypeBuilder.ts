import type { Type }               from "../Type";
import { IntersectionTypeBuilder } from "./IntersectionTypeBuilder";
import { UnionTypeBuilder }        from "./UnionTypeBuilder";

export abstract class TypeBuilder
{
	static createUnion(types: Type[]): UnionTypeBuilder
	{
		return new UnionTypeBuilder().addTypes(...types);
	}

	static createIntersection(types: Type[]): IntersectionTypeBuilder
	{
		return new IntersectionTypeBuilder().addTypes(...types);
	}
}