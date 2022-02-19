import dotenv from 'dotenv'
import { ColorResolvable, MessageButton, MessageEmbed } from 'discord.js';
import { QuestEmbedJson } from '../../../interfaces/interfaces';
import twitterQuestJson from './twitterQuest.json'

dotenv.config();

const twitterQuestFields = twitterQuestJson as QuestEmbedJson
const menu = twitterQuestFields.menu

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

function joinQuestButtonClicked(){
    console.log("Twitter Quest Clicked!")
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
    public get  joinQuestButtonClicked(){
        return  joinQuestButtonClicked()
    }
}