import { Client } from "discord.js";

export default (client: Client) => {
    client.on('guildMemberAdd', async member => {
        console.log('New User hopped into the server! UserID: ' + member.id)
    })
}