import * as ts from 'typescript';
import * as D from './derivate';
import * as O from 'fp-ts/lib/Option';

export type Deriver<T> = {

  /**
   * Returns true if a given symbol can be substituted as a typeclass instance
   * for the specified type. This enables implicit tc instance resolution.
   * @param symbol 
   * @param type 
   */
  symbolRepresentsTcForType?(
    symbol: ts.Symbol,
    type: ts.Type
  ): D.Derivate<boolean>,

  /**
   * Extracts a type from a a given node. If a value is returned,
   *   then typeclass resolution will begin on the given type, and the
   *   node will be replaced with the resolved Expression.
   *   If no value is returned, the node will be skipped.
   */
  extractor: (node: ts.Node) => D.Derivate<O.Option<[ts.Type, T]>>

  /**
   * Builds an expression that represents a tc instance for the given type.
   * Can "advance" the deriver to resolve types, if provided context. 
   * @param type 
   * @param advance 
   */
  expressionBuilder(
    type: ts.Type,
    context: T,
    advance: (t: ts.Type, step: D.ContextStep) => D.Derivate<ts.Expression>,
    currentPath: D.PathContext,
  ): D.Derivate<ts.Expression>,

};