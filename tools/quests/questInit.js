"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestInit = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const questInit_json_1 = __importDefault(require("./questInit.json"));
dotenv_1.default.config();
const questInitFields = questInit_json_1.default;
const menu = questInitFields.menu;
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
function joinQuestButtonClicked(interaction) {
    console.log("Clicked!");
}
function modalSubmit(modal) {
}
const joinQuestButton = new discord_js_1.MessageButton();
class QuestInit {
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
}
exports.QuestInit = QuestInit;
