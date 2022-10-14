// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

let _TypeBuilder = {};
function setTypeBuilder(typeBuilder) {
    _TypeBuilder = typeBuilder;
}
function flatten(typeToFlatten) {
    const interfaceMembers = typeToFlatten.interface?.flattenInheritedMembers() ?? {
        properties: {},
        methods: {}
    };
    const baseTypeMembers = typeToFlatten.baseType?.flattenInheritedMembers() ?? {
        properties: {},
        methods: {}
    };
    const properties = Object.assign(interfaceMembers.properties, baseTypeMembers.properties);
    const methods = Object.assign(interfaceMembers.methods, baseTypeMembers.methods);
    if (typeToFlatten.isUnionOrIntersection()) {
        const propertyUnitedMap = new Map();
        const methodUnitedMap = new Map();
        for (const type of typeToFlatten.types){
            for (let property of type.getProperties()){
                let array = propertyUnitedMap.get(property.name);
                if (!array) {
                    propertyUnitedMap.set(property.name, array = []);
                }
                array.push(property);
            }
            for (let method of type.getMethods()){
                let array1 = methodUnitedMap.get(method.name);
                if (!array1) {
                    methodUnitedMap.set(method.name, array1 = []);
                }
                array1.push(method);
            }
        }
        if (typeToFlatten.isUnion()) {
            const typesCount = typeToFlatten.types.length;
            for (let [propertyName, unitedProperties] of propertyUnitedMap){
                if (unitedProperties.length == typesCount) {
                    properties[propertyName] = _TypeBuilder.createProperty({
                        n: propertyName,
                        t: _TypeBuilder.createUnion(unitedProperties.map((prop)=>prop.type)).build(),
                        o: unitedProperties.every((prop)=>prop.optional),
                        ro: unitedProperties.some((prop)=>prop.readonly)
                    }).build();
                }
            }
        } else if (typeToFlatten.isIntersection()) {
            for (let [propertyName1, intersectionedProperties] of propertyUnitedMap){
                properties[propertyName1] = _TypeBuilder.createProperty({
                    n: propertyName1,
                    t: _TypeBuilder.createIntersection(intersectionedProperties.map((prop)=>prop.type)).build(),
                    o: intersectionedProperties.every((prop)=>prop.optional),
                    ro: intersectionedProperties.some((prop)=>prop.readonly)
                }).build();
            }
        }
    }
    for (let property1 of typeToFlatten.getProperties()){
        properties[property1.name] = property1;
    }
    for (let method1 of typeToFlatten.getMethods()){
        methods[method1.name] = method1;
    }
    return {
        properties,
        methods
    };
}
var TypeKind;
(function(TypeKind) {
    TypeKind[TypeKind["Interface"] = 0] = "Interface";
    TypeKind[TypeKind["Class"] = 1] = "Class";
    TypeKind[TypeKind["Native"] = 2] = "Native";
    TypeKind[TypeKind["Container"] = 3] = "Container";
    TypeKind[TypeKind["TransientTypeReference"] = 4] = "TransientTypeReference";
    TypeKind[TypeKind["Object"] = 5] = "Object";
    TypeKind[TypeKind["LiteralType"] = 6] = "LiteralType";
    TypeKind[TypeKind["Tuple"] = 7] = "Tuple";
    TypeKind[TypeKind["TypeParameter"] = 8] = "TypeParameter";
    TypeKind[TypeKind["ConditionalType"] = 9] = "ConditionalType";
    TypeKind[TypeKind["IndexedAccess"] = 10] = "IndexedAccess";
    TypeKind[TypeKind["Module"] = 11] = "Module";
    TypeKind[TypeKind["Method"] = 12] = "Method";
    TypeKind[TypeKind["Enum"] = 13] = "Enum";
    TypeKind[TypeKind["Function"] = 14] = "Function";
})(TypeKind || (TypeKind = {}));
var Accessor;
(function(Accessor) {
    Accessor[Accessor["None"] = 0] = "None";
    Accessor[Accessor["Getter"] = 1] = "Getter";
    Accessor[Accessor["Setter"] = 2] = "Setter";
})(Accessor || (Accessor = {}));
var AccessModifier;
(function(AccessModifier) {
    AccessModifier[AccessModifier["Private"] = 0] = "Private";
    AccessModifier[AccessModifier["Protected"] = 1] = "Protected";
    AccessModifier[AccessModifier["Public"] = 2] = "Public";
})(AccessModifier || (AccessModifier = {}));
export { TypeKind as TypeKind };
export { Accessor as Accessor };
export { AccessModifier as AccessModifier };
class Decorator {
    name;
    fullName;
    args;
    constructor(description){
        this.name = description.n;
        this.fullName = description.fn;
        this.args = description.args || [];
    }
    getArguments() {
        return this.args.slice();
    }
}
class DecoratorActivator extends Decorator {
}
export { Decorator as Decorator };
export { DecoratorActivator as DecoratorActivator };
class ConstructorImport {
    _name;
    _exportName;
    _sourcePath;
    _outPath;
    constructor(description){
        if (new.target != ConstructorImportActivator) {
            throw new Error("You cannot create instance of Method manually!");
        }
        if (!description) {
            return;
        }
        this._name = description.n;
        this._exportName = description.en;
        this._sourcePath = description.srcPath;
        this._outPath = description.outPath;
    }
    get name() {
        return this._name;
    }
    get exportName() {
        return this._exportName;
    }
    get sourcePath() {
        return this._sourcePath;
    }
    get outPath() {
        return this._outPath;
    }
}
class ConstructorImportActivator extends ConstructorImport {
}
export { ConstructorImport as ConstructorImport };
export { ConstructorImportActivator as ConstructorImportActivator };
class LazyType {
    resolvedType;
    typeResolver;
    get type() {
        return this.resolvedType ?? (this.resolvedType = this.typeResolver());
    }
    constructor(type){
        if (typeof type === "function") {
            this.typeResolver = type.name === "lazyType" ? type : ()=>Type.Unknown;
        } else {
            this.typeResolver = ()=>Type.Undefined;
            this.resolvedType = type;
        }
    }
}
class FunctionInfo {
    _parameters;
    _returnType;
    _typeParameters;
    get returnType() {
        return this._returnType.type;
    }
    constructor(description){
        this._parameters = description.params?.map((param)=>new Parameter(param)) || [];
        this._typeParameters = description.tp?.map((t)=>new LazyType(t)) || [];
        this._returnType = new LazyType(description.rt);
    }
    getParameters() {
        return this._parameters.slice();
    }
    getTypeParameters() {
        return this._typeParameters.map((tp)=>tp.type);
    }
}
class IndexedAccessType {
    _objectType;
    _indexType;
    get objectType() {
        return this._objectType.type;
    }
    get indexType() {
        return this._indexType.type;
    }
    constructor(properties){
        this._objectType = new LazyType(properties.ot);
        this._indexType = new LazyType(properties.it);
    }
}
class ConditionalType {
    _extends;
    _trueType;
    _falseType;
    get extends() {
        return this._extends.type;
    }
    get trueType() {
        return this._trueType.type;
    }
    get falseType() {
        return this._falseType.type;
    }
    constructor(properties){
        this._extends = new LazyType(properties.e);
        this._trueType = new LazyType(properties.tt);
        this._falseType = new LazyType(properties.ft);
    }
}
class PropertyInfo {
    _type;
    _decorators;
    name;
    get type() {
        return this._type.type;
    }
    optional;
    accessModifier;
    accessor;
    readonly;
    constructor(description){
        this.name = description.n;
        this._type = new LazyType(description.t);
        this._decorators = description.d?.map(Mapper.mapDecorators) || [];
        this.optional = description.o;
        this.accessModifier = description.am ?? AccessModifier.Public;
        this.accessor = description.acs ?? Accessor.None;
        this.readonly = description.ro ?? false;
    }
    getDecorators() {
        return this._decorators.slice();
    }
}
class PropertyInfoActivator extends PropertyInfo {
}
class IndexInfo {
    _keyType;
    _type;
    get keyType() {
        return this._keyType.type;
    }
    get type() {
        return this._type.type;
    }
    readonly;
    constructor(description){
        this._keyType = new LazyType(description.k);
        this._type = new LazyType(description.t);
        this.readonly = description.ro ?? false;
    }
}
class MethodBase {
    _parameters;
    constructor(params){
        this._parameters = params?.map((param)=>new Parameter(param)) || [];
    }
    getParameters() {
        return this._parameters.slice();
    }
}
class MethodInfo extends MethodBase {
    _name;
    _returnType;
    _optional;
    _typeParameters;
    _decorators;
    _accessModifier;
    get name() {
        return this._name;
    }
    get returnType() {
        return this._returnType.type;
    }
    get optional() {
        return this._optional;
    }
    get accessModifier() {
        return this._accessModifier;
    }
    constructor(description){
        super(description.params);
        if (new.target != MethodInfoActivator) {
            throw new Error("You cannot create instance of Method manually!");
        }
        this._name = description.n;
        this._typeParameters = description.tp?.map((t)=>new LazyType(t)) || [];
        this._returnType = new LazyType(description.rt);
        this._optional = description.o;
        this._accessModifier = description.am;
        this._decorators = description.d?.map(Mapper.mapDecorators) || [];
    }
    getTypeParameters() {
        return this._typeParameters.map((tp)=>tp.type);
    }
    getDecorators() {
        return this._decorators.slice();
    }
}
class MethodInfoActivator extends MethodInfo {
}
export { MethodInfoActivator as MethodInfoActivator };
class ConstructorInfo extends MethodBase {
    constructor(description){
        super(description.params);
        if (new.target != ConstructorInfoActivator) {
            throw new Error("You cannot create instance of Constructor manually!");
        }
    }
}
export { ConstructorInfo as ConstructorInfo };
class ConstructorInfoActivator extends ConstructorInfo {
}
const Mapper = {
    mapDecorators (d) {
        return Reflect.construct(Decorator, [
            d
        ], DecoratorActivator);
    },
    mapProperties (p) {
        return Reflect.construct(PropertyInfo, [
            p
        ], PropertyInfoActivator);
    },
    mapIndexes (i) {
        return new IndexInfo(i);
    },
    mapConstructors (c) {
        return Reflect.construct(ConstructorInfo, [
            c
        ], ConstructorInfoActivator);
    },
    mapMethods (m) {
        return Reflect.construct(MethodInfo, [
            m
        ], MethodInfoActivator);
    }
};
class Parameter {
    _type;
    name;
    get type() {
        return this._type.type;
    }
    optional;
    constructor(properties){
        this._type = new LazyType(properties.t);
        this.name = properties.n;
        this.optional = properties.o;
    }
}
class Type {
    static Object;
    static Unknown;
    static Any;
    static Void;
    static String;
    static Number;
    static BigInt;
    static Boolean;
    static Date;
    static Null;
    static Undefined;
    static Never;
    _ctor;
    _ctorDesc;
    _kind;
    _name;
    _fullName;
    _isUnion;
    _isIntersection;
    _types;
    _properties;
    _indexes;
    _methods;
    _decorators;
    _constructors;
    _typeParameters;
    _baseType;
    _interface;
    _literalValue;
    _typeArgs;
    _conditionalType;
    _indexedAccessType;
    _functionSignatures;
    _genericTypeConstraint;
    _genericTypeDefault;
    _genericTypeDefinition;
    _isGenericType;
    static _store = {
        store: {},
        get (id) {
            return undefined;
        },
        set (id, description) {
            return Type.Unknown;
        },
        getLazy (id) {
            return ()=>undefined;
        },
        wrap (description) {
            return Type.Unknown;
        }
    };
    constructor(){
        if (new.target != TypeActivator) {
            throw new Error("You cannot create instance of Type manually!");
        }
    }
    initialize(description) {
        this._name = description.n || "";
        this._fullName = description.fn || description.n || "";
        this._kind = description.k;
        this._constructors = description.ctors?.map(Mapper.mapConstructors) || [];
        this._properties = description.props?.map(Mapper.mapProperties) || [];
        this._indexes = description.indxs?.map(Mapper.mapIndexes) || [];
        this._methods = description.meths?.map(Mapper.mapMethods) || [];
        this._decorators = description.decs?.map(Mapper.mapDecorators) || [];
        this._typeParameters = description.tp?.map((t)=>new LazyType(t)) || [];
        this._ctor = description.ctor;
        this._ctorDesc = Reflect.construct(ConstructorImport, [
            description.ctorDesc
        ], ConstructorImportActivator);
        this._interface = description.iface ? new LazyType(description.iface) : undefined;
        this._isUnion = description.union || false;
        this._isIntersection = description.inter || false;
        this._types = description.types?.map((t)=>new LazyType(t)) || [];
        this._literalValue = description.v;
        this._typeArgs = description.args?.map((t)=>new LazyType(t)) || [];
        this._conditionalType = description.ct ? new ConditionalType(description.ct) : undefined;
        this._indexedAccessType = description.iat ? new IndexedAccessType(description.iat) : undefined;
        this._functionSignatures = description.sg?.map((signature)=>new FunctionInfo(signature)) ?? [];
        this._genericTypeConstraint = description.con ? new LazyType(description.con) : undefined;
        this._genericTypeDefault = description.def ? new LazyType(description.def) : undefined;
        this._isGenericType = description.isg ? description.isg : false;
        this._genericTypeDefinition = description.gtd ? new LazyType(description.gtd) : undefined;
        this._baseType = description.bt ? new LazyType(description.bt) : this.isNative() && this.name === "Object" && (!description.props || !description.props.length) ? undefined : new LazyType(Type.Object);
    }
    get condition() {
        return this._conditionalType;
    }
    get indexedAccessType() {
        return this._indexedAccessType;
    }
    get types() {
        return this._types.map((t)=>t.type);
    }
    get constructorDescription() {
        return this._ctorDesc || undefined;
    }
    get genericTypeDefinition() {
        return this._genericTypeDefinition?.type;
    }
    get baseType() {
        return this._baseType?.type;
    }
    get interface() {
        return this._interface?.type;
    }
    get fullName() {
        return this._fullName;
    }
    get name() {
        return this._name;
    }
    get kind() {
        return this._kind;
    }
    get literalValue() {
        return this._literalValue;
    }
    get genericTypeConstraint() {
        return this._genericTypeConstraint?.type;
    }
    get genericTypeDefault() {
        return this._genericTypeDefault;
    }
    static find(filter) {
        for(let storeKey in this._store.store){
            if (filter(this._store.store[storeKey])) {
                return this._store.store[storeKey];
            }
        }
        return undefined;
    }
    static getTypes() {
        return Object.values(this._store.store);
    }
    static get store() {
        return this._store;
    }
    static _setStore(store) {
        this._store = store;
    }
    is(type) {
        if (this == Type.Unknown) {
            return false;
        }
        return type != undefined && this._fullName == type._fullName && !!this._fullName;
    }
    isUnion() {
        return this._isUnion;
    }
    isIntersection() {
        return this._isIntersection;
    }
    isInstantiable() {
        return !!this.getConstructors()?.length;
    }
    isClass() {
        return this.kind == TypeKind.Class;
    }
    isInterface() {
        return this.kind == TypeKind.Interface;
    }
    isLiteral() {
        return this._kind == TypeKind.LiteralType;
    }
    isObjectLiteral() {
        return this._kind == TypeKind.Object;
    }
    isUnionOrIntersection() {
        return this.isUnion() || this.isIntersection();
    }
    isNative() {
        return this.kind === TypeKind.Native;
    }
    isGenericType() {
        return this._isGenericType;
    }
    isPrimitive() {
        return this.kind === TypeKind.Native && (this == Type.String || this == Type.Number || this == Type.BigInt || this == Type.Undefined || this == Type.Null || this == Type.Void || this == Type.Boolean || this == Type.Never);
    }
    isString() {
        return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "string";
    }
    isNumber() {
        return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "number";
    }
    isSymbol() {
        return this.isNative() && this.name.toLowerCase() == "symbol";
    }
    isBoolean() {
        return (this.isNative() || this.kind == TypeKind.LiteralType) && this.name.toLowerCase() == "boolean";
    }
    isArray() {
        return (this.isNative() || this.kind == TypeKind.LiteralType || this.kind == TypeKind.TransientTypeReference) && (this.name == "Array" || this.name == "ReadonlyArray");
    }
    isPromise() {
        return this.isNative() && this.name == "Promise";
    }
    isTuple() {
        return this.kind == TypeKind.Tuple;
    }
    isAny() {
        return this.isNative() && this.name == "any";
    }
    isUnknown() {
        return this.isNative() && this.name == "unknown";
    }
    isUndefined() {
        return this.isNative() && this.name == "undefined";
    }
    isNull() {
        return this.isNative() && this.name == "null";
    }
    isTrue() {
        return this.isNative() && this.name == "true";
    }
    isFalse() {
        return this.isNative() && this.name == "false";
    }
    isObjectLike() {
        return this.isObjectLiteral() || this.isClass() || this.isInterface();
    }
    isEnum() {
        return this.kind == TypeKind.Enum;
    }
    getEnum() {
        if (!this.isEnum()) {
            return undefined;
        }
        const entries = this.types?.map((type)=>Object.freeze([
                type.name,
                type.literalValue
            ])) || [];
        return {
            getValues () {
                return entries.map((entry)=>entry[1]);
            },
            getEntries () {
                return entries.slice();
            },
            getEnumerators () {
                return entries.map((entry)=>entry[0]);
            }
        };
    }
    getCtor() {
        return this._ctor?.() ?? Promise.resolve(undefined);
    }
    getSignatures() {
        return this._functionSignatures.slice();
    }
    getTypeParameters() {
        return this._typeParameters.map((t)=>t.type);
    }
    getTypeArguments() {
        return this._typeArgs.map((t)=>t.type);
    }
    getConstructors() {
        if (!this.isClass()) {
            return undefined;
        }
        return this._constructors.slice();
    }
    getProperties() {
        return this._properties.slice();
    }
    getIndexes() {
        return this._indexes.slice();
    }
    getMethods() {
        return this._methods.slice();
    }
    getDecorators() {
        return this._decorators.slice();
    }
    flattenInheritedMembers() {
        return flatten(this);
    }
    isSubclassOf(classType) {
        if (!classType.isClass()) {
            return false;
        }
        return this.isClass() && !!this.baseType && (this.baseType.is(classType) || this.baseType.isSubclassOf(classType));
    }
    isDerivedFrom(targetType) {
        return this.is(targetType) || this.baseType?.isAssignableTo(targetType) || this.interface?.isAssignableTo(targetType) || false;
    }
    isStructurallyAssignableTo(target) {
        if (!this.isObjectLike() || !target.isObjectLike()) {
            return false;
        }
        const currentMembers = this.flattenInheritedMembers();
        const currentProperties = Object.values(currentMembers.properties);
        const currentMethods = Object.values(currentMembers.methods);
        const targetMembers = target.flattenInheritedMembers();
        const targetProperties = Object.values(targetMembers.properties);
        const targetMethods = Object.values(targetMembers.methods);
        return targetProperties.every((targetProperty)=>targetProperty.optional || currentProperties.some((currentProperty)=>currentProperty.name == targetProperty.name && currentProperty.type.isAssignableTo(targetProperty.type))) && targetMethods.every((targetMethod)=>targetMethod.optional || currentMethods.some((currentMethod)=>{
                const currentMethodParameters = currentMethod.getParameters();
                return currentMethod.name == targetMethod.name && targetMethod.getParameters().every((targetMethodParam, i)=>{
                    const currentMethodParam = currentMethodParameters[i];
                    if (currentMethodParam == undefined) {
                        return targetMethodParam.optional;
                    }
                    return currentMethodParam.type.isAssignableTo(targetMethodParam.type);
                });
            }));
    }
    isAssignableTo(target) {
        if (this.isAny() || target.isAny()) {
            return true;
        }
        if ((this.isTrue() || this.isFalse()) && target.isBoolean()) {
            return true;
        }
        if (this.kind == TypeKind.Container || target.kind == TypeKind.Container) {
            if (target.kind != TypeKind.Container) {
                return false;
            }
            if (this.kind != TypeKind.Container) {
                return target.types?.some((targetType)=>this.isAssignableTo(targetType)) || false;
            }
            if (!(this.isUnion() == target.isUnion() && this.isIntersection() == target.isIntersection())) {
                return false;
            }
            return this.types?.every((thisType)=>target.types?.some((targetType)=>thisType.isAssignableTo(targetType))) || false;
        }
        if (this.isArray() != target.isArray()) {
            return false;
        }
        if (this.isArray()) {
            return this.getTypeArguments()[0].isDerivedFrom(target.getTypeArguments()[0]) || this.isStructurallyAssignableTo(target.getTypeArguments()[0]) || false;
        }
        return this.isDerivedFrom(target) || this.isStructurallyAssignableTo(target) || false;
    }
    toString() {
        return `{${TypeKind[this.kind]} ${this.name} (${this.fullName})}`;
    }
}
class TypeActivator extends Type {
}
export { IndexedAccessType as IndexedAccessType };
export { ConditionalType as ConditionalType };
export { MethodBase as MethodBase };
export { MethodInfo as MethodInfo };
export { ConstructorInfoActivator as ConstructorInfoActivator };
export { PropertyInfo as PropertyInfo };
export { PropertyInfoActivator as PropertyInfoActivator };
export { Parameter as Parameter };
let typeIdCounter = 0;
class TypeBuilderBase {
    typeName = "dynamic";
    fullName;
    constructor(){
        this.fullName = TypeBuilderBase.generateFullName();
    }
    static generateFullName() {
        return "@@dynamic/" + Date.now().toString(16) + ++typeIdCounter;
    }
    setName(typeName) {
        this.typeName = typeName;
    }
}
class FunctionBuilder extends TypeBuilderBase {
    parameters = [];
    returnType = Type.Unknown;
    constructor(){
        super();
        this.setName("");
    }
    static fromFunction(object) {
        if (!object) {
            return Type.Undefined;
        }
        const builder = new FunctionBuilder();
        builder.setName(object.name ?? "");
        const paramsIterator = Array.from(Array(object.length).keys());
        builder.setParameters(paramsIterator.map((i)=>({
                n: "param" + i,
                t: Type.Any,
                o: false
            })));
        builder.setReturnType(Type.Unknown);
        return builder.build();
    }
    setParameters(parameters) {
        this.parameters = parameters;
    }
    setReturnType(returnType) {
        this.returnType = returnType;
    }
    build() {
        return Type.store.wrap({
            k: TypeKind.Function,
            n: this.typeName,
            fn: this.fullName,
            fnc: {
                params: this.parameters,
                tp: [],
                rt: this.returnType
            }
        });
    }
}
const TYPE_ID_PROPERTY_NAME = "__tst_reflect__";
const REFLECT_DECORATOR = "reflect";
const GET_TYPE_FNC_NAME = "getType";
const REFLECT_STORE_SYMBOL = Symbol("tst_reflect_store");
const REFLECTED_TYPE_ID = "__reflectedTypeId__";
export { TYPE_ID_PROPERTY_NAME as TYPE_ID_PROPERTY_NAME };
export { REFLECT_DECORATOR as REFLECT_DECORATOR };
export { GET_TYPE_FNC_NAME as GET_TYPE_FNC_NAME };
export { REFLECT_STORE_SYMBOL as REFLECT_STORE_SYMBOL };
export { REFLECTED_TYPE_ID as REFLECTED_TYPE_ID };
class ArrayTypeBuilder extends TypeBuilderBase {
    type;
    constructor(){
        super();
        this.typeName = "Array";
    }
    setGenericType(type) {
        this.type = type;
        return this;
    }
    build() {
        return Type.store.wrap({
            k: TypeKind.Native,
            n: this.typeName,
            fn: this.fullName,
            args: [
                this.type ?? Type.Any
            ],
            ctor: ()=>Array
        });
    }
}
class IntersectionTypeBuilder extends TypeBuilderBase {
    types = new Set();
    addTypes(...types) {
        for (let type of types){
            this.types.add(type);
        }
        return this;
    }
    build() {
        const types = Array.from(this.types);
        if (types.some((t)=>t.isPrimitive())) {
            return Type.Never;
        }
        return Type.store.wrap({
            k: TypeKind.Container,
            n: this.typeName,
            fn: this.fullName,
            inter: true,
            types: types
        });
    }
}
class MethodBuilder {
    constructor(description){
        this.description = description;
    }
    build() {
        return Reflect.construct(MethodInfo, [
            this.description
        ], MethodInfoActivator);
    }
    description;
}
class PropertyBuilder {
    constructor(description){
        this.description = description;
    }
    build() {
        return Reflect.construct(PropertyInfo, [
            this.description
        ], PropertyInfoActivator);
    }
    description;
}
class UnionTypeBuilder extends TypeBuilderBase {
    types = new Set();
    addTypes(...types) {
        for (let type of types){
            this.types.add(type);
        }
        return this;
    }
    build() {
        const types = Array.from(this.types);
        if (types.length === 0) {
            return Type.Undefined;
        }
        if (types.length === 1) {
            return types[0];
        }
        return Type.store.wrap({
            k: TypeKind.Container,
            n: this.typeName,
            fn: this.fullName,
            union: true,
            types: types
        });
    }
}
class TypeBuilder {
    constructor(){}
    static createUnion(types) {
        return new UnionTypeBuilder().addTypes(...types);
    }
    static createIntersection(types) {
        return new IntersectionTypeBuilder().addTypes(...types);
    }
    static createArray() {
        return new ArrayTypeBuilder();
    }
    static createObject() {
        return new ObjectLiteralTypeBuilder();
    }
    static createProperty(description) {
        return new PropertyBuilder(description);
    }
    static createMethod(description) {
        return new MethodBuilder(description);
    }
}
class ObjectLiteralTypeBuilder extends TypeBuilderBase {
    properties = [];
    constructor(){
        super();
        this.setName("Object");
    }
    static fromObject(object) {
        if (!object) {
            return Type.Undefined;
        }
        if (object.constructor !== Object) {
            return Type.Unknown;
        }
        const builder = new ObjectLiteralTypeBuilder();
        builder.setName(object.constructor.name || "Object");
        const descriptors = Object.getOwnPropertyDescriptors(object);
        for(let prop in descriptors){
            if (descriptors.hasOwnProperty(prop)) {
                const desc = descriptors[prop];
                const type = getTypeOfRuntimeValue(object[prop]);
                if (desc.get) {
                    builder.addProperty({
                        n: prop,
                        t: type,
                        o: false,
                        acs: Accessor.Getter,
                        ro: true
                    });
                }
                if (desc.set) {
                    builder.addProperty({
                        n: prop,
                        t: type,
                        o: false,
                        acs: Accessor.Setter,
                        ro: false
                    });
                } else if (!desc.get && !desc.set) {
                    builder.addProperty({
                        n: prop,
                        t: type,
                        o: false,
                        ro: !desc.writable
                    });
                }
            }
        }
        return builder.build();
    }
    addProperty(description) {
        this.properties.push(description);
        return this;
    }
    build() {
        return Type.store.wrap({
            k: TypeKind.Object,
            n: this.typeName,
            fn: this.fullName,
            props: this.properties
        });
    }
}
function getTypeOfRuntimeValue(value) {
    if (value === undefined) return Type.Undefined;
    if (value === null) return Type.Null;
    if (typeof value === "string") return Type.String;
    if (typeof value === "number") return Type.Number;
    if (typeof value === "boolean") return Type.Boolean;
    if (value instanceof Date) return Type.Date;
    if (value.constructor === Object) return ObjectLiteralTypeBuilder.fromObject(value);
    if (!value.constructor) {
        return Type.Unknown;
    }
    if (value.constructor == Array) {
        const set = new Set();
        for (let item of value.slice(0, 10)){
            set.add(getTypeOfRuntimeValue(item));
        }
        const valuesTypes = Array.from(set);
        const arrayBuilder = TypeBuilder.createArray();
        if (value.length == 0) {
            return arrayBuilder.setGenericType(Type.Any).build();
        }
        const unionBuilder = TypeBuilder.createUnion(valuesTypes);
        if (value.length > 10) {
            unionBuilder.addTypes(Type.Unknown);
        }
        return arrayBuilder.setGenericType(unionBuilder.build()).build();
    }
    if (typeof value === "function" && (value.prototype == undefined || Object.getOwnPropertyDescriptor(value, "prototype")?.writable === true)) {
        return FunctionBuilder.fromFunction(value);
    }
    return Type.store.get(typeof value === "function" && value.prototype?.[REFLECTED_TYPE_ID] || value.constructor.prototype[REFLECTED_TYPE_ID]) || Type.Unknown;
}
function getType(...args) {
    if (args.length) {
        return getTypeOfRuntimeValue(args[0]);
    }
    if (!(typeof window === "object" && window || globalThis)["tst-reflect-disable"]) {
        console.debug("[ERR] tst-reflect: You call getType() method directly. " + "You have probably wrong configuration, because tst-reflect-transformer package should replace this call by the Type instance.\n" + "If you have right configuration it may be BUG so try to create an issue.\n" + "If it is not an issue and you don't want to see this debug message, " + "create field 'tst-reflect-disable' in global object (window | global | globalThis) eg. `window['tst-reflect-disable'] = true;`");
    }
    return Type.Unknown;
}
getType.__tst_reflect__ = true;
function reflect() {
    return function(Constructor) {
        return Constructor;
    };
}
reflect.__tst_reflect__ = true;
function createNativeType(typeName, ctor) {
    const type = Reflect.construct(Type, [], TypeActivator);
    type.initialize({
        n: typeName,
        fn: typeName,
        ctor: ()=>ctor,
        k: TypeKind.Native
    });
    return type;
}
const objectNativeType = createNativeType("Object", Object);
Type.Object = objectNativeType;
const nativeTypes = {
    "Object": objectNativeType,
    "Unknown": createNativeType("unknown"),
    "Any": createNativeType("any"),
    "Void": createNativeType("void"),
    "String": createNativeType("String", String),
    "Number": createNativeType("Number", Number),
    "Boolean": createNativeType("Boolean", Boolean),
    "Date": createNativeType("Date", Date),
    "Null": createNativeType("null"),
    "Undefined": createNativeType("undefined"),
    "Never": createNativeType("never"),
    "BigInt": createNativeType("BigInt")
};
const NativeTypes = new Map();
for (let entry of Object.entries(nativeTypes)){
    NativeTypes.set(entry[0].toLowerCase(), entry[1]);
}
for(const typeName in nativeTypes){
    if (nativeTypes.hasOwnProperty(typeName)) {
        Type[typeName] = nativeTypes[typeName];
    }
}
class MetadataStoreBase {
    set(id, description) {
        return this.wrap(description, id);
    }
    wrap(description, _storeWithId) {
        if (description.k == TypeKind.Native && description.n) {
            const standardNativeType = NativeTypes.get(description.n.toLowerCase());
            if (standardNativeType) {
                return standardNativeType;
            }
        }
        const type = Reflect.construct(Type, [], TypeActivator);
        if (_storeWithId != undefined) {
            this.store[_storeWithId] = type;
        }
        type.initialize(description);
        return type;
    }
}
let __inlineMetadataStore = null;
class InlineMetadataStore extends MetadataStoreBase {
    _store = {};
    static initiate() {
        if (__inlineMetadataStore) {
            return __inlineMetadataStore;
        }
        __inlineMetadataStore = new InlineMetadataStore();
        Type._setStore(__inlineMetadataStore);
        return __inlineMetadataStore;
    }
    static get() {
        return __inlineMetadataStore || this.initiate();
    }
    get store() {
        return this._store;
    }
    get(id) {
        return this._store[id] ?? undefined;
    }
    getLazy(id) {
        return function lazyType() {
            return InlineMetadataStore.get().get(id) ?? undefined;
        };
    }
}
export { InlineMetadataStore as InlineMetadataStore };
class NodeProcessMetadataStore extends MetadataStoreBase {
    _store = {};
    static initiate() {
        if (!process) {
            throw new Error("This environment does not support the nodejs process store. Are you running this from a browser?");
        }
        if (process[REFLECT_STORE_SYMBOL]) {
            return process[REFLECT_STORE_SYMBOL];
        }
        process[REFLECT_STORE_SYMBOL] = new NodeProcessMetadataStore();
        Type._setStore(process[REFLECT_STORE_SYMBOL]);
        return process[REFLECT_STORE_SYMBOL];
    }
    static get() {
        return process[REFLECT_STORE_SYMBOL] || this.initiate();
    }
    get store() {
        return this._store;
    }
    get(id) {
        return this._store[id] ?? undefined;
    }
    getLazy(id) {
        return function lazyType() {
            return process[REFLECT_STORE_SYMBOL].get(id) ?? undefined;
        };
    }
}
export { NodeProcessMetadataStore as NodeProcessMetadataStore };
class WindowMetadataStore extends MetadataStoreBase {
    _store = {};
    static initiate() {
        if (!window) {
            throw new Error("This environment does not support window store. Are you running this in a nodejs environment?");
        }
        if (window[REFLECT_STORE_SYMBOL]) {
            return window[REFLECT_STORE_SYMBOL];
        }
        window[REFLECT_STORE_SYMBOL] = new WindowMetadataStore();
        Type._setStore(window[REFLECT_STORE_SYMBOL]);
        return window[REFLECT_STORE_SYMBOL];
    }
    static get() {
        return window[REFLECT_STORE_SYMBOL] || this.initiate();
    }
    get store() {
        return this._store;
    }
    get(id) {
        return this._store[id] ?? undefined;
    }
    getLazy(id) {
        return function lazyType() {
            return window[REFLECT_STORE_SYMBOL].get(id) ?? undefined;
        };
    }
}
export { WindowMetadataStore as WindowMetadataStore };
InlineMetadataStore.initiate();
function getMetadataStore() {
    if (typeof process !== "undefined") {
        return NodeProcessMetadataStore.get();
    }
    if (typeof window !== "undefined") {
        return WindowMetadataStore.get();
    }
    throw new Error(`Failed to initialize a store for your environment, the global "process" and "window" vars aren't available.`);
}
export { getMetadataStore as getMetadataStore };
setTypeBuilder(TypeBuilder);
export { Type as Type, LazyType as LazyType };
export { getType as getType, reflect as reflect };
