# Usage With ts-node

1. Install packages,
```
npm i tst-reflect && npm i tst-reflect-transformer -D
```
2. add transformer to `tsconfig.json` and add `ts-node` section.
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
    },
    
    // ADD THIS!
    "ts-node": {
        // This can be omitted when using ts-patch
        "compiler": "ttypescript"
    }
}
```

> ts-node can be a little bugged if you use `reflection.metadata.type = "typelib"` option.