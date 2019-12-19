import { IoTsDeriver } from './io-ts-deriver';
import { makeTransformer } from "@derivate/core/lib/transformer";

export const ioTsTransformer = makeTransformer(IoTsDeriver())