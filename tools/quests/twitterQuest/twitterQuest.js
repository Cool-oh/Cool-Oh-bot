"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterQuest = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const twitterQuest_json_1 = __importDefault(require("./twitterQuest.json"));
dotenv_1.default.config();
const twitterQuestFields = twitterQuest_json_1.default;
const menu = twitterQuestFields.menu;
const twitterQuestEmbed = new discord_js_1.MessageEmbed()
    .setColor(twitterQuestFields.color)
    .setTitle(twitterQuestFields.title)
    .setURL(twitterQuestFields.url)
    .setAuthor(twitterQuestFields.author)
    .setDescription(twitterQuestFields.description)
    .setThumbnail(twitterQuestFields.thumbnail)
    .addFields(twitterQuestFields.fields)
    .setImage(twitterQuestFields.image)
    .setFooter(twitterQuestFields.footer);
const joinQuestButton = new discord_js_1.MessageButton()
    .setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
    .setEmoji(twitterQuestFields.button.emoji) //CTRL+i :emojisense:
    .setLabel(twitterQuestFields.button.label)
    .setStyle(twitterQuestFields.button.style);
function joinQuestButtonClicked() {
    console.log("Twitter Quest Clicked!");
}
class TwitterQuest {
    get embed() {
        return twitterQuestEmbed;
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
exports.TwitterQuest = TwitterQuest;
