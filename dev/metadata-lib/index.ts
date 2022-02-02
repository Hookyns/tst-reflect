import { getType } from "tst-reflect";

class Animal
{
	name: string;
}

class WalkingAnimal extends Animal
{
	legCount: number;
}

getType<WalkingAnimal>();