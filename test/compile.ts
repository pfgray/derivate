import * as ts from 'typescript';
import { testTransformer } from '../src/transformer';
import { IoTsDeriver } from '../src/derivers/io-ts-type/io-ts-deriver';

const program = ts.createProgram(['./src/main/ts/simple.ts'], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile('./src/main/ts/simple.ts');
const printer = ts.createPrinter();

if(source) {

  const result = ts.transform(source, [
    testTransformer(checker, program, source, IoTsDeriver)
  ])

  console.log('/** Transforming: **/');
  console.log(ts.createPrinter().printFile(source));
  console.log('/** Into: **/');
  console.log(ts.createPrinter().printFile(result.transformed[0]));
  console.log('/****/');
}

// Couldn't derive instance for type: User,
// No Type<Date> found for path:
// User
//  └─image
//    └─src

