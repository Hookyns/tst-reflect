import {getType}            from "../types";
import {inject, injectable} from "./decorators";

export interface ILogger {
	log(msg: string);
}

export interface IService
{
	prop: string | number;

	whoAmI();

	method2();
}


@injectable()
export class Service implements IService
{
	prop: string | number;

	@inject()
	private readonly logger: ILogger;

	public get Logger() {
		return this.logger;
	}

	constructor(logger: ILogger)
	{
		this.logger = logger;
	}

	whoAmI()
	{
		console.log(getType<Service>());
	}

	method2()
	{
	}

	static staticProp: string;
}