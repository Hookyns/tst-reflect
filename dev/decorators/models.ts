import {
	getType,
	Type
}                 from "tst-reflect";
import { entity } from './entity';

function propertyDecorator<TClass>(target: any, propertyName: string)
{
	console.log("target", Object.getOwnPropertyNames(target), target == Cat.prototype);
}

@entity
export class Cat {
	@propertyDecorator
	id = 0;
	toys: Toy[] = [];
	
	foo() {}
}

@entity
export class Toy {
	id = 0;
}
