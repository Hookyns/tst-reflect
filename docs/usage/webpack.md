# Usage With Webpack

> If you use Angular or something else which has webpack encapsulated and under its own control, 
> this Usage variant may not work properly. 
> Angular has own [Usage](./angular.md) description.

## With `ts-loader`
> ! `ts-loader` is recommended because you don't need `ttypescript` and it has better performance than `awesome-typescript-loader`.

1. Install packages,
```
npm i tst-reflect && npm i tst-reflect-transformer -D
```
2. add transformer to `tsconfig.json`,
```json5
{
    "compilerOptions": {
        // your options...

        // ADD THIS!
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    }
}
```
3. modify your webpack config,
```javascript
const tstReflectTransform = require("tst-reflect-transformer").default;

module.exports = {
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                options: {
                    // ADD THIS OPTION!
                    getCustomTransformers: (program) => ({
                        before: [
                            tstReflectTransform(program)
                        ]
                    })
                }
            }
            // ... other rules
        ]
    }
    // ... other options
};
```
4. `webpack` or `webpack serve`

---

## With `awesome-typescript-loader`
1. Install packages,
```
npm i tst-reflect && npm i tst-reflect-transformer -D
```
2. add transformer to `tsconfig.json`,
```json5
{
    "compilerOptions": {
        // your options...

        // ADD THIS!
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    }
}
```
3. `npm i ttypescript -D`
> In order to use transformer plugin you need TypeScript compiler which supports plugins eg. package [ttypescript](https://www.npmjs.com/package/ttypescript) or you can use [TypeScript compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) manually.
4. modify your webpack config,
```javascript
({
    test: /\.(ts|tsx)$/,
    loader: "awesome-typescript-loader",
    options: {
        compiler: "ttypescript"
    }
})
```
5. `webpack` or `webpack serve`