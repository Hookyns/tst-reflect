import { getType } from "tst-reflect";

interface Animal
{
	name: string;
}

export class WalkingAnimal implements Animal
{
	legCount: number;
	sibling: Animal;
	name: string;
}

const type = getType<WalkingAnimal>();

console.log(type.getProperties()[1].type.getProperties());