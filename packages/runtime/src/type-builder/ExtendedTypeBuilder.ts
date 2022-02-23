import { ObjectLiteralTypeBuilder } from "./ObjectLiteralTypeBuilder";

import {
	ArrayTypeBuilder,
	IntersectionTypeBuilder,
	Type,
	TypeBuilder as AbstractTypeBuilder,
	UnionTypeBuilder
} from "@rtti/abstract";

export abstract class ExtendedTypeBuilder extends AbstractTypeBuilder
{
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