import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, User } from 'discord.js';
import dotenv from 'dotenv'
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal, TextInputStyles, TextInputStyle, ModalSubmitInteraction } from 'discord-modals'
import {validate} from 'email-validator'
//import  discordModals   from 'discord-modals//'

import {PublicKey} from '@solana/web3.js'
import web3 from '@solana/web3.js'

import { updateDiscordUser, isSubscribedToQuest, getDiscordServerObjID, checkIfDiscordIDRegistered, isSubscribedToQuest2 } from '../../users/userBackendless';
import { writeDiscordLog } from '../../../features/discordLogger';
import {usersFirstName, usersLastName, usersEmail, usersSolanaAddress, usersIsSubscribed} from '../../quests/questInit'
import { concat } from 'lodash';

dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME
const walletQuestFields = walletQuestJson as QuestEmbedJson
const walletQuestTokenPrize = walletQuestFields.tokenPrize
const menu = walletQuestFields.menu
const filename = 'walletQuests.ts'

//var interactionGlobal:Interaction
var userToSave: BackendlessPerson
//var user:BackendlessPerson
var subscribed:boolean  //If the user is subscribed to this quest
var userXp:number
var userLevel:number
var userTokens:number


/*
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


*/

async function init(interaction: Interaction){
    let functionName = init.name
    let msg = 'Trying to init the Wallet Quest'
    try {
        await refreshData(interaction)
     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
     }


 }

 async function refreshData(interaction: Interaction) {
    let functionName = refreshData.name
    let msg = 'Trying to refresh user gobal data'
    let userWalletQuest:WalletQuestIntfc|null
    let userId=interaction.user.id
    let discordServerID = interaction.guildId!
    let subscribed = false
    try {
       let user = await  checkIfDiscordIDRegistered(userId)

       if(user != null){
        userWalletQuest = await isSubscribedToQuest(user, walletQuestName!, discordServerID)
        if (userWalletQuest != null){
            subscribed = true
            usersSolanaAddress.set(userId, userWalletQuest.solana_address!)}
         if(user.First_Name != null){
            usersFirstName.set(userId, user.First_Name)}
         if(user.Last_Name != null){
            usersLastName.set(userId, user.Last_Name) }
         if(user.email != null){
            usersEmail.set(userId,user.email) }
         if(user.Gamifications != null){
         }
     }
     usersIsSubscribed.set(userId, subscribed)

     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
     }

}

async function drawModal(interaction:Interaction):Promise<Modal>{

    // We create a Text Input Component FIRST NAME
    const textInputFirstName =   new TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[0].id)
    .setLabel(walletQuestFields.modal.componentsList[0].label)
    .setStyle(walletQuestFields.modal.componentsList[0].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    //.setPlaceholder(usersFirstName.get(interaction.user.id))
    .setRequired(walletQuestFields.modal.componentsList[0].required) // If it's required or not
    if(usersFirstName.get(interaction.user.id)){
        textInputFirstName.setPlaceholder(usersFirstName.get(interaction.user.id))
    }else{
        textInputFirstName.setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder)
    }

    // We create a Text Input Component LAST NAME
    const textInputLastName =   new TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[1].id)
    .setLabel(walletQuestFields.modal.componentsList[1].label)
    .setStyle(walletQuestFields.modal.componentsList[1].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setRequired(walletQuestFields.modal.componentsList[1].required) // If it's required or not
    if(usersLastName.get(interaction.user.id)){
        textInputLastName.setPlaceholder(usersLastName.get(interaction.user.id))
    }else{
        textInputLastName.setPlaceholder(walletQuestFields.modal.componentsList[1].placeholder)
    }

    // We create a Text Input Component EMAIL
    const textInputEmail=   new TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[2].id)
    .setLabel(walletQuestFields.modal.componentsList[2].label)
    .setStyle(walletQuestFields.modal.componentsList[2].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setRequired(walletQuestFields.modal.componentsList[2].required) // If it's required or not
    if(usersEmail.get(interaction.user.id)){
        textInputEmail.setPlaceholder(usersEmail.get(interaction.user.id))
    }else{
        textInputEmail.setPlaceholder(walletQuestFields.modal.componentsList[2].placeholder)
    }

    // We create a Text Input Component SOLANA ADDRESS
    const textInputProvideSolana =   new TextInputComponent() // We create a Text Input Component
    .setCustomId(walletQuestFields.modal.componentsList[3].id)
    .setLabel(walletQuestFields.modal.componentsList[3].label)
    .setStyle(walletQuestFields.modal.componentsList[3].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setMinLength(walletQuestFields.modal.componentsList[3].minLenght)
    .setMaxLength(walletQuestFields.modal.componentsList[3].maxLength)
    .setRequired(walletQuestFields.modal.componentsList[3].required) // If it's required or not
    if(usersSolanaAddress.get(interaction.user.id)){
        textInputProvideSolana.setPlaceholder(usersSolanaAddress.get(interaction.user.id))
    }else{
        textInputProvideSolana.setPlaceholder(walletQuestFields.modal.componentsList[3].placeholder)
    }


    const modal = new Modal() // We create a Modal
    .setCustomId(walletQuestFields.modal.id)
    .setTitle(walletQuestFields.modal.title)
    .addComponents(textInputFirstName, textInputLastName, textInputEmail, textInputProvideSolana);

    return modal
}

async function drawButton(interaction: Interaction): Promise<MessageButton>{

    let joinQuestButton = new MessageButton()
    .setCustomId(walletQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
    .setEmoji(walletQuestFields.button.emoji)   //CTRL+i :emojisense:
    .setLabel(walletQuestFields.button.label)
    .setStyle(walletQuestFields.button.style)

    subscribed = await  isSubscribed(interaction)

         if(subscribed){
             joinQuestButton.setLabel(walletQuestFields.button.label_edit)
            // textInputProvideSolana.setLabel('Edit your solana wallet address:')
             //textInputFirstName.setPlaceholder(userFirstName)
            // textInputLastName.setPlaceholder(userLastName)
            // textInputEmail.setPlaceholder(userEmail)
            // textInputProvideSolana.setPlaceholder(solanaAddress)

         }else{
             joinQuestButton.setLabel(walletQuestFields.button.label)
          }
          return joinQuestButton
}




async function embedRedraw(interaction: Interaction):Promise <MessageEmbed> {
    let functionName = embedRedraw.name
    let msg = 'Trying to init the Quest'
    let userWalletQuest:WalletQuestIntfc|null
    let discordServerID = interaction.guildId!
    let userID = interaction.user.id




    let walletQuestEmbed = new MessageEmbed()
    .setColor(walletQuestFields.color as ColorResolvable)
    .setTitle(walletQuestFields.title)
    .setURL(walletQuestFields.url)
    .setAuthor(walletQuestFields.author)
    .setDescription(walletQuestFields.description)
    .setThumbnail(walletQuestFields.thumbnail)
    .addFields(walletQuestFields.fields)
    .setImage(walletQuestFields.image)
    .setFooter(walletQuestFields.footer)

    try {
        let user = await  checkIfDiscordIDRegistered(interaction.user.id) as BackendlessPerson
        if(user != null){
            userWalletQuest = isSubscribedToQuest2(user, walletQuestName!, discordServerID)
            if (userWalletQuest != null){
                walletQuestEmbed.setDescription('You are alreday subscribed to this quest. Click the button below to edit it.')
                 usersSolanaAddress.set(userID, userWalletQuest.solana_address!)
            }
            if(user.First_Name != null){usersFirstName.set(userID,user.First_Name) }
            if(user.Last_Name != null){usersLastName.set(userID,user.Last_Name )  }
            if(user.email != null){usersEmail.set(userID, user.email) }
            if(user.Gamifications != null){
                 //TODO ?
             }
         }

          return walletQuestEmbed
     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
         throw err
     }


}






async function joinQuestButtonClicked(interaction: Interaction, client: Client){

     try {
        if (interaction.isButton()){

           // await init(interaction) //we initialize again to make sure the modal has the right data from DDBB
           // await refreshData(interaction)
            let  modal = await drawModal(interaction)
            showModal(modal, {
            client: client, // The showModal() method needs the client to send the modal through the API.
            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
          })

        }
    } catch (err) {
        console.log(err)
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

async function isSubscribed(interaction:Interaction): Promise <boolean> {

    let result:WalletQuestIntfc|null
    let discordServerID = interaction.guildId

    let user:BackendlessPerson = {
        Discord_ID: interaction.user.id,
        Discord_Handle: interaction.user.username
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
    await modal.deferReply({ ephemeral: true })
    let isEmailValid:boolean
    let firstNameMsg ='Not provided'
    let lastNameMsg ='Not provided'
    let emailMsg ='Not provided'
    let questMsg = 'OK! You are now on the Wallet quest!!. This is the information I got from you: '
    let userID = modal.user.id

    const modalFirstName = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id)
    const modalLastName = modal.getTextInputValue(walletQuestFields.modal.componentsList[1].id)
    const modalEmail = modal.getTextInputValue(walletQuestFields.modal.componentsList[2].id)
    const modalSolanaAddress = modal.getTextInputValue(walletQuestFields.modal.componentsList[3].id)

    if(modalFirstName != null){
        modalFirstName.trim()
        firstNameMsg = modalFirstName
        usersFirstName.set(userID, modalFirstName)
    }
    if(modalLastName != null){
        modalLastName.trim()
        lastNameMsg = modalLastName
        usersLastName.set(userID, modalLastName )
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
        let discordServerObjID = await getDiscordServerObjID(modal.guildId!)

        if(subscribed){
            questMsg = "You edited the Wallet Quest. This is the information I'll be editing: "

        }else{ //Give EXP points


            userXp += walletQuestTokenPrize
            userLevel = 1
            userTokens += walletQuestTokenPrize
        }

        modal.followUp({ content: questMsg + '\nName: '+ firstNameMsg
        + '\nLast Name: ' + lastNameMsg + '\nEmail: '+ emailMsg +'\nSolana address: ' +  `\`\`\`${modalSolanaAddress}\`\`\``, ephemeral: true })
        userToSave = {
            First_Name: modalFirstName,
            Last_Name: modalLastName,
            email: modalEmail,
            Discord_ID: modal.user.id,
            Discord_Handle: modal.user.username,
            Quests: {
                Wallet_quests:[{
                    solana_address: modalSolanaAddress,
                    Discord_Server: {
                        objectId: discordServerObjID!,
                        server_id: modal.guildId!,
                        server_name: modal.guild?.name!
                    }
                }]
            },
            Gamifications:[{
                Discord_Server:{
                    objectId: discordServerObjID!,
                    server_id: modal.guildId!,
                    server_name: modal.guild?.name!
                }
            }]
        }
        updateDiscordUser(userToSave)
        

    }else{
        let msg = ""

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
    public async init(interaction:Interaction){
        return await init (interaction)
    }


    public  get joinQuestButtonLabel():string{
        return walletQuestFields.button.customId
    }

    public get menu(){
        return menu
    }
    public joinQuestButtonClicked(interaction:Interaction, client: Client ){
        joinQuestButtonClicked(interaction, client)
    }
    public get modalCustomID():string{
        return walletQuestFields.modal.id
    }

    public async modalQuestSubmit(modal:ModalSubmitInteraction){
        return await modalSubmit(modal)
    }


    public  isSubscribed(interaction: Interaction): Promise <boolean>{
        return isSubscribed(interaction)
    }
    public embedRedraw(interaction: Interaction) {
		return embedRedraw(interaction);

}
    public async drawButton(interaction: Interaction){
        return await drawButton(interaction)
    }

}