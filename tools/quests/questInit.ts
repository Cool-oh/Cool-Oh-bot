import { Modal } from 'discord-modals';
import { ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv'
import { writeDiscordLog } from '../../features/discordLogger';
import { BackendlessPerson, Gamification, Gamifications, QuestEmbedJson,  WalletQuestIntfc } from '../../interfaces/interfaces';
import { checkIfDiscordIDRegistered, getAllUserQuestsNames, getGamificationsData, getUserGamification, isSubscribedToQuest, isSubscribedToQuest2 } from '../users/userBackendless';
import questInitJson from './questInit.json'

dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME
const filename = 'questInit.ts'
const questInitFields = questInitJson as QuestEmbedJson
const menu = questInitFields.menu
var interactionGlobal:Interaction
var userGamificationsData:Gamifications|null
var userXP:number = 0
var userLevel: number = 0
var userTokens:number = 0
const  modal = new Modal()
modal.setCustomId('')

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


function titleCase(str:string) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
 }

async function init(interaction: Interaction){
    let modal = new Modal()
    modal.customId = ''
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
                        let tempString = userQuestsNames[index].replace(/_/g, ' ')
                        tempString = tempString.slice(0, -1)
                        tempString = titleCase(tempString)
                        userQuestsSubscribed += '.     ' + tempString + '\n'

                    }


                }
            }
            userWalletQuest = await isSubscribedToQuest2(user, walletQuestName!, discordServerID)
            if (userWalletQuest != null){
                solanaAddress = userWalletQuest.solana_address!
            }
            if (user.Gamifications != null) {
                userGamificationsData = await getGamificationsData(user, discordServerID )
                if(userGamificationsData != null){
                    userLevel = userGamificationsData.Level!
                    userXP = userGamificationsData.XP!
                    userTokens = userGamificationsData.Tokens!
                }
                questInitEmbed.setFields([])//delete fields first
                questInitEmbed.addFields([
                    questInitFields.fields[0],
                    questInitFields.fields[1],
                    { "name": "YOUR LEVEL", "value": String(userLevel) , "inline":false },
                    { "name": "YOUR COOLS", "value": String(userTokens)+ " $COOLs", "inline":false},
                    { "name": "YOUR EXP", "value": String(userXP) + " EXP", "inline":false},
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

        return modal
    }
    public modalQuestSubmit(modal:any){
        modalSubmit(modal)
    }
    public  isSubscribed(): Promise <boolean>{
        return isSubscribed()
    }
}


