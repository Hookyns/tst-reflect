# Welcome to TS Reflection Contributing Guide
Thank You for investing your time in contributing to my project! :tada:

## How to Start
* Fork the repository,
* create a branch with your feature,
* run `npm run inst` in root `.` directory, which is monorepo root (using npm workspaces) - this will create root `node_modules` directory with symlinks to the transformer and runtime packages,
* open project in your favorite IDE (I use JetBrains products such as Webstorm and Rider; there is an .editorconfig with all style rules in the repository),
* make your changes in `./runtime` and/or `./transformer`,
* cd into the `./dev/xxx`,
* `npx ttsc` and test your changes,
* make a PR into the `devel` branch.

## Debugging
Run compiler using `node ttypescript\bin\tsc` inside one of the dev directories, 
eg. `cd dev/di && node ../node_modules\ttypescript\bin\tsc`

### Debug mode
To enable debug logging, you must update tsconfig.json and add `reflection.debugMode = true`.

```json
{
    "reflection": {
        "debugMode": true
    }
}
```