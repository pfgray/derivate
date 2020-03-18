import * as ts from 'typescript';
import { ioTsTransformer } from '@derivate/io-ts-deriver/lib/io-ts-transformer';

import { highlight } from 'cli-highlight'

const program = ts.createProgram(['./index.ts'], {});
const source = program.getSourceFile('./index.ts');

if(source) {
  const result = ts.transform(source, [
    ioTsTransformer(program)
  ])

  console.log('/** Transforming: **/');
  console.log(
    highlight(ts.createPrinter().printFile(source), {
      language: 'typescript'
    })
  );
  console.log('/** Into: **/');
  console.log(
    highlight(ts.createPrinter().printFile(result.transformed[0]), {
      language: 'typescript'
    })
  )
  console.log('/****/');
}

// Couldn't derive instance for type: User,
// No Type<Date> found for path:
// User
//  └─image
//    └─src

