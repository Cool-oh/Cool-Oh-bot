import dotenv from 'dotenv'
import { Client, ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js';
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces';
import twitterQuestJson from './twitterQuest.json'
import {Modal, TextInputComponent, showModal, TextInputStyle } from 'discord-modals'
import { checkIfDiscordIDRegistered, isSubscribedToQuest, isSubscribedToQuest2 } from '../../users/userBackendless';
import { writeDiscordLog } from '../../../features/discordLogger';
import { usersEmail, usersFirstName, usersLastName, usersLevel } from '../questInit';

dotenv.config();
const filename = 'twitterQuests.ts'
const twitterQuestName = process.env.TWITTER_QUEST_NAME


const twitterQuestFields = twitterQuestJson as QuestEmbedJson
const menu = twitterQuestFields.menu
//var interactionGlobal:Interaction
var subscribed:boolean  //If the user is subscribed to this quest






const modal = new Modal() // We create a Modal
.setCustomId(twitterQuestFields.modal.id)
.setTitle(twitterQuestFields.modal.title)
.addComponents(
  new TextInputComponent() // We create a Text Input Component
  .setCustomId(twitterQuestFields.modal.componentsList[0].id)
  .setLabel(twitterQuestFields.modal.componentsList[0].label)
  .setStyle(twitterQuestFields.modal.componentsList[0].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
  .setMinLength(twitterQuestFields.modal.componentsList[0].minLenght)
  .setMaxLength(twitterQuestFields.modal.componentsList[0].maxLength)
  .setPlaceholder(twitterQuestFields.modal.componentsList[0].placeholder)
  .setRequired(twitterQuestFields.modal.componentsList[0].required) // If it's required or not
);
/*
async function init(interaction: Interaction,){
    //interactionGlobal = interaction
    let subscribed = await isSubscribed()
    if(subscribed){
        joinQuestButton.setLabel(twitterQuestFields.button.label_edit)
        console.log('Twitter Quests subscribed: ' + subscribed)
    }else{

    }
}*/

async function drawButton(interaction: Interaction): Promise<MessageButton>{

    let userID = interaction.user.id
    const joinQuestButton = new MessageButton()
    .setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
    .setEmoji(twitterQuestFields.button.emoji)   //CTRL+i :emojisense:
    .setLabel(twitterQuestFields.button.label)
    .setStyle(twitterQuestFields.button.style)

    subscribed = await  isSubscribed(interaction)

    if(subscribed){
        joinQuestButton.setLabel(twitterQuestFields.button.label_edit)
    }else{
        if(usersLevel.get(userID) < twitterQuestFields.gamification.levelRequired){
            console.log('User level: ' + usersLevel.get(userID))
            console.log('Level required: ' + twitterQuestFields.gamification.levelRequired)
            joinQuestButton.setLabel('You need to be L'+ twitterQuestFields.gamification.levelRequired)
            .setDisabled(true)
            .setStyle('DANGER')
        }else{
            joinQuestButton.setLabel(twitterQuestFields.button.label)
        }

    }
    return joinQuestButton
}

async function embedRedraw(interaction: Interaction):Promise <MessageEmbed> {
    let functionName = embedRedraw.name
    let msg = 'Trying to init the Quest'
    let userTwitterQuest:WalletQuestIntfc|null
    let discordServerID = interaction.guildId!
    let userID = interaction.user.id

    const twitterQuestEmbed = new MessageEmbed()
    .setColor(twitterQuestFields.color as ColorResolvable)
    .setTitle(twitterQuestFields.title)
    .setURL(twitterQuestFields.url)
    .setAuthor(twitterQuestFields.author)
    .setDescription(twitterQuestFields.description)
    .setThumbnail(twitterQuestFields.thumbnail)
    .addFields(twitterQuestFields.fields)
    .setImage(twitterQuestFields.image)
    .setFooter(twitterQuestFields.footer)


    try {
        let user = await  checkIfDiscordIDRegistered(interaction.user.id) as BackendlessPerson
        if(user != null){
            userTwitterQuest = isSubscribedToQuest2(user, twitterQuestName!, discordServerID)
            if (userTwitterQuest != null){
                twitterQuestEmbed.setDescription('You are alreday subscribed to this quest. Click the button below to edit it.')
            }
            if(user.First_Name != null){usersFirstName.set(userID,user.First_Name) }
            if(user.Last_Name != null){usersLastName.set(userID,user.Last_Name )  }
            if(user.email != null){usersEmail.set(userID, user.email) }
            if(user.Gamifications != null){
                 //TODO ?
             }
         }

          return twitterQuestEmbed
     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
         throw err
     }

}

function joinQuestButtonClicked(interaction:Interaction, client: Client){

    if (interaction.isButton()){

        showModal(modal, {
        client: client, // The showModal() method needs the client to send the modal through the API.
        interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
      })

    }}

async function isSubscribed(interaction:Interaction): Promise <boolean> {

    let result:WalletQuestIntfc|null
    let discordServerID = interaction.guildId

    let user:BackendlessPerson = {
        Discord_ID: interaction.user.id,
        Discord_Handle: interaction.user.username
    }
    try {
        result = await isSubscribedToQuest(user, twitterQuestName!,  discordServerID! )
        if (result!= null){
            return true
        }else{
            return false
        }
    } catch (error) {
    throw error
    }
}

async function modalSubmit(modal: any){
    await modal.deferReply({ ephemeral: true })
    const firstResponse = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id)
    //modal.reply('OK! You are now on the Twitter quest!!. This is the information I got from you: ' + `\n\`\`\`${firstResponse}\`\`\``)
    modal.followUp({ content: 'Congrats! Powered by discord-modals.' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true })

}



export class TwitterQuest {
    /*
    public async init(interaction: Interaction,){
        return await init (interaction)
    }
    public get embed(): MessageEmbed{
        return twitterQuestEmbed
    }

*/
    public  get joinQuestButtonLabel():string{
        return twitterQuestFields.button.customId
    }
    public get menu(){

        return menu
    }

    public joinQuestButtonClicked(interaction:Interaction, client: Client ){
        joinQuestButtonClicked(interaction, client)
    }

    public get modalCustomID():string{
        return twitterQuestFields.modal.id
    }
    public async  modalQuestSubmit(modal:any){
       await  modalSubmit(modal)
    }
    public get modal(){
        return modal
    }
       public embedRedraw(interaction: Interaction) {
		return embedRedraw(interaction);
    }

    public async drawButton(interaction: Interaction){
        return await drawButton(interaction)
    }


}