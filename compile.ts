import * as ts from 'typescript';
import { testTransformer } from './transform2';

const program = ts.createProgram(['./src/main/ts/simple.ts'], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile('./src/main/ts/simple.ts');
const printer = ts.createPrinter();

if(source){

  const result = ts.transform(source, [testTransformer(checker, program, source)])

  // console.log('/** Transforming: **/');
  // console.log(ts.createPrinter().printFile(source));
  // console.log('/** Into: **/');
  // console.log(ts.createPrinter().printFile(result.transformed[0]));
  // console.log('/****/');
}

