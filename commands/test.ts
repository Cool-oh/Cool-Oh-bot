import { Interaction, MessageActionRow, MessageButton, MessageEmbed, Snowflake } from 'discord.js';
import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {BackendlessPerson, DatabaseCount} from '../interfaces/interfaces'
import {getBackendlessLastTweet} from '../features/writeLastTweet'
import { checkIfEmailRegistered, udpateDiscordUser, } from '../tools/users/userBackendless';
import { first } from 'lodash';

dotenv.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE
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

async function findUser(email:string) {
  let result = await  checkIfEmailRegistered(email)
  return result
}


async function getUserDeep(id:string, relationsDepth: number): Promise<BackendlessPerson>  {

  var queryBuilder = Backendless.DataQueryBuilder.create();
  queryBuilder.setRelationsDepth( relationsDepth );

  let result = await Backendless.Data.of( backendlessUserTable! ).findById( id, queryBuilder ) as BackendlessPerson
  return result

}
 var user3: BackendlessPerson = {
  email: 'cdelalama22@gmail.com',
  First_Name: 'Carlos Ca',
  Discord_Handle: 'Mama Carlos222',
  Discord_ID: '1234567892',
  Quests: {
    Wallet_quests: [{
      solana_address: 'TestAddress22',
      Discord_Server: {
        server_id: 9188182080127304,
        server_name: 'Cool-oh!',
        objectId: 'E1C15A66-4C98-4975-8298-1E231E8A52E0'
      }
    }],
    Twitter_quests:[{
      twitter_handle: '@cdelalama22',
      twitter_id: '95220199',
      Discord_Server: {
        server_id: 9188182080127304,
        server_name: 'Cool-oh!',
        objectId:'E1C15A66-4C98-4975-8298-1E231E8A52E0'
      }
    }]
  }

 }




 export default {
  category: 'ManagementTools',
  description: 'Tests basic commands.',
  slash: true,
  testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
  guildOnly: true,
  permissions: ['ADMINISTRATOR'],

  callback: async ({ interaction: msgInt, channel, interaction, user}) =>{


    //let check = checkIfUserRegistered(8222288)


    //let result = await udpateDiscordUser(testUser1)

    //let userFound = await  getUserDeep('AEC160F2-7A04-4A4B-8A41-2A0B3830267B', 3) as BackendlessPerson
    //console.log(userFound)
    //console.log(JSON.stringify(userFound.Quests.Twitter_quests[0].twitter_handle))

    udpateDiscordUser(user3)

      //console.log(userFound.Quests?.Twitter_quests)

  },
} as ICommand