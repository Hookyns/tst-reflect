import { TestingClass }         from "../TestingClass";
import { SomeServiceInterface } from "./SomeServiceInterface";

export class SomeService implements SomeServiceInterface
{

	public propertyName: string = "hello?";
	public impls: TestingClass = null;

	constructor(name: string, impls: TestingClass)
	{
		this.propertyName = name;
		this.impls = impls;
	}

	getMessage()
	{
		return 'Hi there!';
	}


	public randomMethod()
	{
	}

}
