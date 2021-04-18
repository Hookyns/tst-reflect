import {getType, reflectGeneric}        from "tst-reflect";
// import {reflectGeneric} from "../runtime/reflect";

interface ILogger {}

abstract class LoggerFactory {
	// createLogger(categoryName: string): ILogger;
	createLogger<TCategory = undefined>(...categoryName: TCategory extends undefined ? [string] : []): ILogger
	// @reflectGeneric()
	// createLogger<TCategory = undefined>(categoryName?: string): ILogger
	{
		const type = getType<TCategory>();
		console.dir(type);
		const category = categoryName?.[0] ?? type?.name;
		console.log(category);
		return {};
	}
}

class DefaultLoggerFactory extends LoggerFactory {
	
}

class Builder {
	build(): LoggerFactory {
		return new DefaultLoggerFactory();
	}
}

class SomeType {
	array: Array<{ foo: string, bar: string }> = [];
}

const factory = new Builder().build();
factory.createLogger<{foo: string, bar: "a" | "b"}>();
factory.createLogger<[fo: string]>();
factory.createLogger<SomeType>();