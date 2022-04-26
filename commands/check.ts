import { Interaction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {DatabaseCount} from '../interfaces/interfaces'
import {getBackendlessLastTweet} from '../features/writeLastTweet'

dotenv.config();

const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE
const iconDatabaseStats = process.env.ICON_DATABASE_STATS
var actionTakenContent = '';

try {
  Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);

} catch (error) {
  console.log(error)
}


async function getDatabaseTweetCount(){
  var dataQueryBuilder = Backendless.DataQueryBuilder.create().setProperties( "Count(objectId)");
  try {
    let result =  await Backendless.Data.of( backendlessTable! ).find<DatabaseCount>( dataQueryBuilder )
    return result[0].count
  } catch (error) {
    console.log(error)
    throw(error)
  }

}


export default {
  category: 'ManagementTools',
  description: 'Checks different backend things.',
  slash: true,
  testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
  guildOnly: true,
  permissions: ['ADMINISTRATOR'],

  callback: async ({ interaction: msgInt, channel, interaction}) =>{

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('Database_Stats') //our own name for our button in our code to detect which button the user clicked on
        .setEmoji('📊')   //CTRL+i :emojisense:
        .setLabel('Get Database Stats')
        .setStyle('PRIMARY')
    )
    await msgInt.reply({
      content: 'Please select what you want me to do',

      components: [row],
      ephemeral: true // Only user who invokes the command can see the result
  })

    //Filter to ensure that the user who is clicking the button is the sae who sent the command
    //(that is, if ephemeral is set to false)

    const filter = (btnInt: Interaction) => {
      return msgInt.user.id === btnInt.user.id
    }
    const collector = channel.createMessageComponentCollector({
      filter,
      max: 1, //max button clicks to listen to
      time: 1000 * 15,
    })

    collector.on('end', async (collection) => { //This fires whenever a) time expires or
                                              //b) when the user clicks on the max number of buttons defined by collector
      collection.forEach((click) => {
      //console.log(click.user.id, click.customId) //customId is the name of the button we specified up in the code
      })
      let errorMessage=''
      if (collection.first()?.customId === 'Database_Stats') {
        actionTakenContent = 'Reporting last database stats!'
        let databaseTweetCount = await getDatabaseTweetCount()


        let lastTweetSaved =  await getBackendlessLastTweet()
        const date = new Date(lastTweetSaved.created );
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' } as const;

        var embed = new MessageEmbed()
          .setTitle("Database statistics")
          .setColor("RED")
          .setAuthor(
            {
              name: 'Cool-oh bot',
              iconURL: iconDatabaseStats,
              url: 'https://cool-oh.com'
            }
          )
          .addField('No. of Tweets ', databaseTweetCount!.toString() + errorMessage )
          .addField('Last tweet saved', (await lastTweetSaved).tweet_text )
          .addField('Saved to database  on', date.toLocaleDateString("en-US", options))

         //Send the results
         interaction.followUp(
           {
            embeds: [embed],
            ephemeral: true
           }
         )
      }

    await msgInt.editReply({
      content: actionTakenContent, //This edits the message so the buttons disappear after clicking
      components: []   //Array we passed with all the buttons
      })
    } )
  },
} as ICommand