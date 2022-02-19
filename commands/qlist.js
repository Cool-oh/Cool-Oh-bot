"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const twitterQuest_1 = require("../tools/quests/twitterQuest/twitterQuest");
const questInit_1 = require("../tools/quests/questInit");
const walletQuest_1 = require("../tools/quests/walletQuest/walletQuest");
dotenv_1.default.config();
const dropDown = new discord_js_1.MessageActionRow();
const buttonRow = new discord_js_1.MessageActionRow();
const initQuest = new questInit_1.QuestInit();
const walletQuest = new walletQuest_1.WalletQuest();
const twitterQuest = new twitterQuest_1.TwitterQuest();
const questsObjList = [initQuest, walletQuest, twitterQuest];
const optionsList = [];
for (let index = 0; index < questsObjList.length; index++) {
    optionsList.push(questsObjList[index].menu);
}
function buildMessageSelectoptions(optionToDelete, options) {
    //optionToDelete: the string we want to remove from the menu of options
    //menuArray: the array of options from the menu of the interaction
    //options: The array of all possible options
    let menuArray = [...options];
    for (let index = 0; index < menuArray.length; index++) {
        if (menuArray[index].value == optionToDelete) {
            menuArray.splice(index, 1);
        }
    }
    return menuArray;
}
exports.default = {
    category: 'Configuration',
    description: 'Adds a role to the auto role message',
    permissions: ['ADMINISTRATOR'],
    minArgs: 0,
    expectedArgs: '<help> <user_stats> <join_quest> <leave_quest>',
    slash: true,
    testOnly: true,
    guildOnly: true,
    init: (client) => {
        // to whenever an interaction is created
        client.on('interactionCreate', interaction => {
            if (interaction.isSelectMenu()) {
                const { customId, values } = interaction;
                const component = interaction.component;
                const selectedOptions = component.options.filter((option) => {
                    return values.includes(option.value); //removed is going to be an array with all option de-selected on the menu
                });
                if (customId === 'quest_select') { //user interacted with the menu
                    let componentList = [dropDown];
                    for (let index = 0; index < optionsList.length; index++) {
                        if (selectedOptions[0].value == optionsList[index].value) {
                            if (buttonRow.components[0] != null) {
                                buttonRow.spliceComponents(0, 1); //deletes the previous button
                            }
                            let fixedOptions = buildMessageSelectoptions(optionsList[index].value, optionsList);
                            dropDown.setComponents(component.spliceOptions(0, component.options.length)); //remove all options from menu
                            dropDown.setComponents(component.addOptions(fixedOptions)); //rebuild menu
                            if (buttonRow.components[0] != null) {
                                buttonRow.spliceComponents(0, 1); //deletes the previous button
                            }
                            if (selectedOptions[0].value != optionsList[0].value) { //if its not the intro quest, build the button
                                buttonRow.addComponents(questsObjList[index].joinQuestButton);
                                componentList = [dropDown, buttonRow];
                            }
                            interaction.update({
                                content: 'Updated',
                                embeds: [questsObjList[index].embed],
                                components: componentList,
                            });
                        }
                    }
                }
            }
            if (interaction.isButton()) {
                for (let index = 0; index < optionsList.length; index++) {
                    if (interaction.customId == questsObjList[index].joinQuestButton.customId) {
                        console.log(questsObjList[index].joinQuestButton.label + ' clicked!');
                        questsObjList[index].joinQuestButtonClicked;
                    }
                }
            }
        });
    },
    callback: ({ interaction: msgInt, interaction, args, client, channel }) => __awaiter(void 0, void 0, void 0, function* () {
        let fixedOptions = buildMessageSelectoptions(optionsList[0].value, optionsList); //remove the first item from the option list in the dropdown (INDEX)
        if (dropDown.components.length > 0) {
            dropDown.setComponents([]);
        }
        dropDown.addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('quest_select') //must be unique across all the different interactions
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Select the quest...')
            .addOptions(fixedOptions));
        yield msgInt.reply({
            content: 'Please select what you want me to do',
            embeds: [questsObjList[0].embed],
            components: [dropDown],
            ephemeral: true // Only user who invokes the command can see the result
        });
    })
};
