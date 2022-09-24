import {
  Component,
  Input
} from "@angular/core";
import { PropertyInfo } from "tst-reflect";

@Component({
  selector: "property-list",
  templateUrl: "./property-list.component.html",
})
export class PropertyListComponent
{
  @Input()
  public properties: ReadonlyArray<PropertyInfo> = [];
}
