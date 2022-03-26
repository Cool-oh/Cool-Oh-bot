import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, User } from 'discord.js';
import dotenv from 'dotenv'
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal } from 'discord-modals'
//import  discordModals   from 'discord-modals//'

import {PublicKey} from '@solana/web3.js'
import web3 from '@solana/web3.js'

import { updateDiscordUser, isSubscribedToQuest, getDiscordServerObjID, checkIfDiscordIDRegistered } from '../../users/userBackendless';
import { writeDiscordLog } from '../../../features/discordLogger';

dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME
const walletQuestFields = walletQuestJson as QuestEmbedJson
const menu = walletQuestFields.menu
const filename = 'walletQuests.ts'

var interactionGlobal:Interaction
var userToSave: BackendlessPerson


const textInputProvideSolana =   new TextInputComponent() // We create a Text Input Component
.setCustomId(walletQuestFields.modal.componentsList[0].id)
.setLabel(walletQuestFields.modal.componentsList[0].label)
.setStyle(walletQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
//.setMinLength(walletQuestFields.modal.componentsList[0].minLenght)
//.setMaxLength(walletQuestFields.modal.componentsList[0].maxLength)
.setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder)
.setRequired(walletQuestFields.modal.componentsList[0].required) // If it's required or not


const modal = new Modal() // We create a Modal
.setCustomId(walletQuestFields.modal.id)
.setTitle(walletQuestFields.modal.title)
.addComponents(textInputProvideSolana);




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

async function init(interaction: Interaction){
   let functionName = init.name

   let msg = 'Trying to init the Quest'
   let userWalletQuest:WalletQuestIntfc|null

   let solanaAddress = ''
   interactionGlobal = interaction
   let discordServerID = interactionGlobal.guildId!
   try {
       let user = await  checkIfDiscordIDRegistered(interactionGlobal.user.id) as BackendlessPerson

       if(user != null){
           userWalletQuest = await isSubscribedToQuest(user, walletQuestName!, discordServerID)
           if (userWalletQuest != null){
                solanaAddress = userWalletQuest.solana_address!
            }
        }
        let subscribed = await  isSubscribed()

        if(subscribed){
            joinQuestButton.setLabel(walletQuestFields.button.label_edit)
            textInputProvideSolana.setLabel('Edit your solana wallet address:')
            textInputProvideSolana.setPlaceholder(solanaAddress)

        }else{
            joinQuestButton.setLabel(walletQuestFields.button.label)
            textInputProvideSolana.setLabel(walletQuestFields.modal.componentsList[0].label)
            textInputProvideSolana.setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder)
        }
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg,  err.toString())
        console.log(err)
    }
}

async function joinQuestButtonClicked(interaction: Interaction, client: Client){
    interactionGlobal = interaction
    if (interaction.isButton()){
        await init(interaction) //we initialize again to make sure the modal has the right solana address
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

    let result:WalletQuestIntfc|null
    let discordServerID = interactionGlobal.guildId

    let user:BackendlessPerson = {
        Discord_ID: interactionGlobal.user.id,
        Discord_Handle: interactionGlobal.user.username
    }
    try {
        result = await isSubscribedToQuest(user, walletQuestName!,  discordServerID! )
        if (result!= null){
            return true
        }else{
            return false
        }
    } catch (error) {
    throw error
    }
}



async function modalSubmit(modal:any){

    const firstResponse = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id)
    let isSolAddress = validateSolAddress(firstResponse)

    if (isSolAddress) {
        let discordServerObjID = await getDiscordServerObjID(interactionGlobal.guildId!)
        console.log('discordServerObjID: ' + discordServerObjID)
        await modal.deferReply({ ephemeral: true })
        modal.followUp({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: ' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true })
        userToSave = {
            Discord_ID: interactionGlobal.user.id,
            Discord_Handle: interactionGlobal.user.username,
            Quests: {
                Wallet_quests:[{
                    solana_address: firstResponse,
                    Discord_Server: {
                        objectId: discordServerObjID!,
                        server_id: interactionGlobal.guildId!,
                        server_name: interactionGlobal.guild?.name!
                    }
                }]
            }
        }

        updateDiscordUser(userToSave)

    }else{
        await modal.deferReply({ ephemeral: true })
        modal.followUp({ content: 'This is not a valid Solana address!! Try again! ', ephemeral: true })
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

    public async modalQuestSubmit(modal:any){
        return await modalSubmit(modal)
    }
    public  isSubscribed(): Promise <boolean>{
        return isSubscribed()
    }

}