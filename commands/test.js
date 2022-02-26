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
dotenv_1.default.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE;
const iconDatabaseStats = process.env.ICON_DATABASE_STATS;
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
let testUser1 = {
    Discord_Handle: 'MamaCarlos55',
    Discord_ID: '1234567892',
    email: 'carlos@gmail.com'
};
let testUser2 = {
    Discord_Handle: 'MamaCarlos5',
    Discord_ID: '6239779737931800',
};
function findUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield (0, userBackendless_1.checkIfEmailRegistered)(email);
        return result;
    });
}
function getUserDeep(id, relationsDepth) {
    return __awaiter(this, void 0, void 0, function* () {
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setRelationsDepth(relationsDepth);
        let result = yield backendless_1.default.Data.of(backendlessUserTable).findById(id, queryBuilder);
        return result;
    });
}
var user3 = {
    email: 'cdelalama@gmail.com',
    First_Name: 'Carlos',
    Discord_Handle: 'Mama Carlos2',
    Discord_ID: '623958779737931786',
    Quests: {
        Wallet_quest: [{
                solana_address: '82oQgMz2yZrMZjwVig42gPd6dnTe1dbfFCgcN43ConaU',
                Discord_server: {
                    server_id: 9188182080127304,
                    server_name: 'Cool-oh!'
                }
            }],
        Twitter_quests: [{
                twitter_handle: '@cdelalama',
                twitter_id: '95220199',
                Discord_server: {
                    server_id: 9188182080127304,
                    server_name: 'Cool-oh!'
                }
            }]
    }
};
exports.default = {
    category: 'ManagementTools',
    description: 'Tests basic commands.',
    slash: true,
    testOnly: true,
    guildOnly: true,
    permissions: ['ADMINISTRATOR'],
    callback: ({ interaction: msgInt, channel, interaction, user }) => __awaiter(void 0, void 0, void 0, function* () {
        //let check = checkIfUserRegistered(8222288)
        //let result = await udpateDiscordUser(testUser1)
        //let userFound = await  getUserDeep('AEC160F2-7A04-4A4B-8A41-2A0B3830267B', 3) as BackendlessPerson
        //console.log(userFound)
        //console.log(JSON.stringify(userFound.Quests.Twitter_quests[0].twitter_handle))
        (0, userBackendless_1.udpateDiscordUser)(user3);
        //console.log(userFound.Quests?.Twitter_quests)
    }),
};