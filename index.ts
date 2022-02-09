import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from 'wokcommands'
import path from 'path'


dotenv.config();

const client = new DiscordJS.Client({
    intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,

    ]
})

client.on('ready', () => {
      
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir:path.join(__dirname, 'features'),
        typeScript: false,
        testServers: process.env.GUILD_ID,
        botOwners: process.env.BOT_OWNER1,
        mongoUri: process.env.MONGO_URI
    })
})
client.login(process.env.TOKEN)
