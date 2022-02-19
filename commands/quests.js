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
dotenv_1.default.config();
const channelNotificationsId = process.env.CHANNEL_NOTIFICATIONS;
const backendlessMaxNumObjects = Number(process.env.BACKENDLESS_MAX_NUM_OBJECTS);
const backendlessTwitterIdColumn = process.env.BACKENDLESS_TWITTER_ID_COLUMN;
const backendlessTwitterTable = process.env.BACKENDLESS_TWITTER_TABLE;
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
function saveUser(user, table) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield backendless_1.default.Data.of(table).save(user);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function getUser(discordUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        //queryBuilder.setPageSize( 1 ).setOffset( 0 ).setSortBy( ["date_published DESC" ] );
        var whereClause = "Discord_ID = '" + discordUserId + "'";
        console.log(whereClause);
        queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
        let result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder);
        console.log(result);
    });
}
exports.default = {
    category: 'Quests',
    description: 'Manages quests',
    slash: true,
    testOnly: true,
    guildOnly: true,
    minArgs: 0,
    expectedArgs: '<help> <user_stats> <join_quest> <leave_quest>',
    options: [
        {
            type: 'SUB_COMMAND',
            name: 'help',
            description: 'Displays quests help information',
        },
        {
            type: 'SUB_COMMAND',
            name: 'user_stats',
            description: 'Displays all the user quests stats',
        },
        {
            type: 'SUB_COMMAND',
            name: 'join_quest',
            description: 'Allows you to join a quest',
            options: [
                {
                    name: 'quest_name',
                    type: 'STRING',
                    description: 'The name of the quest you want to join',
                    required: true,
                    choices: [{
                            name: 'Twitter Quest',
                            value: 'Twitter Quest'
                        },
                        {
                            name: 'Cool-Obrity Quest',
                            value: 'Cool-Obrity Quest'
                        }
                    ]
                },
            ],
        },
        {
            type: 'SUB_COMMAND',
            name: 'leave_quest',
            description: 'Allows you to leave a quest',
            options: [
                {
                    name: 'user',
                    type: 'USER',
                    description: 'The user to list warnings for',
                    required: true,
                },
            ],
        }
    ],
    callback: ({ interaction, args }) => {
        //const target = interaction.options.getMember('user') as GuildMember
        console.log(args[0]);
        //getUser(888)
        //saveUser(user, backendlessUserTable!)
        if (args[0] == null) {
            return {
                custom: true,
                content: 'Cannot ban that user!',
                ephemeral: true //Only the user who sent the command can see this
            };
        }
        return null;
    }
};
/*
    options: [
        {
            name:'quest_name',
            type: 'STRING',
            required: false,
            description:'Select the Quest you want to interact with from the options menu... ',
            choices: [{
                name: 'Quest Help',
                value: 'Quest Help'
            },
            {
                name: 'Twitter Quest',
                value: 'Twitter Quest'
            }
            ]
        }
    ],

    */
/*
        let user = {
        email: 'a@aa.com',
        First_Name: 'Carlos',
        Last_Name: 'LN',
        Discord_Handle: 'discordhandle2',
        Discord_ID: 1233,
    }

    */ 
