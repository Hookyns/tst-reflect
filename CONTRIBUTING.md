# Welcome to TS Reflection Contributing Guide
Thank You for investing your time in contributing to my project! :tada:


## Debugging
Run compiler using `node ttypescript\bin\tsc` inside one of the dev folders, 
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