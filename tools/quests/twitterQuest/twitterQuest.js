"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterQuest = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const twitterQuest_json_1 = __importDefault(require("./twitterQuest.json"));
const discord_modals_1 = require("discord-modals");
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
const modal = new discord_modals_1.Modal() // We create a Modal
    .setCustomId(twitterQuestFields.modal.id)
    .setTitle(twitterQuestFields.modal.title)
    .addComponents(new discord_modals_1.TextInputComponent() // We create a Text Input Component
    .setCustomId(twitterQuestFields.modal.componentsList[0].id)
    .setLabel(twitterQuestFields.modal.componentsList[0].label)
    .setStyle(twitterQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setMinLength(twitterQuestFields.modal.componentsList[0].minLenght)
    .setMaxLength(twitterQuestFields.modal.componentsList[0].maxLength)
    .setPlaceholder(twitterQuestFields.modal.componentsList[0].placeholder)
    .setRequired(twitterQuestFields.modal.componentsList[0].required) // If it's required or not
);
function joinQuestButtonClicked(interaction, client) {
    if (interaction.isButton()) {
        (0, discord_modals_1.showModal)(modal, {
            client: client,
            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
        });
    }
}
function modalSubmit(modal) {
    const firstResponse = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id);
    modal.reply('OK! You are now on the Twitter quest!!. This is the information I got from you: ' + `\n\`\`\`${firstResponse}\`\`\``);
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
    joinQuestButtonClicked(interaction, client) {
        joinQuestButtonClicked(interaction, client);
    }
    modalQuestSubmit(modal) {
        modalSubmit(modal);
    }
    get modal() {
        return modal;
    }
}
exports.TwitterQuest = TwitterQuest;
