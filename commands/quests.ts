import { GuildMember } from 'discord.js';
import { ICommand } from 'wokcommands';
import {BackendlessPerson} from '../interfaces/interfaces'
import dotenv from 'dotenv'
import Backendless from 'backendless'


dotenv.config();
const channelNotificationsId = process.env.CHANNEL_NOTIFICATIONS
const backendlessMaxNumObjects = Number(process.env.BACKENDLESS_MAX_NUM_OBJECTS)
const backendlessTwitterIdColumn = process.env.BACKENDLESS_TWITTER_ID_COLUMN
const backendlessTwitterTable = process.env.BACKENDLESS_TWITTER_TABLE
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE

Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);

async function saveUser(user: BackendlessPerson, table:string){
    try {
        await Backendless.Data.of( table).save(user)
    } catch (error) {
        console.log(error)
    }


}

async function getUser(discordUserId:number){
    var queryBuilder = Backendless.DataQueryBuilder.create();
    //queryBuilder.setPageSize( 1 ).setOffset( 0 ).setSortBy( ["date_published DESC" ] );
    var whereClause = "Discord_ID = '" + discordUserId + "'";
    console.log(whereClause)
    queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );

    let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )

    console.log(result)
}


export default {
    category: 'Quests',
    description: 'Manages quests',
    slash: true,
    testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
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


    callback: ({interaction, args}) =>{
        //const target = interaction.options.getMember('user') as GuildMember


        console.log(args[0])
        //getUser(888)
        //saveUser(user, backendlessUserTable!)
        if (args[0] == null){
            return {

                custom: true,   // WOK Commands. For slash commands
                content: 'Cannot ban that user!',
                ephemeral: true  //Only the user who sent the command can see this
             }
        }

        return null;

    }
} as ICommand


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