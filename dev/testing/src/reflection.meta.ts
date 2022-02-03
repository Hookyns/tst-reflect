import { NodeProcessMetaStore } from "tst-reflect";
function _tst_reflect_wrap(description?: any) {
    return NodeProcessMetaStore.get().wrap(description);
}
function _tst_reflect_lazy(typeId: number) {
    return NodeProcessMetaStore.get().getLazy(typeId);
}
function _tst_reflect_set(typeId: number, data: any): void {
    NodeProcessMetaStore.get().set(typeId, data);
}
function _tst_reflect_get(typeId: number) {
    return NodeProcessMetaStore.get().get(typeId);
}
_tst_reflect_set(15, { k: 1, n: "SomeServiceClass", fn: "@@this/dev/testing/src/ctor-reflection/SomeServiceClass.ts:SomeServiceClass#15", meths: [{ n: "someMethod", params: [], rt: _tst_reflect_wrap({ n: "string", k: 2, ctor: function () {
                    return String();
                } }), tp: [], o: false, am: 2 }], ctors: [{ params: [] }], ctorDesc: {
        en: "SomeServiceClass",
        n: "SomeServiceClass",
        srcPath: "/Users/sam/Code/Packages/ts-reflection/dev/testing/src/ctor-reflection/SomeServiceClass.ts",
        outPath: "/Users/sam/Code/Packages/ts-reflection/dev/testing/src/ctor-reflection/SomeServiceClass.ts"
    }, ctor: function () {
        return require("./ctor-reflection/SomeServiceClass").SomeServiceClass;
    } });
_tst_reflect_set(12, { k: 1, n: "default", fn: "@@this/dev/testing/src/ctor-reflection/Nested/NestedClass.ts:default#12", meths: [{ n: "someMethod", params: [], rt: _tst_reflect_wrap({ n: "string", k: 2, ctor: function () {
                    return String();
                } }), tp: [], o: false, am: 2 }], ctors: [{ params: [] }], ctorDesc: {
        en: "default",
        n: "NestedClass",
        srcPath: "/Users/sam/Code/Packages/ts-reflection/dev/testing/src/ctor-reflection/Nested/NestedClass.ts",
        outPath: "/Users/sam/Code/Packages/ts-reflection/dev/testing/src/ctor-reflection/Nested/NestedClass.ts"
    }, ctor: function () {
        return require("./ctor-reflection/Nested/NestedClass").default;
    } });
export { _tst_reflect_get, _tst_reflect_wrap, };
