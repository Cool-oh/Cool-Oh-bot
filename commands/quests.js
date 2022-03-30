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
//const discordModals = require('discord-modals')
const _1 = __importDefault(require("discord-modals//"));
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
    category: 'Quests',
    description: 'Launches the quests menu',
    permissions: ['ADMINISTRATOR'],
    slash: true,
    testOnly: true,
    guildOnly: true,
    init: (client) => __awaiter(void 0, void 0, void 0, function* () {
        // to whenever an interaction is created
        yield (0, _1.default)(client);
        client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
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
                            if (selectedOptions[0].value != optionsList[0].value) { //if its not the intro quest, build the button
                                yield questsObjList[index].init(interaction);
                                buttonRow.addComponents(questsObjList[index].joinQuestButton);
                                componentList = [dropDown, buttonRow];
                            }
                            else { //if it' the intro quest
                                yield questsObjList[0].init(interaction);
                            }
                            let embed = questsObjList[index].embed;
                            yield interaction.deferReply({
                                ephemeral: true // Only user who invokes the command can see the result
                            });
                            interaction.editReply({
                                content: 'Updated',
                                embeds: [embed],
                                components: componentList,
                            });
                        }
                    }
                }
            }
            if (interaction.isButton()) {
                for (let index = 0; index < optionsList.length; index++) {
                    if (interaction.customId == questsObjList[index].joinQuestButton.customId) {
                        questsObjList[index].joinQuestButtonClicked(interaction, client);
                    }
                }
            }
        }));
        client.on('modalSubmit', (modal) => __awaiter(void 0, void 0, void 0, function* () {
            for (let index = 0; index < optionsList.length; index++) {
                if (modal.customId === questsObjList[index].modal.customId) {
                    yield questsObjList[index].modalQuestSubmit(modal); //show quest's modal
                }
            }
        }));
    }),
    callback: ({ interaction: msgInt }) => __awaiter(void 0, void 0, void 0, function* () {
        yield msgInt.deferReply({
            ephemeral: true // Only user who invokes the command can see the result
        });
        let fixedOptions = buildMessageSelectoptions(optionsList[0].value, optionsList); //remove the first item from the option list in the dropdown (INDEX)
        yield questsObjList[0].init(msgInt); //we init the Index Quest so we can retrieve the data for the user and display it
        let embedInit = questsObjList[0].embed;
        if (dropDown.components.length > 0) {
            dropDown.setComponents([]);
        }
        dropDown.addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('quest_select') //must be unique across all the different interactions
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Select the quest...')
            .addOptions(fixedOptions));
        yield msgInt.editReply({
            content: 'Please select what you want me to do',
            embeds: [embedInit],
            components: [dropDown]
        });
    })
};
