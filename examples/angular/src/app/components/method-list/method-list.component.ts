import {
  Component,
  Input
}                     from "@angular/core";
import { MethodInfo } from "tst-reflect";

@Component({
  selector: "method-list",
  templateUrl: "./method-list.component.html",
})
export class MethodListComponent
{
  @Input()
  public methods: ReadonlyArray<MethodInfo> = [];
}
