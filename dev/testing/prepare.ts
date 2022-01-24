#!/usr/bin/env ts-node


import {
	exec,
	ExecException
}                from "child_process";
import watch     from 'node-watch';
import * as fs   from "fs";
import * as path from "path";

const transformerDirectory = path.join(process.cwd(), '..', '..', 'transformer');
const runtimeDirectory = path.join(process.cwd(), '..', '..', 'runtime');
const currentDirectory = process.cwd();

const packages = [
	{
		directory: path.join(process.cwd(), '..', '..', 'transformer'),
		name: 'tst-reflect-transformer'
	},
	{
		directory: path.join(process.cwd(), '..', '..', 'runtime'),
		name: 'tst-reflect'
	},
];

const linked = [];

const hasLinked = (packageName: string) => {
	if (!linked.includes(packageName))
	{
		linked.push(packageName);
	}

	console.log(`-------`);

	if (linked.length >= 2)
	{
		startWatching();
	}
};

const runCmd = (cmd: string, cwd: string, cb?: (stdout: string, stderr: string) => any) => {
	const execCallback = (error: ExecException | null, stdout: string, stderr: string) => {
		if (error)
		{
			console.error(error);
			return;
		}

		process.stderr.write(stderr);
		process.stdout.write(stdout);

		if (cb)
		{
			cb(stdout, stderr);
		}
	};

	exec(cmd, { cwd }, execCallback);
};

const linkPackage = (packageDir: string, packageName: string) => {
	const execCallback = (stdout: string, stderr: string) => {
		if (stdout.includes('Done in'))
		{
			hasLinked(packageName);
		}
	};

	runCmd('yarn link', packageDir, execCallback);
	runCmd(`yarn link "${packageName}"`, currentDirectory, execCallback);
};

packages.forEach((pkg) => {
	console.log(`-------`);
	console.log(`Linking package: ${pkg.name} at ${pkg.directory}`);
	linkPackage(pkg.directory, pkg.name);
});

const startWatching = () => {
	console.log('-------');
	console.log(`Watching for package changes in:\n ${packages.map(p => p.directory).join('\n')}`);

	const options = {
		recursive: true,
		delay: 1000,
		filter(f, skip) {
			// skip node_modules
			if (/\/node_modules/.test(f)) return skip;
			// only watch for ts files
			return /\.ts$/.test(f);
		}
	}

	packages.forEach(pkg => {
		let building = false;

		watch(pkg.directory, options, function (evt, name) {
			console.log('[%s] %s changed.', pkg.name, name);

			if(building) {
				return;
			}
			console.log('[%s] Running build.', pkg.name);
			building = true;
			runCmd(`tsc`, pkg.directory, (stdout: string, stderr: string) => {
				console.log("[%s] Build run.", pkg.name);
				building = false;
			});
		});
	});
};



