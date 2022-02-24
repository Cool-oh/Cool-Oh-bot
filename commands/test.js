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
function findUserDeep(id) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
         let related = [ 'Quests'];
         var queryBuilder = Backendless.DataQueryBuilder.create();
         queryBuilder.setRelationsDepth(1)
         .setRelated(related)
       */
        //let result = await Backendless.Data.of( backendlessUserTable! ).findById( {objectId:id, queryBuilder})
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setRelated(["Quests",
            "Quests.wallet_quest"]);
        var objectCollection = backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder);
        backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder)
            .then(function (objectCollection) {
            return objectCollection;
        })
            .catch(function (error) {
        });
        //var whereClause = "email='" + email + "'";
        //var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );
        //let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )
    });
}
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
        console.log(yield findUserDeep('AEC160F2-7A04-4A4B-8A41-2A0B3830267B'));
    }),
};
