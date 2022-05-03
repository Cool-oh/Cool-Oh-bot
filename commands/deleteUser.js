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
const dotenv_1 = __importDefault(require("dotenv"));
const backendless_1 = __importDefault(require("backendless"));
const userBackendless_1 = require("../tools/users/userBackendless");
const questInit_1 = require("../tools/quests/questInit");
dotenv_1.default.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE;
const iconDatabaseStats = process.env.ICON_DATABASE_STATS;
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
exports.default = {
    category: 'ManagementTools',
    description: 'Deletes the given user.',
    slash: true,
    testOnly: true,
    guildOnly: true,
    minArgs: 1,
    expectedArgs: '<user>',
    expectedArgsTypes: ['USER'],
    permissions: ['ADMINISTRATOR'],
    callback: ({ interaction, args }) => __awaiter(void 0, void 0, void 0, function* () {
        const target = interaction.options.getMember('user');
        if (!target) {
            return 'Please tag someone to delete.';
        }
        let userToDelete = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(target.user.id);
        if (userToDelete != null) {
            let userID = userToDelete.Discord_ID;
            (0, userBackendless_1.deleteDeepDiscordUser)(userToDelete, interaction.guildId);
            questInit_1.usersSolanaAddress.delete(userID);
            questInit_1.usersTwitterHandle.delete(userID);
            questInit_1.usersFirstName.delete(userID);
            questInit_1.usersLastName.delete(userID);
            questInit_1.usersEmail.delete(userID);
        }
        return 'User and all his datas has been deleted!';
        //console.log(args[0] + ' ' + target.user.username)//
    })
};
