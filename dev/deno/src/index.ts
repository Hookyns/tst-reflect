// import { getType, Type } from "../../runtime/deno-reflect.js";

// @ts-ignore
import { getType, Type } from "https://github.com/Hookyns/tst-reflect/raw/main/runtime/deno/index.ts";
// import { getType, Type } from "../../../runtime/tst-reflect-deno/index.ts";

// import { getType } from "npm:tst-reflect";
// // @ts-ignore
// import { getType, InlineMetadataStore, Type } from "https://github.com/Hookyns/tst-reflect/raw/main/runtime/deno-reflect.js";
// InlineMetadataStore.initiate();

class Foo {
	foo: string;
	bar: number;
	baz: boolean;
}

console.log(getType<Foo>().name);