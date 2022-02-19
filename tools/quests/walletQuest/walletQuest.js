"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletQuest = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const walletQuest_json_1 = __importDefault(require("./walletQuest.json"));
dotenv_1.default.config();
const walletQuestFields = walletQuest_json_1.default;
const menu = walletQuestFields.menu;
const walletQuestEmbed = new discord_js_1.MessageEmbed()
    .setColor(walletQuestFields.color)
    .setTitle(walletQuestFields.title)
    .setURL(walletQuestFields.url)
    .setAuthor(walletQuestFields.author)
    .setDescription(walletQuestFields.description)
    .setThumbnail(walletQuestFields.thumbnail)
    .addFields(walletQuestFields.fields)
    .setImage(walletQuestFields.image)
    .setFooter(walletQuestFields.footer);
const joinQuestButton = new discord_js_1.MessageButton()
    .setCustomId(walletQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
    .setEmoji(walletQuestFields.button.emoji) //CTRL+i :emojisense:
    .setLabel(walletQuestFields.button.label)
    .setStyle(walletQuestFields.button.style);
function joinQuestButtonClicked() {
    console.log("Wallet quest Clicked!");
}
class WalletQuest {
    get embed() {
        return walletQuestEmbed;
    }
    get joinQuestButton() {
        return joinQuestButton;
    }
    get menu() {
        return menu;
    }
    get joinQuestButtonClicked() {
        return joinQuestButtonClicked();
    }
}
exports.WalletQuest = WalletQuest;
