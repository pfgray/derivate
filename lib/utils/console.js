"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Console;
(function (Console) {
    Console["Reset"] = "\u001B[0m";
    Console["Bright"] = "\u001B[1m";
    Console["Dim"] = "\u001B[2m";
    Console["Underscore"] = "\u001B[4m";
    Console["Blink"] = "\u001B[5m";
    Console["Reverse"] = "\u001B[7m";
    Console["Hidden"] = "\u001B[8m";
    Console["FgBlack"] = "\u001B[30m";
    Console["FgRed"] = "\u001B[31m";
    Console["FgGreen"] = "\u001B[32m";
    Console["FgYellow"] = "\u001B[33m";
    Console["FgBlue"] = "\u001B[34m";
    Console["FgMagenta"] = "\u001B[35m";
    Console["FgCyan"] = "\u001B[36m";
    Console["FgWhite"] = "\u001B[37m";
    Console["BgBlack"] = "\u001B[40m";
    Console["BgRed"] = "\u001B[41m";
    Console["BgGreen"] = "\u001B[42m";
    Console["BgYellow"] = "\u001B[43m";
    Console["BgBlue"] = "\u001B[44m";
    Console["BgMagenta"] = "\u001B[45m";
    Console["BgCyan"] = "\u001B[46m";
    Console["BgWhite"] = "\u001B[47m";
})(Console = exports.Console || (exports.Console = {}));
exports.wrap = function (c) { return function (s) { return c + s + Console.Reset; }; };
exports.cyan = exports.wrap(Console.FgCyan);
exports.dim = exports.wrap(Console.Dim);
exports.red = function (s) { return exports.bright(exports.wrap(Console.FgRed)(s)); };
exports.yellah = exports.wrap(Console.FgYellow);
exports.bright = exports.wrap(Console.Bright);