import dotenv from 'dotenv'
import { Client, ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js'
import { BackendlessPerson, QuestEmbedJson, twitterHandleResponses, WalletQuestIntfc } from '../../../interfaces/interfaces'
import twitterQuestJson from './twitterQuest.json'
import {Modal, TextInputComponent, showModal, TextInputStyle, ModalSubmitInteraction } from 'discord-modals'
import { checkIfDiscordIDRegistered, getDiscordServerObjID, isSubscribedToQuest, isSubscribedToQuest2, updateDiscordUser } from '../../users/userBackendless'
import { writeDiscordLog } from '../../../features/discordLogger'
import { usersEmail, usersFirstName, usersLastName, usersLevel, usersTokens, usersTwitterHandle, usersXP } from '../questInit'
import { basicModalTextInputs, isTwitterHandleValid } from '../../miscTools'
import { validate } from 'email-validator'

dotenv.config()
const filename = 'twitterQuests.ts'
const twitterQuestName = process.env.TWITTER_QUEST_NAME
const twitterQuestFields = twitterQuestJson as QuestEmbedJson
const twitterQuestTokenPrize = twitterQuestFields.tokenPrize



const menu = twitterQuestFields.menu
const subscribed = new Map() //If the user is subscribed to this quest
var userToSave: BackendlessPerson

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
        throw err
     }
}
async function drawButton(interaction: Interaction): Promise<MessageButton>{
    let functionName = drawButton.name
    let msg = 'Trying to draw button'
    let userID = interaction.user.id
    const joinQuestButton = new MessageButton()
    try {
       joinQuestButton.setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
            .setEmoji(twitterQuestFields.button.emoji)   //CTRL+i :emojisense:
            .setLabel(twitterQuestFields.button.label)
            .setStyle(twitterQuestFields.button.style)
        subscribed.set(userID, await  isSubscribed(interaction))
        //subscribed = await  isSubscribed(interaction) //OJO CON ESTO!! SE MEZCLAN LOS DATOS?
        if(subscribed.get(userID)){
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
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg, err.toString())
    }
    return joinQuestButton
}

async function drawModal(interaction:Interaction):Promise<Modal> {
    let functionName = drawModal.name
    let msg = 'Trying to draw modal'
    let userID = interaction.user.id
    let basicModalTextInputList:TextInputComponent[]
    const modal = new Modal()

    try {
        basicModalTextInputList = basicModalTextInputs(userID, twitterQuestFields ) //array of text input components with Name, lastname and email
        let offset = basicModalTextInputList.length
        // We create a Text Input Component Twitter Handle
        const textInputTwitterHandle = new TextInputComponent() // We create a Text Input Component
            .setCustomId(twitterQuestFields.modal.componentsList[offset].id)
            .setLabel(twitterQuestFields.modal.componentsList[offset].label)
            .setStyle(twitterQuestFields.modal.componentsList[offset].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            .setMinLength(twitterQuestFields.modal.componentsList[offset].minLenght)
            .setMaxLength(twitterQuestFields.modal.componentsList[offset].maxLength)
            .setPlaceholder(twitterQuestFields.modal.componentsList[offset].placeholder)
            .setRequired(twitterQuestFields.modal.componentsList[offset].required) // If it's required or not
        modal.setCustomId(twitterQuestFields.modal.id)
            .setTitle(twitterQuestFields.modal.title)
            for (let index = 0; index < basicModalTextInputList.length; index++) {
                modal.addComponents(basicModalTextInputList[index] )
            }
        modal.addComponents(textInputTwitterHandle)
    } catch (err:any) {
        writeDiscordLog(filename, functionName, msg, err.toString())
    }
    return modal
}

async function joinQuestButtonClicked(interaction:Interaction, client: Client){
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
function userLevelUp(userID:string)
{
    let userXP = usersXP.get(userID)
    userXP+= twitterQuestTokenPrize
    usersXP.set(userID,userXP)

    let userLevel = 1
    usersLevel.set(userID, userLevel)

    let userTokens = usersTokens.get(userID)
    userTokens += twitterQuestTokenPrize
    usersTokens.set(userID, userTokens)
}

async function modalSubmit(modal:ModalSubmitInteraction){
    let functionName = modalSubmit.name
    let msg = "Error trying to check if Twitter handle is valid! Got: 'OTHER_ERROR' "
    await modal.deferReply({ ephemeral: true })
    let isEmailValid:boolean
    let isTwitterValid:twitterHandleResponses|null
    let firstNameMsg ='Not provided'
    let lastNameMsg ='Not provided'
    let emailMsg ='Not provided'
    let questMsg = 'OK! You are now on the Twitter quest!!. This is the information I got from you: '
    let userID = modal.user.id
    let twitterValid = false
    let twitterHandleValidText = ''
    

    try {
        const modalFirstName = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id)
        const modalLastName = modal.getTextInputValue(twitterQuestFields.modal.componentsList[1].id)
        const modalEmail = modal.getTextInputValue(twitterQuestFields.modal.componentsList[2].id)
        const modalTwitterHandle = modal.getTextInputValue(twitterQuestFields.modal.componentsList[3].id)
        const modalTwitterHandleClean = modalTwitterHandle.replace('@', '')
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
        if(modalTwitterHandle != null){
            modalTwitterHandle.trim()
            
            isTwitterValid = await isTwitterHandleValid(modalTwitterHandleClean)
            switch (isTwitterValid){
                case 'HANDLE_NOT_EXISTS':
                    console.log('HANDLE_NOT_EXISTS')
                    twitterHandleValidText = "The handle you are using doesn't exist! Please try again"
                    break
                case 'HANDLE_EXISTS':
                    twitterValid = true
                      break
                case 'HANDLE_ERROR':
                    twitterHandleValidText = "The handle you are using doesn't follow Twitter handle guideliness. Are you sure you typed it correctly?"
                    break
                case 'OTHER_ERROR':
                    twitterHandleValidText = "The handle you are using is giving an error. Are you sure you typed it correctly?"
                    break
                case null:
                        writeDiscordLog(filename, functionName, msg, 'Function returned null')
                    break
                default:
                    writeDiscordLog(filename, functionName, msg, "Default: Switch statement didn't match any of the case clauses")
                    break
            }
        }
        if (twitterValid && isEmailValid) {
            usersEmail.set(userID, modalEmail)
            usersTwitterHandle.set(userID, modalTwitterHandleClean)
            let discordServerObjID = await getDiscordServerObjID(modal.guildId!)
            if(subscribed.get(userID)){
                questMsg = "You edited the Wallet Quest. This is the information I'll be editing: "

            }else{ //Give EXP points, tokens, and levelup
            userLevelUp(userID)

            }
            modal.followUp({ content: questMsg + '\nName: '+ firstNameMsg
            + '\nLast Name: ' + lastNameMsg + '\nEmail: '+ emailMsg +'\nTwitter handle: ' +  `\`\`\`${modalTwitterHandleClean}\`\`\``, ephemeral: true })
            userToSave = {
                First_Name: modalFirstName,
                Last_Name: modalLastName,
                email: modalEmail,
                Discord_ID: modal.user.id,
                Discord_Handle: modal.user.username,
                Quests: {
                    Twitter_quests:[{
                        twitter_handle: modalTwitterHandleClean,
                        twitter_id: '',
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
            if(!twitterValid){


               modal.followUp({ content: twitterHandleValidText, ephemeral: true })

            }
        }
    } catch (err) {
        throw err
    }
}



export class TwitterQuest {

    public get menu(){
        return menu
    }
    public  get joinQuestButtonLabel():string{
        return twitterQuestFields.button.customId
    }
    public get modalCustomID():string{
        return twitterQuestFields.modal.id
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