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
const questInit_json_1 = __importDefault(require("./questInit.json"));
dotenv_1.default.config();
const questInitFields = questInit_json_1.default;
const menu = questInitFields.menu;
var interactionGLobal;
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
        interactionGLobal = interaction;
    });
}
function joinQuestButtonClicked(interaction) {
    console.log("Clicked!");
}
function modalSubmit(modal) {
}
function isSubscribed() {
    return __awaiter(this, void 0, void 0, function* () {
        return true;
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
