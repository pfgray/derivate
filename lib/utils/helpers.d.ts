import * as ts from "typescript";
import { ADT } from "./adt";
declare type MatchTypes = {
    stringLiteral: {
        value: string;
    };
    string: undefined;
    numberLiteral: {
        value: number;
    };
    number: undefined;
    void: undefined;
    unknown: undefined;
    any: undefined;
    booleanLiteral: {
        value: boolean;
    };
    boolean: undefined;
    union: {
        types: ts.Type[];
    };
    intersection: {
        types: ts.Type[];
    };
    class: {
        type: ts.InterfaceType;
    };
    interface: {
        type: ts.InterfaceType;
    };
    function: {
        arguments: ts.Type[];
        returnType: ts.Type;
    };
    struct: {
        extract: (checker: ts.TypeChecker, source: ts.SourceFile) => {
            props: Property[];
        };
    };
    default: undefined;
};
export declare type Prop = {
    name: string;
    type: ts.Type;
};
export declare type Property = ADT<{
    method: {
        name: string;
        parameters: ts.Type[];
        returnType: ts.Type;
    };
    property: {
        name: string;
        type: ts.Type;
    };
}>;
export declare const propFold: <Z>(m: {
    method: (name: string, params: ts.Type[], ret: ts.Type) => Z;
    property: (name: string, type: ts.Type) => Z;
}) => (t: ({
    _type: "method";
} & {
    name: string;
    parameters: ts.Type[];
    returnType: ts.Type;
}) | ({
    _type: "property";
} & {
    name: string;
    type: ts.Type;
})) => Z;
declare type Matchers<Z> = {
    [K in keyof MatchTypes]: (arg: MatchTypes[K]) => Z;
};
export declare const matchType: <Z>(m: Matchers<Z>) => (t: ts.Type) => Z;
export declare const printType: (checker: ts.TypeChecker, source: ts.SourceFile) => (root: ts.Type) => string;
export {};
