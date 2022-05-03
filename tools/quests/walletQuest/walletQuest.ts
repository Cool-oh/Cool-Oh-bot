import { Client, ColorResolvable, Interaction,  MessageButton, MessageEmbed, User } from 'discord.js'
import dotenv from 'dotenv'
import { BackendlessPerson, QuestEmbedJson, WalletQuestIntfc } from '../../../interfaces/interfaces'
import walletQuestJson from './walletQuest.json'
import {Modal, TextInputComponent, showModal, TextInputStyle, ModalSubmitInteraction } from 'discord-modals'
import {validate} from 'email-validator'
import {PublicKey} from '@solana/web3.js'
import { updateDiscordUser, isSubscribedToQuest, getDiscordServerObjID, checkIfDiscordIDRegistered, isSubscribedToQuest2 } from '../../users/userBackendless'
import { writeDiscordLog } from '../../../features/discordLogger'
import {usersFirstName, usersLastName, usersEmail, usersSolanaAddress, usersIsSubscribed, usersXP, usersLevel, usersTokens} from '../../quests/questInit'
import { basicModalTextInputs } from '../../miscTools'

dotenv.config()
const walletQuestName = process.env.WALLET_QUEST_NAME
const walletQuestFields = walletQuestJson as QuestEmbedJson
const walletQuestTokenPrize = walletQuestFields.tokenPrize
const menu = walletQuestFields.menu
const filename = 'walletQuests.ts'

var userToSave: BackendlessPerson
const subscribed = new Map() //If the user is subscribed to this quest


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
         throw err
     }
}
async function drawButton(interaction: Interaction): Promise<MessageButton>{
    let functionName = drawButton.name
    let msg = 'Trying to draw button'
    let userID = interaction.user.id
    let joinQuestButton = new MessageButton()
    try {
        joinQuestButton.setCustomId(walletQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
            .setEmoji(walletQuestFields.button.emoji)   //CTRL+i :emojisense:
            .setLabel(walletQuestFields.button.label)
            .setStyle(walletQuestFields.button.style)
        subscribed.set(userID, await  isSubscribed(interaction))
             if(subscribed.get(userID)){
                 joinQuestButton.setLabel(walletQuestFields.button.label_edit)
             }else{
                 joinQuestButton.setLabel(walletQuestFields.button.label)
              }
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg, err.toString())
    }
    return joinQuestButton
}
async function joinQuestButtonClicked(interaction: Interaction, client: Client){
    let functionName = joinQuestButtonClicked.name
    let msg = 'Error on clicking Quest Button'

     try {
        if (interaction.isButton()){

            let  modal = await drawModal(interaction)
            showModal(modal, {
            client: client, // The showModal() method needs the client to send the modal through the API.
            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
          })

        }
    } catch (err:any) {
         writeDiscordLog(filename, functionName, msg, err.toString())
    }
}

async function drawModal(interaction:Interaction):Promise<Modal>{
    let functionName = drawModal.name
    let msg = 'Trying to draw modal'
    let userID = interaction.user.id
    let basicModalTextInputList:TextInputComponent[]
    const modal = new Modal()

    try {
        basicModalTextInputList = basicModalTextInputs(userID, walletQuestFields ) //array of text input components with Name, lastname and email
        let offset = basicModalTextInputList.length
        // We create a Text Input Component SOLANA ADDRESS
        const textInputProvideSolana =   new TextInputComponent() // We create a Text Input Component
            .setCustomId(walletQuestFields.modal.componentsList[offset].id)
            .setLabel(walletQuestFields.modal.componentsList[offset].label)
            .setStyle(walletQuestFields.modal.componentsList[offset].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            .setMinLength(walletQuestFields.modal.componentsList[offset].minLenght)
            .setMaxLength(walletQuestFields.modal.componentsList[offset].maxLength)
            .setRequired(walletQuestFields.modal.componentsList[offset].required) // If it's required or not
        if(usersSolanaAddress.get(userID)){
            textInputProvideSolana.setPlaceholder(usersSolanaAddress.get(userID))
        }else{
            textInputProvideSolana.setPlaceholder(walletQuestFields.modal.componentsList[offset].placeholder)
        }
        modal.setCustomId(walletQuestFields.modal.id)
            .setTitle(walletQuestFields.modal.title)
        for (let index = 0; index < basicModalTextInputList.length; index++) {
            modal.addComponents(basicModalTextInputList[index] )
        }
        modal.addComponents(textInputProvideSolana)
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg, err.toString())
    }
    return modal
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

function userLevelUp(userID:string)
{
    let userXP = usersXP.get(userID)
    userXP+= walletQuestTokenPrize
    usersXP.set(userID,userXP)

    let userLevel = 1
    usersLevel.set(userID, userLevel)

    let userTokens = usersTokens.get(userID)
    userTokens += walletQuestTokenPrize
    usersTokens.set(userID, userTokens)
}

async function modalSubmit(modal:ModalSubmitInteraction){
    await modal.deferReply({ ephemeral: true })
    let isEmailValid:boolean
    let firstNameMsg ='Not provided'
    let lastNameMsg ='Not provided'
    let emailMsg ='Not provided'
    let questMsg = 'OK! You are now on the Wallet quest!!. This is the information I got from you: '
    let userID = modal.user.id
    let isSolAddress

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
        isSolAddress = validateSolAddress(modalSolanaAddress)
    }

    if (isSolAddress && isEmailValid) {
        usersEmail.set(userID, modalEmail)
        usersSolanaAddress.set(userID, modalSolanaAddress)
        let discordServerObjID = await getDiscordServerObjID(modal.guildId!)

        if(subscribed){
            questMsg = "You edited the Wallet Quest. This is the information I'll be editing: "

        }else{ //Give EXP points, tokens, and levelup
            userLevelUp(userID)
        }

        console.log('usersLevel.get(userID): ' + usersLevel.get(userID))
        console.log('usersXP.get(userID): ' + usersXP.get(userID))


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
                Level: usersLevel.get(userID),
                XP: usersXP.get(userID),
                Tokens: usersTokens.get(userID),
                Discord_Server:{
                    objectId: discordServerObjID!,
                    server_id: modal.guildId!,
                    server_name: modal.guild?.name!,
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

    public get menu(){
        return menu
    }
    public  get joinQuestButtonLabel():string{
        return walletQuestFields.button.customId
    }
    public get modalCustomID():string{
        return walletQuestFields.modal.id
    }
    public embedRedraw(interaction: Interaction) {
		return embedRedraw(interaction)
    }
    public async drawButton(interaction: Interaction){
        return await drawButton(interaction)
    }
    public joinQuestButtonClicked(interaction:Interaction, client: Client ){
        joinQuestButtonClicked(interaction, client)
    }
    public async modalQuestSubmit(modal:ModalSubmitInteraction){
        return await modalSubmit(modal)
    }
}