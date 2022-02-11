import { Type }                     from "../Type";
import { ArrayTypeBuilder }         from "./ArrayBuilder";
import { IntersectionTypeBuilder }  from "./IntersectionTypeBuilder";
import { ObjectLiteralTypeBuilder } from "./ObjectLiteralTypeBuilder";
import { UnionTypeBuilder }         from "./UnionTypeBuilder";

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
}