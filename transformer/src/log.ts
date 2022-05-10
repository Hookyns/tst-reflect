import { PACKAGE_ID } from "./helpers";

export const color = {
	yellow: 33,
	red: 31,
	blue: 34,
	magenta: 35,
	cyan: 36,
	gray: 90
};

export enum LogLevel
{
	Trace = "TRA",
	Info = "INF",
	Warning = "WRN",
	Error = "ERR",
	Debug = "DBG"
}

export class Logger
{
	private readonly contextSuffix: string;

	constructor(context?: string)
	{
		this.contextSuffix = context ? "\n\tIn " + context : "";
	}

	log(level: LogLevel, color?: number, ...args: any[])
	{
		if (color)
		{
			console.log.apply(undefined, [`\x1b[${color}m[${level}] ${PACKAGE_ID}:`, ...args, this.contextSuffix, "\x1b[0m"]);
		}
		else
		{
			console.log.apply(undefined, [`[${level}] ${PACKAGE_ID}:`, ...args, this.contextSuffix]);
		}
	}

	/**
	 * Log INFO message
	 * @param args
	 */
	info(...args: any[])
	{
		this.log(LogLevel.Info, undefined, ...args);
	}

	/**
	 * Log TRACE message
	 * @param args
	 */
	trace(...args: any[])
	{
		this.log(LogLevel.Trace, color.gray, ...args);
	}

	/**
	 * Log WARN message
	 * @param args
	 */
	warn(...args: any[])
	{
		this.log(LogLevel.Warning, color.yellow, ...args);
	}

	/**
	 * Log ERROR message
	 * @param args
	 */
	error(...args: any[])
	{
		this.log(LogLevel.Error, color.red, ...args);
	}

	/**
	 * Log DEBUG message
	 * @param args
	 */
	debug(...args: any[])
	{
		this.log(LogLevel.Debug, color.magenta, ...args);
	}
}

export const log = new Logger();