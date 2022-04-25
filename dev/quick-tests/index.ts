import {
	Type,
	TypeKind
}                   from "@rtti/abstract";
import { getType }  from "tst-reflect";
import { SomeEnum } from "./SomeEnum";

getType<number>();

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
getType<Obj>();
getType<Obj>();
getType<ObjAlias>();
getType<{ foo: string, bar: number }>();