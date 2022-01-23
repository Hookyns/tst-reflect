import {
	getType,
	Type,
	TypeKind
} from "tst-reflect";

abstract class Animal
{
	abstract get kind(): string;
	abstract get name(): string;

	protected constructor(protected readonly _kind: string)
	{
	}

	abstract makeSound();
}

const typeOfAnimal: Type = getType<Animal>();

console.log("Kind of the Type: ", TypeKind[typeOfAnimal.kind], " Name of the Type:", typeOfAnimal.name, " Full name of the Type:", typeOfAnimal.fullName, " Details:", typeOfAnimal);