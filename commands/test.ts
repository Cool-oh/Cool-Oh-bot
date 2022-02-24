import { Interaction, MessageActionRow, MessageButton, MessageEmbed, Snowflake } from 'discord.js';
import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {BackendlessPerson, DatabaseCount} from '../interfaces/interfaces'
import {getBackendlessLastTweet} from '../features/writeLastTweet'
import { checkIfEmailRegistered, udpateDiscordUser, } from '../tools/users/userBackendless';

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


async function findUserDeep(id:string) {
 
 /*
  let related = [ 'Quests'];
  var queryBuilder = Backendless.DataQueryBuilder.create();
  queryBuilder.setRelationsDepth(1)
  .setRelated(related)
*/



  //let result = await Backendless.Data.of( backendlessUserTable! ).findById( {objectId:id, queryBuilder})
  var queryBuilder = Backendless.DataQueryBuilder.create();
  queryBuilder.setRelated( [ "Quests", 
                             "Quests.wallet_quest" ] );

  var objectCollection = Backendless.Data.of( backendlessUserTable! ).find( queryBuilder );

  Backendless.Data.of( backendlessUserTable! ).find( queryBuilder )
 .then( function( objectCollection ) {
  return objectCollection
  })
 .catch( function( error ) {
  });

  //var whereClause = "email='" + email + "'";
  //var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );

  //let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )

  

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


    console.log(await findUserDeep('AEC160F2-7A04-4A4B-8A41-2A0B3830267B'))




  },
} as ICommand