interface Interface
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];
	arrayProp: Array<string>;
}

class Clss
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];
	arrayProp: Array<string>;

	initializedStringProp = "string";
	initializedAnyProp: any = true;
	initializedStringArrayProp = ["string"];
	initializedArrayProp: Array<string> = ["string"];
}

console.log(getType);