import { ColorResolvable, Interaction, MessageButton, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv'
import { QuestEmbedJson } from '../../interfaces/interfaces';
import questInitJson from './questInit.json'

dotenv.config();

const questInitFields = questInitJson as QuestEmbedJson
const menu = questInitFields.menu

const questInitEmbed = new MessageEmbed()
.setColor(questInitFields.color as ColorResolvable)
.setTitle(questInitFields.title)
.setURL(questInitFields.url)
.setAuthor(questInitFields.author)
.setDescription(questInitFields.description)
.setThumbnail(questInitFields.thumbnail)
.addFields(questInitFields.fields)
.setImage(questInitFields.image)
.setFooter(questInitFields.footer)

function joinQuestButtonClicked(interaction:Interaction){
    console.log("Clicked!")
}
function modalSubmit(modal:any){

}

const joinQuestButton = new MessageButton()

export class QuestInit {
    public get embed(): MessageEmbed{
        return questInitEmbed
    }
    public get joinQuestButton(): MessageButton{
        return joinQuestButton
    }
    public get menu(){
        return menu
    }
    public joinQuestButtonClicked(interaction:Interaction ){
        joinQuestButtonClicked(interaction)
    }
    public get modal(){
        return {"modal": {"customId": ""}}
    }
    public modalQuestSubmit(modal:any){
        modalSubmit(modal)
    }
}

