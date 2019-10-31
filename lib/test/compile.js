"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var transformer_1 = require("../src/transformer");
var io_ts_deriver_1 = require("../src/derivers/io-ts-type/io-ts-deriver");
var program = ts.createProgram(['./src/main/ts/simple.ts'], {});
var checker = program.getTypeChecker();
var source = program.getSourceFile('./src/main/ts/simple.ts');
var printer = ts.createPrinter();
if (source) {
    var result = ts.transform(source, [
        transformer_1.testTransformer(checker, program, source, io_ts_deriver_1.IoTsDeriver)
    ]);
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
