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
exports.WalletQuest = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const walletQuest_json_1 = __importDefault(require("./walletQuest.json"));
const discord_modals_1 = require("discord-modals");
//import  discordModals   from 'discord-modals//'
const web3_js_1 = require("@solana/web3.js");
const userBackendless_1 = require("../../users/userBackendless");
dotenv_1.default.config();
const discordServerObjID = process.env.DISCORD_SERVER_OBJ_ID;
const walletQuestFields = walletQuest_json_1.default;
const menu = walletQuestFields.menu;
var interactionGLobal;
var userToSave;
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
function init(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        interactionGLobal = interaction;
        let subscribed = yield isSubscribed();
        if (subscribed) {
            joinQuestButton.setLabel(walletQuestFields.button.label_edit);
            console.log('Wallet Quests subscribed: ' + subscribed);
        }
        else {
        }
    });
}
function joinQuestButtonClicked(interaction, client) {
    interactionGLobal = interaction;
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
function isSubscribed() {
    return __awaiter(this, void 0, void 0, function* () {
        let discordServerID = interactionGLobal.guildId;
        let user = {
            Discord_ID: interactionGLobal.user.id,
            Discord_Handle: interactionGLobal.user.username
        };
        try {
            let result = (0, userBackendless_1.isSubscribedToQuest)(user, 'Wallet_quests', discordServerID);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
}
function modalSubmit(modal) {
    var _a;
    const firstResponse = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id);
    let isSolAddress = validateSolAddress(firstResponse);
    if (isSolAddress) {
        modal.reply({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: ' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true });
        console.log('User id: ' + interactionGLobal.user.id);
        console.log('User id: ' + interactionGLobal.user.username);
        console.log('Guild id: ' + interactionGLobal.guildId);
        userToSave = {
            Discord_ID: interactionGLobal.user.id,
            Discord_Handle: interactionGLobal.user.username,
            Quests: {
                Wallet_quests: [{
                        solana_address: firstResponse,
                        Discord_Server: {
                            objectId: discordServerObjID,
                            server_id: interactionGLobal.guildId,
                            server_name: (_a = interactionGLobal.guild) === null || _a === void 0 ? void 0 : _a.name
                        }
                    }]
            }
        };
        (0, userBackendless_1.udpateDiscordUser)(userToSave);
        //check if user has already joined the wallet quest
    }
    else {
        modal.reply({ content: 'This is not a valid Solana address!! Try again! ', ephemeral: true });
    }
}
class WalletQuest {
    init(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield init(interaction);
        });
    }
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
        joinQuestButtonClicked(interaction, client);
    }
    get modal() {
        return modal;
    }
    modalQuestSubmit(modal) {
        return modalSubmit(modal);
    }
    isSubscribed() {
        return isSubscribed();
    }
}
exports.WalletQuest = WalletQuest;
