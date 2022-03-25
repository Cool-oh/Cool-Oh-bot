import dotenv from 'dotenv'
import { Client, ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js';
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces';
import twitterQuestJson from './twitterQuest.json'
import {Modal, TextInputComponent, showModal } from 'discord-modals'
import { isSubscribedToQuest } from '../../users/userBackendless';

dotenv.config();
const twitterQuestName = process.env.TWITTER_QUEST_NAME

const twitterQuestFields = twitterQuestJson as QuestEmbedJson
const menu = twitterQuestFields.menu
var interactionGlobal:Interaction

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

const joinQuestButton = new MessageButton()
.setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
.setEmoji(twitterQuestFields.button.emoji)   //CTRL+i :emojisense:
.setLabel(twitterQuestFields.button.label)
.setStyle(twitterQuestFields.button.style)

const modal = new Modal() // We create a Modal
.setCustomId(twitterQuestFields.modal.id)
.setTitle(twitterQuestFields.modal.title)
.addComponents(
  new TextInputComponent() // We create a Text Input Component
  .setCustomId(twitterQuestFields.modal.componentsList[0].id)
  .setLabel(twitterQuestFields.modal.componentsList[0].label)
  .setStyle(twitterQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
  .setMinLength(twitterQuestFields.modal.componentsList[0].minLenght)
  .setMaxLength(twitterQuestFields.modal.componentsList[0].maxLength)
  .setPlaceholder(twitterQuestFields.modal.componentsList[0].placeholder)
  .setRequired(twitterQuestFields.modal.componentsList[0].required) // If it's required or not
);

async function init(interaction: Interaction,){
    interactionGlobal = interaction
    let subscribed = await isSubscribed()
    if(subscribed){
        joinQuestButton.setLabel(twitterQuestFields.button.label_edit)
        console.log('Twitter Quests subscribed: ' + subscribed)
    }else{

    }
}

function joinQuestButtonClicked(interaction:Interaction, client: Client){

    if (interaction.isButton()){

        showModal(modal, {
        client: client, // The showModal() method needs the client to send the modal through the API.
        interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
      })

    }}

async function isSubscribed(): Promise <boolean> {

    let result:WalletQuestIntfc|null
    let discordServerID = interactionGlobal.guildId

    let user:BackendlessPerson = {
        Discord_ID: interactionGlobal.user.id,
        Discord_Handle: interactionGlobal.user.username
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
    const firstResponse = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id)
    //modal.reply('OK! You are now on the Twitter quest!!. This is the information I got from you: ' + `\n\`\`\`${firstResponse}\`\`\``)
    await modal.deferReply({ ephemeral: true })
    modal.followUp({ content: 'Congrats! Powered by discord-modals.' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true })
 
}



export class TwitterQuest {
    public get embed(): MessageEmbed{
        return twitterQuestEmbed
    }
    public get joinQuestButton(): MessageButton{
        return joinQuestButton
    }
    public get menu(){

        return menu
    }
    public async init(interaction: Interaction,){
        return await init (interaction)
    }
    public joinQuestButtonClicked(interaction:Interaction, client: Client ){
        joinQuestButtonClicked(interaction, client)
    }
    public async  modalQuestSubmit(modal:any){
       await  modalSubmit(modal)
    }
    public get modal(){
        return modal
    }
    public  isSubscribed(): Promise <boolean>{
        return isSubscribed()
    }



}