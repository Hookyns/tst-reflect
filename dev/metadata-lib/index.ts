import { getType } from "tst-reflect";

class Animal
{
	name: string;
}

class WalkingAnimal extends Animal
{
	legCount: number;
	sibling: Animal;
}

const type = getType<WalkingAnimal>();

getType<Animal>();
console.log(type.getProperties()[1].type.getProperties());