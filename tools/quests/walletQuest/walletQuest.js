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
const email_validator_1 = require("email-validator");
//import  discordModals   from 'discord-modals//'
const web3_js_1 = require("@solana/web3.js");
const userBackendless_1 = require("../../users/userBackendless");
const discordLogger_1 = require("../../../features/discordLogger");
dotenv_1.default.config();
const walletQuestName = process.env.WALLET_QUEST_NAME;
const walletQuestFields = walletQuest_json_1.default;
const menu = walletQuestFields.menu;
const filename = 'walletQuests.ts';
var interactionGlobal;
var userToSave;
var userFirstName = walletQuestFields.modal.componentsList[0].placeholder;
var userLastName = walletQuestFields.modal.componentsList[1].placeholder;
var userEmail = walletQuestFields.modal.componentsList[2].placeholder;
var solanaAddress = walletQuestFields.modal.componentsList[3].placeholder;
// We create a Text Input Component FIRST NAME
const textInputFirstName = new discord_modals_1.TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[0].id)
    .setLabel(walletQuestFields.modal.componentsList[0].label)
    .setStyle(walletQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setPlaceholder(userFirstName)
    .setRequired(walletQuestFields.modal.componentsList[0].required); // If it's required or not
// We create a Text Input Component LAST NAME
const textInputLastName = new discord_modals_1.TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[1].id)
    .setLabel(walletQuestFields.modal.componentsList[1].label)
    .setStyle(walletQuestFields.modal.componentsList[1].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setPlaceholder(userLastName)
    .setRequired(walletQuestFields.modal.componentsList[1].required); // If it's required or not
// We create a Text Input Component EMAIL
const textInputEmail = new discord_modals_1.TextInputComponent()
    .setCustomId(walletQuestFields.modal.componentsList[2].id)
    .setLabel(walletQuestFields.modal.componentsList[2].label)
    .setStyle(walletQuestFields.modal.componentsList[2].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setPlaceholder(userEmail)
    .setRequired(walletQuestFields.modal.componentsList[2].required); // If it's required or not
// We create a Text Input Component SOLANA ADDRESS
const textInputProvideSolana = new discord_modals_1.TextInputComponent() // We create a Text Input Component
    .setCustomId(walletQuestFields.modal.componentsList[3].id)
    .setLabel(walletQuestFields.modal.componentsList[3].label)
    .setStyle(walletQuestFields.modal.componentsList[3].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
    .setMinLength(walletQuestFields.modal.componentsList[3].minLenght)
    .setMaxLength(walletQuestFields.modal.componentsList[3].maxLength)
    .setPlaceholder(solanaAddress)
    .setRequired(walletQuestFields.modal.componentsList[3].required); // If it's required or not
const modal = new discord_modals_1.Modal() // We create a Modal
    .setCustomId(walletQuestFields.modal.id)
    .setTitle(walletQuestFields.modal.title)
    .addComponents(textInputFirstName, textInputLastName, textInputEmail, textInputProvideSolana);
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
        let functionName = init.name;
        let msg = 'Trying to init the Quest';
        let userWalletQuest;
        interactionGlobal = interaction;
        let discordServerID = interactionGlobal.guildId;
        try {
            let user = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(interactionGlobal.user.id);
            if (user != null) {
                userWalletQuest = yield (0, userBackendless_1.isSubscribedToQuest)(user, walletQuestName, discordServerID);
                if (userWalletQuest != null) {
                    solanaAddress = userWalletQuest.solana_address;
                }
                if (user.First_Name != null) {
                    userFirstName = user.First_Name;
                }
                if (user.Last_Name != null) {
                    userLastName = user.Last_Name;
                }
                if (user.email != null) {
                    userEmail = user.email;
                }
            }
            let subscribed = yield isSubscribed();
            if (subscribed) {
                joinQuestButton.setLabel(walletQuestFields.button.label_edit);
                textInputProvideSolana.setLabel('Edit your solana wallet address:');
                textInputFirstName.setPlaceholder(userFirstName);
                textInputLastName.setPlaceholder(userLastName);
                textInputEmail.setPlaceholder(userEmail);
                textInputProvideSolana.setPlaceholder(solanaAddress);
            }
            else {
                joinQuestButton.setLabel(walletQuestFields.button.label);
            }
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
            console.log(err);
        }
    });
}
function refreshData(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function joinQuestButtonClicked(interaction, client) {
    return __awaiter(this, void 0, void 0, function* () {
        interactionGlobal = interaction;
        if (interaction.isButton()) {
            yield init(interaction); //we initialize again to make sure the modal has the right data from DDBB
            yield refreshData(interaction);
            (0, discord_modals_1.showModal)(modal, {
                client: client,
                interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
            });
        }
    });
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
        let result;
        let discordServerID = interactionGlobal.guildId;
        let user = {
            Discord_ID: interactionGlobal.user.id,
            Discord_Handle: interactionGlobal.user.username
        };
        try {
            result = yield (0, userBackendless_1.isSubscribedToQuest)(user, walletQuestName, discordServerID);
            if (result != null) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            throw error;
        }
    });
}
function modalSubmit(modal) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let isEmailValid;
        let firstNameMsg = 'Not provided';
        let lastNameMsg = 'Not provided';
        let emailMsg = 'Not provided';
        const modalFirstName = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id);
        const modalLastName = modal.getTextInputValue(walletQuestFields.modal.componentsList[1].id);
        const modalEmail = modal.getTextInputValue(walletQuestFields.modal.componentsList[2].id);
        const modalSolanaAddress = modal.getTextInputValue(walletQuestFields.modal.componentsList[3].id);
        if (modalFirstName != null) {
            modalFirstName.trim();
            firstNameMsg = modalFirstName;
        }
        if (modalLastName != null) {
            modalLastName.trim();
            lastNameMsg = modalLastName;
        }
        if (modalEmail != null) {
            modalEmail.trim();
            isEmailValid = (0, email_validator_1.validate)(modalEmail);
            emailMsg = modalEmail;
        }
        else {
            isEmailValid = true;
        }
        if (modalSolanaAddress != null) {
            modalSolanaAddress.trim();
        }
        let isSolAddress = validateSolAddress(modalSolanaAddress);
        if (isSolAddress && isEmailValid) {
            let discordServerObjID = yield (0, userBackendless_1.getDiscordServerObjID)(interactionGlobal.guildId);
            console.log('discordServerObjID: ' + discordServerObjID);
            yield modal.deferReply({ ephemeral: true });
            modal.followUp({ content: 'OK! You are now on the Wallet quest!!. This is the information I got from you: \nName: ' + firstNameMsg
                    + '\nLast Name: ' + lastNameMsg + '\nEmail: ' + emailMsg + '\nSolana address: ' + `\`\`\`${modalSolanaAddress}\`\`\``, ephemeral: true });
            userToSave = {
                First_Name: modalFirstName,
                Last_Name: modalLastName,
                email: modalEmail,
                Discord_ID: interactionGlobal.user.id,
                Discord_Handle: interactionGlobal.user.username,
                Quests: {
                    Wallet_quests: [{
                            solana_address: modalSolanaAddress,
                            Discord_Server: {
                                objectId: discordServerObjID,
                                server_id: interactionGlobal.guildId,
                                server_name: (_a = interactionGlobal.guild) === null || _a === void 0 ? void 0 : _a.name
                            }
                        }]
                }
            };
            (0, userBackendless_1.updateDiscordUser)(userToSave);
        }
        else {
            yield modal.deferReply({ ephemeral: true });
            let msg = "";
            console.log('Is solana: ' + isSolAddress);
            if (!isSolAddress) {
                msg = 'This is not a valid Solana address!! Try again! ';
            }
            if (!isEmailValid) {
                msg = 'This is not a valid Solana address!! Try again! ';
            }
            if (!isEmailValid && !isSolAddress) {
                msg = 'This is not a valid Solana address!! Your email is also not valid!! Try again! ';
            }
            modal.followUp({ content: msg, ephemeral: true });
        }
    });
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
        return __awaiter(this, void 0, void 0, function* () {
            return yield modalSubmit(modal);
        });
    }
    isSubscribed() {
        return isSubscribed();
    }
}
exports.WalletQuest = WalletQuest;
