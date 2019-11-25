import { IoTsDeriver } from './derivers/io-ts-type/io-ts-deriver';
import { makeTransformer } from "./transformer";

export const ioTsTransformer = makeTransformer(IoTsDeriver())