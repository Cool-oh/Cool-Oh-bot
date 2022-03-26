import { ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv'
import { writeDiscordLog } from '../../features/discordLogger';
import { BackendlessPerson, Gamification, QuestEmbedJson,  WalletQuestIntfc } from '../../interfaces/interfaces';
import { checkIfDiscordIDRegistered, getAllUserQuestsNames, getUserGamification, isSubscribedToQuest } from '../users/userBackendless';
import questInitJson from './questInit.json'

dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME
const filename = 'questInit.ts'
const questInitFields = questInitJson as QuestEmbedJson
const menu = questInitFields.menu
var interactionGlobal:Interaction

const questInitEmbed = new MessageEmbed()
.setColor(questInitFields.color as ColorResolvable)
.setTitle(questInitFields.title)
.setURL(questInitFields.url)
.setAuthor(questInitFields.author)
.setDescription(questInitFields.description)
.setThumbnail(questInitFields.thumbnail)
.addFields(questInitFields.fields)
.setImage(questInitFields.image)
.setFooter(questInitFields.footer)


async function init(interaction: Interaction){
    let functionName = init.name
    let msg = 'Trying to init the Quest'
    interactionGlobal = interaction
    let userWalletQuest:WalletQuestIntfc|null
    let discordServerID = interactionGlobal.guildId!
    let solanaAddress = "You didn't provide it yet"
    let userQuestsSubscribed = "You aren't doing any quest at the moment"
    const words = ["created", "___class", "ownerId", "updated", "objectId", "Index_quests"];


    try {
        let user = await  checkIfDiscordIDRegistered(interactionGlobal.user.id) as BackendlessPerson
        if(user != null){
            let userQuestsNames = getAllUserQuestsNames(user)
            if(userQuestsNames?.length !== 0 &&  userQuestsNames !== null){
                if(userQuestsNames.length == 1){ userQuestsSubscribed = 'You are subscribed to the following quest: \n'}
                else{ userQuestsSubscribed = 'You are subscribed to the following quests: \n'}
                for (let index = 0; index < userQuestsNames.length; index++) {

                    if(!words.some(word => userQuestsNames![index].includes(word))){ //If it doesnt include any of the words in variable words[]
                        userQuestsSubscribed += '     ' + userQuestsNames[index] + '\n'

                    }


                }
            }
            userWalletQuest = await isSubscribedToQuest(user, walletQuestName!, discordServerID)
            if (userWalletQuest != null){
                solanaAddress = userWalletQuest.solana_address!
            }
            if (user.Gamification != null) {
                questInitEmbed.setFields([])//delete fields first
                questInitEmbed.addFields([
                    questInitFields.fields[0],
                    questInitFields.fields[1],
                    { "name": "YOUR LEVEL", "value": String(user.Gamification.level) , "inline":false },
                    { "name": "YOUR COOLS", "value": "0 $COOLs", "inline":false},
                    { "name": "YOUR EXP", "value": String(user.Gamification.XP) + " EXP", "inline":false},
                    { "name": "Your Quests", "value": userQuestsSubscribed, "inline":false},
                    { "name": "YOUR SOLANA ADRESS", "value": solanaAddress, "inline":false},
                    questInitFields.fields[7],
                    questInitFields.fields[8],])
            }
        }
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg,  err.toString())
        console.log(err)
    }
}


function joinQuestButtonClicked(interaction:Interaction){
    console.log("Clicked!")
}
function modalSubmit(modal:any){

}

async function getGamificationData():Promise<Gamification | null>{
    let result
    let user:BackendlessPerson = {
        Discord_ID: interactionGlobal.user.id,
        Discord_Handle: interactionGlobal.user.username
    }
    try {
        return result = await getUserGamification(user)
    } catch (error) {
        throw error
    }
}
async function isSubscribed(): Promise <boolean> {
    let result = await getGamificationData()
    if (result != null) {
        return true
    } else {
        return false
    }

}
const joinQuestButton = new MessageButton()

export class QuestInit {
    public async init(interaction: Interaction){
        return await init (interaction)
    }
    public get embed(): MessageEmbed{
        return questInitEmbed
    }

    public get joinQuestButton(): MessageButton{
        return joinQuestButton
    }
    public get menu(){
        return menu
    }

    public joinQuestButtonClicked(interaction:Interaction ){
        joinQuestButtonClicked(interaction)
    }
    public get modal(){
        return {"modal": {"customId": ""}}
    }
    public modalQuestSubmit(modal:any){
        modalSubmit(modal)
    }
    public  isSubscribed(): Promise <boolean>{
        return isSubscribed()
    }
}


