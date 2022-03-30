import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, User } from 'discord.js';
import dotenv from 'dotenv'
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal, TextInputStyles, TextInputStyle, ModalSubmitInteraction } from 'discord-modals'
import {validate} from 'email-validator'
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
var user:BackendlessPerson
var subscribed:boolean  //If the user is subscribed to this quest
var userXp:number
var userLevel:number
var userTokens:number

var userFirstName:string = walletQuestFields.modal.componentsList[0].placeholder
var userLastName:string = walletQuestFields.modal.componentsList[1].placeholder
var userEmail:string = walletQuestFields.modal.componentsList[2].placeholder
var solanaAddress:string = walletQuestFields.modal.componentsList[3].placeholder

// We create a Text Input Component FIRST NAME
const textInputFirstName =   new TextInputComponent()
.setCustomId(walletQuestFields.modal.componentsList[0].id)
.setLabel(walletQuestFields.modal.componentsList[0].label)
.setStyle(walletQuestFields.modal.componentsList[0].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
.setPlaceholder(userFirstName)
.setRequired(walletQuestFields.modal.componentsList[0].required) // If it's required or not

// We create a Text Input Component LAST NAME
const textInputLastName =   new TextInputComponent()
.setCustomId(walletQuestFields.modal.componentsList[1].id)
.setLabel(walletQuestFields.modal.componentsList[1].label)
.setStyle(walletQuestFields.modal.componentsList[1].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
.setPlaceholder(userLastName)
.setRequired(walletQuestFields.modal.componentsList[1].required) // If it's required or not

// We create a Text Input Component EMAIL
const textInputEmail=   new TextInputComponent()
.setCustomId(walletQuestFields.modal.componentsList[2].id)
.setLabel(walletQuestFields.modal.componentsList[2].label)
.setStyle(walletQuestFields.modal.componentsList[2].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
.setPlaceholder(userEmail)
.setRequired(walletQuestFields.modal.componentsList[2].required) // If it's required or not

// We create a Text Input Component SOLANA ADDRESS
const textInputProvideSolana =   new TextInputComponent() // We create a Text Input Component
.setCustomId(walletQuestFields.modal.componentsList[3].id)
.setLabel(walletQuestFields.modal.componentsList[3].label)
.setStyle(walletQuestFields.modal.componentsList[3].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
.setMinLength(walletQuestFields.modal.componentsList[3].minLenght)
.setMaxLength(walletQuestFields.modal.componentsList[3].maxLength)
.setPlaceholder(solanaAddress)
.setRequired(walletQuestFields.modal.componentsList[3].required) // If it's required or not


const modal = new Modal() // We create a Modal
.setCustomId(walletQuestFields.modal.id)
.setTitle(walletQuestFields.modal.title)
.addComponents(textInputFirstName, textInputLastName, textInputEmail, textInputProvideSolana);




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
   interactionGlobal = interaction
   let discordServerID = interactionGlobal.guildId!
   try {
       user = await  checkIfDiscordIDRegistered(interactionGlobal.user.id) as BackendlessPerson

       if(user != null){
           userWalletQuest = await isSubscribedToQuest(user, walletQuestName!, discordServerID)
           if (userWalletQuest != null){
                solanaAddress = userWalletQuest.solana_address!
            }
            if(user.First_Name != null){userFirstName =user.First_Name }
            if(user.Last_Name != null){userLastName =user.Last_Name }
            if(user.email != null){userEmail =user.email }
            if(user.Gamifications != null){



            }
        }
        subscribed = await  isSubscribed()

        if(subscribed){
            joinQuestButton.setLabel(walletQuestFields.button.label_edit)
            textInputProvideSolana.setLabel('Edit your solana wallet address:')
            textInputFirstName.setPlaceholder(userFirstName)
            textInputLastName.setPlaceholder(userLastName)
            textInputEmail.setPlaceholder(userEmail)
            textInputProvideSolana.setPlaceholder(solanaAddress)

        }else{
            joinQuestButton.setLabel(walletQuestFields.button.label)
         }
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg,  err.toString())
        console.log(err)
    }
}
async function refreshData(interaction: Interaction) {

}

async function joinQuestButtonClicked(interaction: Interaction, client: Client){
    interactionGlobal = interaction
    if (interaction.isButton()){
        await init(interaction) //we initialize again to make sure the modal has the right data from DDBB
        await refreshData(interaction)
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



async function modalSubmit(modal:ModalSubmitInteraction){
    let isEmailValid:boolean
    let firstNameMsg ='Not provided'
    let lastNameMsg ='Not provided'
    let emailMsg ='Not provided'
    let questMsg = 'OK! You are now on the Wallet quest!!. This is the information I got from you: '

    const modalFirstName = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id)
    const modalLastName = modal.getTextInputValue(walletQuestFields.modal.componentsList[1].id)
    const modalEmail = modal.getTextInputValue(walletQuestFields.modal.componentsList[2].id)
    const modalSolanaAddress = modal.getTextInputValue(walletQuestFields.modal.componentsList[3].id)

    if(modalFirstName != null){
        modalFirstName.trim()
        firstNameMsg = modalFirstName
    }
    if(modalLastName != null){
        modalLastName.trim()
        lastNameMsg = modalLastName
    }
    if(modalEmail != null){
        modalEmail.trim()
        isEmailValid = validate(modalEmail)
        emailMsg = modalEmail
    }else{isEmailValid = true}
    if(modalSolanaAddress != null){
        modalSolanaAddress.trim()
    }
    let isSolAddress = validateSolAddress(modalSolanaAddress)

    if (isSolAddress && isEmailValid) {
        let discordServerObjID = await getDiscordServerObjID(interactionGlobal.guildId!)

        if(subscribed){
            questMsg = "You edited the Wallet Quest. This is the information I'll be editing: "

        }
        await modal.deferReply({ ephemeral: true })
        modal.followUp({ content: questMsg + '\nName: '+ firstNameMsg
        + '\nLast Name: ' + lastNameMsg + '\nEmail: '+ emailMsg +'\nSolana address: ' +  `\`\`\`${modalSolanaAddress}\`\`\``, ephemeral: true })
        userToSave = {
            First_Name: modalFirstName,
            Last_Name: modalLastName,
            email: modalEmail,
            Discord_ID: interactionGlobal.user.id,
            Discord_Handle: interactionGlobal.user.username,
            Quests: {
                Wallet_quests:[{
                    solana_address: modalSolanaAddress,
                    Discord_Server: {
                        objectId: discordServerObjID!,
                        server_id: interactionGlobal.guildId!,
                        server_name: interactionGlobal.guild?.name!
                    }
                }]
            },
            Gamifications:[{
                Discord_Server:{
                    objectId: discordServerObjID!,
                    server_id: interactionGlobal.guildId!,
                    server_name: interactionGlobal.guild?.name!
                }
            }]
        }

        updateDiscordUser(userToSave)
    }else{
        await modal.deferReply({ ephemeral: true })
        let msg = ""
        console.log('Is solana: ' + isSolAddress)

        if(!isSolAddress){
            msg = 'This is not a valid Solana address!! Try again! '
        }if (!isEmailValid){
            msg = 'This is not a valid Solana address!! Try again! '
        }if (!isEmailValid && !isSolAddress){
            msg = 'This is not a valid Solana address!! Your email is also not valid!! Try again! '
        }
        modal.followUp({ content: msg, ephemeral: true })
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