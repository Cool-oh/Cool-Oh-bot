/*

 */
import { Client, TextChannel } from 'discord.js'
import dotenv from 'dotenv'

const channelLoggerId = process.env.CHANNEL_LOGGER
dotenv.config();
let clientVar:Client

export function writeDiscordLog(fileName:string, functionName:string, errortype:string, errorText:string){
    let errorMsg = errortype +'\n\n' + errorText + '\n\n' + 'Filename: ' + fileName + '\n\n' + 'In function: ' + functionName + '\n\n';
    (clientVar.channels.cache.get(channelLoggerId!) as TextChannel ).send(errorMsg)
    console.log(errorMsg )
}

export default async (client: Client) => {
    clientVar = client
}

export const config = {
    dbName: 'DISCORD_LOGGER',
    displayName: 'Logger that sends mesasages to a discord #log channel'
}