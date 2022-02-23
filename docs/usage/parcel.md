# Usage With Parcel

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
3. install Parcel plugin `npm i parcel-plugin-ttypescript`.