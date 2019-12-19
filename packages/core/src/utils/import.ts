import * as ts from "typescript";
import { state, State } from "fp-ts/lib/State";
import { array } from "fp-ts/lib/Array";
import { ADT } from "ts-adt";

/** Represents a namespace import, i.e.  'import * as'  */
export type Import = ADT<{
  named: { name: string; module: string };
  star: { name: string; module: string };
}>;
export type ImportsToIdentifiers<T extends readonly Import[]> = {
  [K in keyof T]: string;
};

// TODO: make this work with named imports, too! O_O
const addImport = (i: Import): State<ts.SourceFile, string> => {
  return file => {
    return [
      "__" + i.name,
      ts.updateSourceFileNode(file, [
        ts.createImportDeclaration(
          /*decorators*/ undefined,
          /*modifiers*/ undefined,
          ts.createImportClause(ts.createIdentifier("__" + i.name), undefined), // todo: make this check imports for naming clashes
          ts.createLiteral(i.module)
        ),
        ...file.statements
      ])
    ];
  };
};

export const addImports = <T extends Import[]>(
  imports: T
): State<ts.SourceFile, ImportsToIdentifiers<T>> =>
  array.traverse(state)(imports, addImport) as State<
    ts.SourceFile,
    ImportsToIdentifiers<T>
  >;
