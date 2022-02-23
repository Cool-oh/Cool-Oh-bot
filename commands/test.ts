import { Interaction, MessageActionRow, MessageButton, MessageEmbed, Snowflake } from 'discord.js';
import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {BackendlessPerson, DatabaseCount} from '../interfaces/interfaces'
import {getBackendlessLastTweet} from '../features/writeLastTweet'
import { udpateDiscordUser, } from '../tools/users/userBackendless';

dotenv.config();

const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE
const iconDatabaseStats = process.env.ICON_DATABASE_STATS


Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);


let testUser1 =
{
    Discord_Handle: 'MamaCarlos55',
    Discord_ID: '1234567892',
    email: 'carlos@gmail.com'
    

} as BackendlessPerson

let testUser2 =
{
    Discord_Handle: 'MamaCarlos5',
    Discord_ID: '6239779737931800',
    
    

} as BackendlessPerson




export default {
  category: 'ManagementTools',
  description: 'Tests basic commands.',
  slash: true,
  testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
  guildOnly: true,
  permissions: ['ADMINISTRATOR'],

  callback: async ({ interaction: msgInt, channel, interaction, user}) =>{


    //let check = checkIfUserRegistered(8222288)


    let result = await udpateDiscordUser(testUser1)

  


    


  },
} as ICommand