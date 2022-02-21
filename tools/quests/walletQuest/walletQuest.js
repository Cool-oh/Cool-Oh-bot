"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletQuest = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const walletQuest_json_1 = __importDefault(require("./walletQuest.json"));
const discord_modals_1 = require("discord-modals");
const web3_js_1 = require("@solana/web3.js");
//onst solanaWeb3 = require('@solana/web3.js');
dotenv_1.default.config();
const walletQuestFields = walletQuest_json_1.default;
const menu = walletQuestFields.menu;
const discordModals = require('discord-modals');
const modal = new discord_modals_1.Modal() // We create a Modal
    .setCustomId(walletQuestFields.modal.id)
    .setTitle(walletQuestFields.modal.title)
    .addComponents(new discord_modals_1.TextInputComponent() // We create a Text Input Component
    .setCustomId(walletQuestFields.modal.componentsList[0].id)
    .setLabel(walletQuestFields.modal.componentsList[0].label)
    .setStyle(walletQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setMinLength(walletQuestFields.modal.componentsList[0].minLenght)
    .setMaxLength(walletQuestFields.modal.componentsList[0].maxLength)
    .setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder)
    .setRequired(walletQuestFields.modal.componentsList[0].required) // If it's required or not
);
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
function joinQuestButtonClicked(interaction, client) {
    if (interaction.isButton()) {
        (0, discord_modals_1.showModal)(modal, {
            client: client,
            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
        });
    }
}
function validateSolAddress(address) {
    try {
        let pubkey = new web3_js_1.PublicKey(address);
        let isSolana = web3_js_1.PublicKey.isOnCurve(pubkey.toBuffer());
        return isSolana;
    }
    catch (error) {
        return false;
    }
}
function modalSubmit(modal) {
    const firstResponse = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id);
    // ArSEpRmb2SFZrhGekjoENWFAYihVoWzqe84agFDQ2YMt
    let isSolAddress = validateSolAddress(firstResponse);
    console.log('IS SOL ADDRESS: ' + isSolAddress);
    if (isSolAddress) {
        modal.reply({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: ' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true });
    }
    else {
        modal.reply({ content: 'This is not a valid Solana address!! Try again! ', ephemeral: true });
    }
    console.log('The address is valid');
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
    joinQuestButtonClicked(interaction, client) {
        return joinQuestButtonClicked(interaction, client);
    }
    get modal() {
        return modal;
    }
    modalQuestSubmit(modal) {
        return modalSubmit(modal);
    }
}
exports.WalletQuest = WalletQuest;
