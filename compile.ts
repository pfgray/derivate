import * as ts from 'typescript';
import { deriveTransformer } from './transform';

const program = ts.createProgram(['./src/main/ts/test.ts'], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile('./src/main/ts/test.ts');
const printer = ts.createPrinter();

if(source){

  const result = ts.transform(source, [deriveTransformer(checker, program)])

  console.log('/** Transforming: **/')
  console.log(ts.createPrinter().printFile(source))
  console.log('/** Into: **/')
  console.log(ts.createPrinter().printFile(result.transformed[0]))
  console.log('/****/')
}