import { getType } from "tst-reflect";

enum SomeEnum
{
	One,
	Two
}

interface Foo
{
	enum: SomeEnum;
}

const type = getType<Foo>();

console.log(type);

const enumProperty = type.getProperties().find(prop => prop.type.isEnum());

if (enumProperty)
{
	console.log(enumProperty.type.name, enumProperty.type.getEnum().getEnumerators());
}