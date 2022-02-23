import {
	Component,
	Input
} from "@angular/core";
import { Property } from "tst-reflect";

@Component({
	selector: "property-list",
	templateUrl: "./property-list.component.html",
})
export class PropertyListComponent
{
	@Input()
	properties: ReadonlyArray<Property> = [];
}
