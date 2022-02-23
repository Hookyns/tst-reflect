import { Component } from "@angular/core";
import {
	getType,
	Type
}                    from "tst-reflect";

interface Foo
{
	foo: string;
	bar: number;
	baz?: boolean;

	lorem(ipsum: boolean): string;

	optionalMethod?(): void;
}

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.less"],
})
export class AppComponent
{
	type: Type = getType<Foo>();
}
