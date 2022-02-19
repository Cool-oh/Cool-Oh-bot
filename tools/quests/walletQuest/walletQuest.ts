import { ColorResolvable, MessageButton, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv'
import { QuestEmbedJson } from '../../../interfaces/interfaces';
import walletQuestJson from './walletQuest.json'

dotenv.config();

const walletQuestFields = walletQuestJson as QuestEmbedJson

const menu = walletQuestFields.menu

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

function joinQuestButtonClicked(){
    console.log("Wallet quest Clicked!")
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
    public get  joinQuestButtonClicked(){
        return  joinQuestButtonClicked()
    }
}