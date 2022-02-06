import { TypeKind } from "./enums";
import {
    Type,
    TypeActivator
} from "./Type";

/**
 * Returns Type of generic parameter
 */
export function getType<T>(): Type
{
    if (!(((typeof window === "object" && window) || (typeof global === "object" && global) || globalThis) as any)["tst-reflect-disable"])
    {
        console.debug("[ERR] tst-reflect: You call getType() method directly. " +
            "You have probably wrong configuration, because tst-reflect-transformer package should replace this call by the Type instance.\n" +
            "If you have right configuration it may be BUG so try to create an issue.\n" +
            "If it is not an issue and you don't want to see this debug message, " +
            "create field 'tst-reflect-disable' in global object (window | global | globalThis) eg. `window['tst-reflect-disable'] = true;`");
    }

    // In case of direct call, we'll return Unknown type.
    return Type.Unknown;
}

/** @internal */
getType.__tst_reflect__ = true;

/**
 * Class decorator which marks classes to be processed and included in metadata lib file.
 * @reflectDecorator
 */
export function reflect<TType>()
{
    getType<TType>();
    return function <T>(Constructor: { new(...args: any[]): T }) {
    };
}


function createNativeType(typeName: string, ctor?: Function): Type
{
    const type = Reflect.construct(Type, [], TypeActivator);

    type.initialize({
        n: typeName,
        fn: typeName,
        ctor: () => ctor,
        k: TypeKind.Native
    });

    return type;
}

/**
 * List of native types
 * @description It should save some memory and all native Types will be the same instances.
 */
const nativeTypes: { [typeName: string]: Type } = {
    "Object": createNativeType("Object", Object),
    "Unknown": createNativeType("unknown"),
    "Any": createNativeType("any"),
    "Void": createNativeType("void"),
    "String": createNativeType("String", String),
    "Number": createNativeType("Number", Number),
    "Boolean": createNativeType("Boolean", Boolean),
    "Date": createNativeType("Date", Date),
};

/**
 * @internal
 */
export const NativeTypes = new Map<string, Type>();

for (let entry of Object.entries(nativeTypes))
{
    NativeTypes.set(entry[0].toLowerCase(), entry[1]);
}

for (const typeName in nativeTypes)
{
    if (nativeTypes.hasOwnProperty(typeName))
    {
        (Type as any)[typeName] = nativeTypes[typeName];
    }
}