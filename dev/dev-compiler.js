const ts = require("typescript");
const $path = require("path");
const glob = require("glob");

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

// TRANSFORMERS
const TRANSFORMERS = [
	(program) => require("../transformer/index").default(program/*, { rootDir: __dirname }*/),
];

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

// TypeScript config file
const options = require("./tsconfig");

// options.include must be set; **/*.ts otherwise
if (!options.hasOwnProperty("include")) {
	options.include = ["./**/*.ts"];
}

/**
 * Gets paths from patterns
 * @param pattern
 * @param files
 * @returns {Promise<void>}
 */
async function getPathsFromPatterns(pattern, files) {
	return new Promise((resolve, reject) => {
		glob(pattern, {absolute: true}, async (err, filePaths) => {
			const promises = [];

			try {
				for (let path of filePaths) {
					if (files.indexOf(path) === -1) {
						files.push(path);
					}
				}
				await Promise.all(promises);
				resolve();
			} catch (ex) {
				reject(ex);
			}
		});
	});
}

/**
 * Returns files paths and contents
 * @param options
 * @returns {Promise<Array<{path: string, content: string}>>}
 */
async function getFiles(options) {
	const excludeFilesPromises = [];
	const excludeFiles = [];

	if (options.hasOwnProperty("exclude")) {
		for (let excludePattern of options.exclude) {
			excludeFilesPromises.push(getPathsFromPatterns(excludePattern, excludeFiles));
		}
	}

	await Promise.all(excludeFilesPromises);

	const promises = [];
	let files = [];

	for (let pattern of options.include) {
		promises.push(
			getPathsFromPatterns(pattern, files)
		);

	}

	await Promise.all(promises);

	// Exclude wanted files
	files = files.filter(f => excludeFiles.indexOf(f) === -1);

	return Promise.resolve(files);
}

/**
 * Compiled typescript files with transformer by tsconfig.json from calling directory
 * @returns {Promise<void>}
 */
async function compile() {
	try {
		const files = await getFiles(options);

		// Create TS Program
		const program = ts.createProgram(files, options.compilerOptions);

		// If one specific file set as arg -> mb from watch
		let specificFile = undefined;
		let fileArg = process.argv.slice(2)[0];

		if (fileArg) {
			fileArg = $path.normalize(fileArg);
			let includedFile = files.filter(f => $path.normalize(f) === fileArg)[0];

			if (includedFile) {
				specificFile = program.getSourceFile(includedFile);
			}
		}

		// Create transformers from factories
		const before = [];
		for (let transformer of TRANSFORMERS) {
			before.push(transformer(program));
		}

		// Do transpilation and emit files by config
		let result = program.emit(specificFile, undefined, undefined, false, {before: before});

		if (result.emitSkipped) {
			console.error("Transpilation skipped");
		}

		if (result.emittedFiles) {
			for (let file of result.emittedFiles) {
				console.log("Emitting", file);
			}
		}

		for (let d of result.diagnostics) {
			console.log(d.messageText);
		}
	} catch (e) {
		console.error(e);
	}
}

compile()
	.then(() => {
		console.log("Compilation done.");
	})
	.catch(e => {
		console.error(e);
	});