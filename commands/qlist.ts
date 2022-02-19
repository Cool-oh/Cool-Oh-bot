import { Client, ColorResolvable, GuildMember, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, Role, TextChannel } from 'discord.js';

import { ICommand } from 'wokcommands';
import dotenv from 'dotenv'
import { TwitterQuest } from '../tools/quests/twitterQuest/twitterQuest';
import { QuestInit } from '../tools/quests/questInit';
import { QuestEmbedJson } from '../interfaces/interfaces';
import { WalletQuest } from '../tools/quests/walletQuest/walletQuest';

dotenv.config();

const dropDown = new MessageActionRow()
const buttonRow = new MessageActionRow()

const initQuest = new QuestInit()
const walletQuest =new WalletQuest()
const twitterQuest = new TwitterQuest()
const questsObjList = [initQuest, walletQuest, twitterQuest]
const optionsList: MessageSelectOptionData[] = []

for (let index = 0; index < questsObjList.length; index++) {
    optionsList.push(questsObjList[index].menu)
}


function buildMessageSelectoptions(optionToDelete: string,  options:MessageSelectOptionData[] ):MessageSelectOptionData[]{
	//optionToDelete: the string we want to remove from the menu of options
    //menuArray: the array of options from the menu of the interaction
    //options: The array of all possible options
    let menuArray = [...options]

    for (let index = 0; index < menuArray.length; index++) {
      if (menuArray[index].value == optionToDelete) {
				menuArray.splice(index, 1)
        }
    }
    return menuArray
}

export default {
    category: 'Configuration',
    description: 'Adds a role to the auto role message',
    permissions: ['ADMINISTRATOR'],
    minArgs: 0,
    expectedArgs: '<help> <user_stats> <join_quest> <leave_quest>',
    slash: true,
    testOnly: true,
    guildOnly: true,

    init: (client: Client) => { //this function is invoked whenever the command is run. We are creating an event listener to listen
                                // to whenever an interaction is created

        client.on('interactionCreate', interaction => {
            if (interaction.isSelectMenu()){
                const {customId, values} = interaction
                const component = interaction.component as MessageSelectMenu
                const selectedOptions = component.options.filter((option) => { //we run this function for each individual option for this component
                    return values.includes(option.value)  //removed is going to be an array with all option de-selected on the menu
            })

            if (customId === 'quest_select'){ //user interacted with the menu
                let componentList = [dropDown]

                for (let index = 0; index < optionsList.length; index++) {

                    if(selectedOptions[0].value == optionsList[index].value){
                        if( buttonRow.components[0] != null){
                            buttonRow.spliceComponents(0,1) //deletes the previous button
                        }
                        let fixedOptions = buildMessageSelectoptions(optionsList[index].value, optionsList)
                        dropDown.setComponents(component.spliceOptions(0,component.options.length)) //remove all options from menu
                        dropDown.setComponents(component.addOptions(fixedOptions!)) //rebuild menu
                        if( buttonRow.components[0] != null){
                            buttonRow.spliceComponents(0,1) //deletes the previous button
                        }
                        if(selectedOptions[0].value != optionsList[0].value){ //if its not the intro quest, build the button
                            buttonRow.addComponents(questsObjList[index].joinQuestButton)
                            componentList = [dropDown,buttonRow]
                        }
                        interaction.update({
                            content: 'Updated',
                            embeds: [questsObjList[index].embed],
                            components: componentList,
                       })
                    }
                }
            }
        }
        if(interaction.isButton()){

            for (let index = 0; index < optionsList.length; index++) {
                if(interaction.customId == questsObjList[index].joinQuestButton.customId){
                    console.log(questsObjList[index].joinQuestButton.label + ' clicked!')
                    questsObjList[index].joinQuestButtonClicked
                }
            }
        }
        })
    },

    callback: async ({ interaction: msgInt, interaction, args, client, channel}) => {

        let fixedOptions = buildMessageSelectoptions(optionsList[0].value, optionsList) //remove the first item from the option list in the dropdown (INDEX)

        if(dropDown.components.length > 0){
            dropDown.setComponents([])
            }

        dropDown.addComponents(
            new MessageSelectMenu()
            .setCustomId('quest_select')  //must be unique across all the different interactions
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Select the quest...')
            .addOptions(fixedOptions)
        )
        await msgInt.reply({
          content: 'Please select what you want me to do',
          embeds: [questsObjList[0].embed],
          components: [dropDown],
          ephemeral: true // Only user who invokes the command can see the result
      })
    }
} as ICommand
