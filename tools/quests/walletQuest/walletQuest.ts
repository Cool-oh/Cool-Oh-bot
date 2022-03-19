import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, User } from 'discord.js';
import dotenv from 'dotenv'
import { BackendlessPerson, QuestEmbedJson } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal } from 'discord-modals'
//import  discordModals   from 'discord-modals//'

import {PublicKey} from '@solana/web3.js'
import web3 from '@solana/web3.js'

import { updateDiscordUser, isSubscribedToQuest } from '../../users/userBackendless';

dotenv.config();
const discordServerObjID = process.env.DISCORD_SERVER_OBJ_ID
const walletQuestFields = walletQuestJson as QuestEmbedJson
const menu = walletQuestFields.menu

var interactionGLobal:Interaction
var userToSave: BackendlessPerson

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

async function init(interaction: Interaction,){
    interactionGLobal = interaction
    let subscribed = await  isSubscribed()

    if(subscribed){
        joinQuestButton.setLabel(walletQuestFields.button.label_edit)
        console.log('Wallet Quests subscribed: ' + subscribed)
    }else{

    }
}

function joinQuestButtonClicked(interaction: Interaction, client: Client){
    interactionGLobal = interaction
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


async function isSubscribed(): Promise <boolean> {
    let discordServerID = interactionGLobal.guildId
    let user:BackendlessPerson = {
        Discord_ID: interactionGLobal.user.id,
        Discord_Handle: interactionGLobal.user.username
    }
    try {
        let result = isSubscribedToQuest(user, 'Wallet_quests',  discordServerID!  )
        return result
    } catch (error) {
        throw error
}

}
function modalSubmit(modal:any){

    const firstResponse = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id)
    let isSolAddress = validateSolAddress(firstResponse)

    if (isSolAddress) {
        modal.reply({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: ' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true })
        console.log('User id: ' + interactionGLobal.user.id )
        console.log('User id: ' + interactionGLobal.user.username )
        console.log('Guild id: ' + interactionGLobal.guildId)
        userToSave = {
            Discord_ID: interactionGLobal.user.id,
            Discord_Handle: interactionGLobal.user.username,
            Quests: {
                Wallet_quests:[{
                    solana_address: firstResponse,
                    Discord_Server: {
                        objectId: discordServerObjID!,
                        server_id: interactionGLobal.guildId!,
                        server_name: interactionGLobal.guild?.name!
                                            }
                }]
            }
        }

        updateDiscordUser(userToSave)
        //check if user has already joined the wallet quest

    }else{
        modal.reply({ content: 'This is not a valid Solana address!! Try again! ', ephemeral: true })
  }

}


export class WalletQuest {
    public async init(interaction: Interaction,){
        return await init (interaction)
    }
    public get embed(): MessageEmbed{
        return walletQuestEmbed
    }
    public  get joinQuestButton(): MessageButton{
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
    public  isSubscribed(): Promise <boolean>{
        return isSubscribed()
    }
}