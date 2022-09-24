import { NgModule }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent }          from "./app.component";
import { MethodListComponent }   from "./components/method-list/method-list.component";
import { PropertyListComponent } from "./components/property-list/property-list.component";

@NgModule({
  declarations: [
    AppComponent,
    MethodListComponent,
    PropertyListComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule
{
}
