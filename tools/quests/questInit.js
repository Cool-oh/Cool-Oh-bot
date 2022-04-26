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
exports.QuestInit = exports.usersTokens = exports.usersXP = exports.usersLevel = exports.usersIsSubscribed = exports.usersSolanaAddress = exports.usersEmail = exports.usersLastName = exports.usersFirstName = void 0;
const discord_modals_1 = require("discord-modals");
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const discordLogger_1 = require("../../features/discordLogger");
const miscTools_1 = require("../miscTools");
const userBackendless_1 = require("../users/userBackendless");
const questInit_json_1 = __importDefault(require("./questInit.json"));
exports.usersFirstName = new Map();
exports.usersLastName = new Map();
exports.usersEmail = new Map();
exports.usersSolanaAddress = new Map();
exports.usersIsSubscribed = new Map();
exports.usersLevel = new Map();
exports.usersXP = new Map();
exports.usersTokens = new Map();
dotenv_1.default.config();
const walletQuestName = process.env.WALLET_QUEST_NAME;
const filename = "questInit.ts";
const questInitFields = questInit_json_1.default;
const menu = questInitFields.menu;
var interactionGlobal;
var userGamificationsData;
var userXP = 0;
var userLevel = 0;
var userTokens = 0;
const modal = new discord_modals_1.Modal();
modal.setCustomId("");
function init(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield embedRedraw(interaction);
    });
}
function embedRedraw(interaction) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let userId = interaction.user.id;
        let questEmbed = new discord_js_1.MessageEmbed()
            .setColor(questInitFields.color)
            .setTitle(questInitFields.title)
            .setURL(questInitFields.url)
            .setAuthor(questInitFields.author)
            .setDescription(questInitFields.description)
            .setThumbnail(questInitFields.thumbnail)
            .addFields(questInitFields.fields)
            .setImage(questInitFields.image)
            .setFooter(questInitFields.footer);
        let functionName = embedRedraw.name;
        let msg = "Trying to init the Quest";
        let userWalletQuest;
        let discordServerID = interaction.guildId;
        let solanaAddressText = "You didn't provide it yet";
        let userQuestsSubscribed = "You aren't doing any quest at the moment";
        const words = [
            "created",
            "___class",
            "ownerId",
            "updated",
            "objectId",
            "Index_quests",
        ];
        let newUser = {
            Discord_ID: interaction.user.id,
            Discord_Handle: interaction.user.username,
            Gamifications: [{
                    Discord_Server: {
                        server_id: interaction.guildId,
                        server_name: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name
                    }
                }]
        };
        try {
            let user = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(userId);
            if (user != null) {
                let userQuestsNames = (0, userBackendless_1.getAllUserQuestsNames)(user);
                if ((userQuestsNames === null || userQuestsNames === void 0 ? void 0 : userQuestsNames.length) !== 0 && userQuestsNames !== null) {
                    if (userQuestsNames.length == 1) {
                        userQuestsSubscribed =
                            "You are subscribed to the following quest: \n";
                    }
                    else {
                        userQuestsSubscribed =
                            "You are subscribed to the following quests: \n";
                    }
                    for (let index = 0; index < userQuestsNames.length; index++) {
                        if (!words.some((word) => userQuestsNames[index].includes(word))) {
                            //If it doesnt include any of the words in variable words[]
                            let tempString = userQuestsNames[index].replace(/_/g, " ");
                            tempString = tempString.slice(0, -1);
                            tempString = (0, miscTools_1.titleCase)(tempString);
                            userQuestsSubscribed += ".     " + tempString + "\n";
                        }
                    }
                }
                userWalletQuest = yield (0, userBackendless_1.isSubscribedToQuest2)(user, walletQuestName, discordServerID);
                if (userWalletQuest != null) {
                    exports.usersSolanaAddress.set(userId, userWalletQuest.solana_address);
                    solanaAddressText = userWalletQuest.solana_address;
                }
                if (((_b = user.Gamifications) === null || _b === void 0 ? void 0 : _b.length) !== 0) {
                    userGamificationsData = yield (0, userBackendless_1.getGamificationsData)(user, discordServerID);
                    if (userGamificationsData != null) {
                        exports.usersLevel.set(userId, userGamificationsData.Level);
                        exports.usersXP.set(userId, userGamificationsData.XP);
                        exports.usersTokens.set(userId, userGamificationsData.Tokens);
                    }
                    questEmbed.setFields([]); //delete fields first
                    questEmbed.addFields([
                        questInitFields.fields[0],
                        questInitFields.fields[1],
                        { name: "YOUR LEVEL", value: String(exports.usersLevel.get(userId)), inline: false },
                        { name: "YOUR COOLS", value: String(exports.usersTokens.get(userId)) + " $COOLs", inline: false },
                        { name: "YOUR EXP", value: String(exports.usersXP.get(userId)) + " EXP", inline: false },
                        { name: "Your Quests", value: userQuestsSubscribed, inline: false },
                        { name: "YOUR SOLANA ADRESS", value: solanaAddressText, inline: false },
                        questInitFields.fields[7],
                        questInitFields.fields[8],
                    ]);
                }
                else { //If the user in the DDBB doesnt have a gamifications table
                    //createBackendlessUser(newUser)
                }
                return questEmbed;
            }
            else {
                (0, userBackendless_1.createBackendlessUser)(newUser);
                return questEmbed;
            }
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
            console.log(err);
            throw err;
        }
    });
}
function joinQuestButtonClicked(interaction) { }
function modalSubmit(modal) { }
function getGamificationData() {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let user = {
            Discord_ID: interactionGlobal.user.id,
            Discord_Handle: interactionGlobal.user.username,
        };
        try {
            return (result = yield (0, userBackendless_1.getUserGamification)(user));
        }
        catch (error) {
            throw error;
        }
    });
}
class QuestInit {
    init(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield init(interaction);
        });
    }
    get menu() {
        return menu;
    }
    joinQuestButtonClicked(interaction) {
        joinQuestButtonClicked(interaction);
    }
    get modal() {
        return modal;
    }
    modalQuestSubmit(modal) {
        modalSubmit(modal);
    }
    embedRedraw(interaction) {
        return embedRedraw(interaction);
    }
    drawButton(interaction) {
        let dummyButton = new discord_js_1.MessageButton();
        return dummyButton;
    }
    get joinQuestButtonLabel() {
        return '';
    }
    get modalCustomID() {
        return '';
    }
}
exports.QuestInit = QuestInit;
