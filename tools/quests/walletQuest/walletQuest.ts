import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, } from 'discord.js';
import dotenv from 'dotenv'
import { QuestEmbedJson } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal } from 'discord-modals'
import {PublicKey} from '@solana/web3.js'

dotenv.config();

const walletQuestFields = walletQuestJson as QuestEmbedJson
const menu = walletQuestFields.menu


const modal = new Modal() // We create a Modal
.setCustomId(walletQuestFields.modal.id)
.setTitle(walletQuestFields.modal.title)
.addComponents(
  new TextInputComponent() // We create a Text Input Component
  .setCustomId(walletQuestFields.modal.componentsList[0].id)
  .setLabel(walletQuestFields.modal.componentsList[0].label)
  .setStyle(walletQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
  .setMinLength(walletQuestFields.modal.componentsList[0].minLenght)
  .setMaxLength(walletQuestFields.modal.componentsList[0].maxLength)
  .setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder)
  .setRequired(walletQuestFields.modal.componentsList[0].required) // If it's required or not
);


const walletQuestEmbed = new MessageEmbed()
.setColor(walletQuestFields.color as ColorResolvable)
.setTitle(walletQuestFields.title)
.setURL(walletQuestFields.url)
.setAuthor(walletQuestFields.author)
.setDescription(walletQuestFields.description)
.setThumbnail(walletQuestFields.thumbnail)
.addFields(walletQuestFields.fields)
.setImage(walletQuestFields.image)
.setFooter(walletQuestFields.footer)

const joinQuestButton = new MessageButton()
.setCustomId(walletQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
.setEmoji(walletQuestFields.button.emoji)   //CTRL+i :emojisense:
.setLabel(walletQuestFields.button.label)
.setStyle(walletQuestFields.button.style)

function joinQuestButtonClicked(interaction: Interaction, client: Client){

    if (interaction.isButton()){

        showModal(modal, {
        client: client, // The showModal() method needs the client to send the modal through the API.
        interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
      })

    }
}

function validateSolAddress(address:string){
    try {
        let pubkey = new PublicKey(address)
        let  isSolana =  PublicKey.isOnCurve(pubkey.toBuffer())
        return isSolana
    } catch (error) {
        return false
    }
}
function modalSubmit(modal: any){

    const firstResponse = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id)
    let isSolAddress = validateSolAddress(firstResponse)

    if (isSolAddress) {
        modal.reply({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: ' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true })
        

    }else{
        modal.reply({ content: 'This is not a valid Solana address!! Try again! ', ephemeral: true })
  }

}


export class WalletQuest {
    public get embed(): MessageEmbed{
        return walletQuestEmbed
    }
    public get joinQuestButton(): MessageButton{
        return joinQuestButton
    }
    public get menu(){
        return menu
    }
    public joinQuestButtonClicked(interaction:Interaction, client: Client ){
        joinQuestButtonClicked(interaction, client)
    }
    public get modal(){
        return modal
    }

    public modalQuestSubmit(modal:any){
        return modalSubmit(modal)
    }
}