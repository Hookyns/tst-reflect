const fs = require("fs");
const exec = require("child_process").execSync;

if (!fs.existsSync("./node_modules")) {
    try {
        console.log("initiating repl...");
        exec("npm i && cd ../transformer && npm i && npx tsc");
        console.log("repl initiated.");
    } catch (e) {
        console.error(e.message, "\\n", e.stack, "\\n", e);
    }
}
else {
    console.log("repl already initiated.");
}