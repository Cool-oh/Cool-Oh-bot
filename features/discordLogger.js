"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.writeDiscordLog = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const channelLoggerId = process.env.CHANNEL_LOGGER;
dotenv_1.default.config();
let clientVar;
function writeDiscordLog(fileName, functionName, errortype, errorText) {
    let errorMsg = errortype + '\n' + errorText + '\n' + 'Filename: ' + fileName + '\n' + 'in function: ' + functionName;
    clientVar.channels.cache.get(channelLoggerId).send(errorMsg);
    console.log(errorMsg);
}
exports.writeDiscordLog = writeDiscordLog;
exports.default = (client) => __awaiter(void 0, void 0, void 0, function* () {
    clientVar = client;
});
exports.config = {
    dbName: 'DISCORD_LOGGER',
    displayName: 'Logger that sends mesasages to a discord #log channel'
};
