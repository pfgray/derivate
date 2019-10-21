import * as ts from 'typescript';
import * as D from './derivate';

export const expressionBuilder = (
  type: ts.Type,
  advance: (t: ts.Type, step: D.ContextStep) => D.Derivate<ts.Expression>
): D.Derivate<ts.Expression> =>
  D.of(
    ts.createPropertyAccess(
      ts.createIdentifier("t"),
      ts.createIdentifier("foo")
    )
  );
