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
exports.QuestInit = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const discordLogger_1 = require("../../features/discordLogger");
const userBackendless_1 = require("../users/userBackendless");
const questInit_json_1 = __importDefault(require("./questInit.json"));
dotenv_1.default.config();
const walletQuestName = process.env.WALLET_QUEST_NAME;
const filename = 'questInit.ts';
const questInitFields = questInit_json_1.default;
const menu = questInitFields.menu;
var interactionGlobal;
const questInitEmbed = new discord_js_1.MessageEmbed()
    .setColor(questInitFields.color)
    .setTitle(questInitFields.title)
    .setURL(questInitFields.url)
    .setAuthor(questInitFields.author)
    .setDescription(questInitFields.description)
    .setThumbnail(questInitFields.thumbnail)
    .addFields(questInitFields.fields)
    .setImage(questInitFields.image)
    .setFooter(questInitFields.footer);
function init(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = init.name;
        let msg = 'Trying to init the Quest';
        interactionGlobal = interaction;
        let userWalletQuest;
        let discordServerID = interactionGlobal.guildId;
        let solanaAddress = "You didn't provide it yet";
        let userQuestsSubscribed = "You aren't doing any quest at the moment";
        const words = ["created", "___class", "ownerId", "updated", "objectId", "Index_quests"];
        try {
            let user = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(interactionGlobal.user.id);
            if (user != null) {
                let userQuestsNames = (0, userBackendless_1.getAllUserQuestsNames)(user);
                if ((userQuestsNames === null || userQuestsNames === void 0 ? void 0 : userQuestsNames.length) !== 0 && userQuestsNames !== null) {
                    if (userQuestsNames.length == 1) {
                        userQuestsSubscribed = 'You are subscribed to the following quest: \n';
                    }
                    else {
                        userQuestsSubscribed = 'You are subscribed to the following quests: \n';
                    }
                    for (let index = 0; index < userQuestsNames.length; index++) {
                        if (!words.some(word => userQuestsNames[index].includes(word))) { //If it doesnt include any of the words in variable words[]
                            userQuestsSubscribed += '     ' + userQuestsNames[index] + '\n';
                        }
                    }
                }
                userWalletQuest = yield (0, userBackendless_1.isSubscribedToQuest)(user, walletQuestName, discordServerID);
                if (userWalletQuest != null) {
                    solanaAddress = userWalletQuest.solana_address;
                }
                if (user.Gamification != null) {
                    questInitEmbed.setFields([]); //delete fields first
                    questInitEmbed.addFields([
                        questInitFields.fields[0],
                        questInitFields.fields[1],
                        { "name": "YOUR LEVEL", "value": String(user.Gamification.level), "inline": false },
                        { "name": "YOUR COOLS", "value": "0 $COOLs", "inline": false },
                        { "name": "YOUR EXP", "value": String(user.Gamification.XP) + " EXP", "inline": false },
                        { "name": "Your Quests", "value": userQuestsSubscribed, "inline": false },
                        { "name": "YOUR SOLANA ADRESS", "value": solanaAddress, "inline": false },
                        questInitFields.fields[7],
                        questInitFields.fields[8],
                    ]);
                }
            }
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
            console.log(err);
        }
    });
}
function joinQuestButtonClicked(interaction) {
    console.log("Clicked!");
}
function modalSubmit(modal) {
}
function getGamificationData() {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let user = {
            Discord_ID: interactionGlobal.user.id,
            Discord_Handle: interactionGlobal.user.username
        };
        try {
            return result = yield (0, userBackendless_1.getUserGamification)(user);
        }
        catch (error) {
            throw error;
        }
    });
}
function isSubscribed() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield getGamificationData();
        if (result != null) {
            return true;
        }
        else {
            return false;
        }
    });
}
const joinQuestButton = new discord_js_1.MessageButton();
class QuestInit {
    init(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield init(interaction);
        });
    }
    get embed() {
        return questInitEmbed;
    }
    get joinQuestButton() {
        return joinQuestButton;
    }
    get menu() {
        return menu;
    }
    joinQuestButtonClicked(interaction) {
        joinQuestButtonClicked(interaction);
    }
    get modal() {
        return { "modal": { "customId": "" } };
    }
    modalQuestSubmit(modal) {
        modalSubmit(modal);
    }
    isSubscribed() {
        return isSubscribed();
    }
}
exports.QuestInit = QuestInit;
