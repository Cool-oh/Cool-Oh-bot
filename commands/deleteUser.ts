import { GuildManager, GuildMember, Interaction, MessageActionRow, MessageButton, MessageEmbed, Snowflake } from 'discord.js';
import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {BackendlessPerson, DatabaseCount} from '../interfaces/interfaces'
import {getBackendlessLastTweet} from '../features/writeLastTweet'
import { checkIfDiscordIDRegistered, checkIfEmailRegistered, deleteDeepDiscordUser, getGamificationsData, getUserGamification, isSubscribedToQuest, isSubscribedToQuest2, updateDiscordUser, } from '../tools/users/userBackendless';
import { first } from 'lodash';
import {writeDiscordLog} from '../features/discordLogger';
import { json } from 'express';
import { usersEmail, usersFirstName, usersLastName, usersSolanaAddress, usersTwitterHandle } from '../tools/quests/questInit';

dotenv.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE
const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE
const iconDatabaseStats = process.env.ICON_DATABASE_STATS

Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);

export default {
    category: 'ManagementTools',
    description: 'Deletes the given user.',
    slash: true,
    testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
    guildOnly: true,
    minArgs:1,
    expectedArgs: '<user>',
    expectedArgsTypes: ['USER'],
    permissions: ['ADMINISTRATOR'],

    callback: async ({interaction, args}) =>{
        const target = interaction.options.getMember('user') as GuildMember
        if(!target){
            return 'Please tag someone to delete.'
        }
        let userToDelete = await checkIfDiscordIDRegistered(target.user.id)

        if(userToDelete != null){
            let userID = userToDelete.Discord_ID
            await  deleteDeepDiscordUser(userToDelete, interaction.guildId!)
            usersSolanaAddress.delete(userID)
            usersTwitterHandle.delete(userID)
            usersFirstName.delete(userID)
            usersLastName.delete(userID)
            usersEmail.delete(userID)
            return 'User and all his datas has been deleted!'
        }
        return 'User not found!'
        //console.log(args[0] + ' ' + target.user.username)//

    }
} as ICommand