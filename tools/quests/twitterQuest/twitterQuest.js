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
exports.TwitterQuest = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const twitterQuest_json_1 = __importDefault(require("./twitterQuest.json"));
const discord_modals_1 = require("discord-modals");
const userBackendless_1 = require("../../users/userBackendless");
const discordLogger_1 = require("../../../features/discordLogger");
const questInit_1 = require("../questInit");
const miscTools_1 = require("../../miscTools");
const email_validator_1 = require("email-validator");
dotenv_1.default.config();
const filename = 'twitterQuests.ts';
const twitterQuestName = process.env.TWITTER_QUEST_NAME;
const twitterQuestFields = twitterQuest_json_1.default;
const menu = twitterQuestFields.menu;
var subscribed; //If the user is subscribed to this quest
function embedRedraw(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = embedRedraw.name;
        let msg = 'Trying to init the Quest';
        let userTwitterQuest;
        let discordServerID = interaction.guildId;
        let userID = interaction.user.id;
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
        try {
            let user = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(interaction.user.id);
            if (user != null) {
                userTwitterQuest = (0, userBackendless_1.isSubscribedToQuest2)(user, twitterQuestName, discordServerID);
                if (userTwitterQuest != null) {
                    twitterQuestEmbed.setDescription('You are alreday subscribed to this quest. Click the button below to edit it.');
                }
                if (user.First_Name != null) {
                    questInit_1.usersFirstName.set(userID, user.First_Name);
                }
                if (user.Last_Name != null) {
                    questInit_1.usersLastName.set(userID, user.Last_Name);
                }
                if (user.email != null) {
                    questInit_1.usersEmail.set(userID, user.email);
                }
                if (user.Gamifications != null) {
                    //TODO ?
                }
            }
            return twitterQuestEmbed;
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
            throw err;
        }
    });
}
function drawButton(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = drawButton.name;
        let msg = 'Trying to draw button';
        let userID = interaction.user.id;
        const joinQuestButton = new discord_js_1.MessageButton();
        try {
            joinQuestButton.setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
                .setEmoji(twitterQuestFields.button.emoji) //CTRL+i :emojisense:
                .setLabel(twitterQuestFields.button.label)
                .setStyle(twitterQuestFields.button.style);
            subscribed = yield isSubscribed(interaction); //OJO CON ESTO!! SE MEZCLAN LOS DATOS?
            if (subscribed) {
                joinQuestButton.setLabel(twitterQuestFields.button.label_edit);
            }
            else {
                if (questInit_1.usersLevel.get(userID) < twitterQuestFields.gamification.levelRequired) {
                    console.log('User level: ' + questInit_1.usersLevel.get(userID));
                    console.log('Level required: ' + twitterQuestFields.gamification.levelRequired);
                    joinQuestButton.setLabel('You need to be L' + twitterQuestFields.gamification.levelRequired)
                        .setDisabled(true)
                        .setStyle('DANGER');
                }
                else {
                    joinQuestButton.setLabel(twitterQuestFields.button.label);
                }
            }
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
        }
        return joinQuestButton;
    });
}
function drawModal(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = drawModal.name;
        let msg = 'Trying to draw modal';
        let userID = interaction.user.id;
        let basicModalTextInputList;
        const modal = new discord_modals_1.Modal();
        try {
            basicModalTextInputList = (0, miscTools_1.basicModalTextInputs)(userID, twitterQuestFields); //array of text input components with Name, lastname and email
            let offset = basicModalTextInputList.length;
            // We create a Text Input Component Twitter Handle
            const textInputTwitterHandle = new discord_modals_1.TextInputComponent() // We create a Text Input Component
                .setCustomId(twitterQuestFields.modal.componentsList[offset].id)
                .setLabel(twitterQuestFields.modal.componentsList[offset].label)
                .setStyle(twitterQuestFields.modal.componentsList[offset].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(twitterQuestFields.modal.componentsList[offset].minLenght)
                .setMaxLength(twitterQuestFields.modal.componentsList[offset].maxLength)
                .setPlaceholder(twitterQuestFields.modal.componentsList[offset].placeholder)
                .setRequired(twitterQuestFields.modal.componentsList[offset].required); // If it's required or not
            modal.setCustomId(twitterQuestFields.modal.id)
                .setTitle(twitterQuestFields.modal.title);
            for (let index = 0; index < basicModalTextInputList.length; index++) {
                modal.addComponents(basicModalTextInputList[index]);
            }
            modal.addComponents(textInputTwitterHandle);
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
        }
        return modal;
    });
}
function joinQuestButtonClicked(interaction, client) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = joinQuestButtonClicked.name;
        let msg = 'Error on clicking Quest Button';
        try {
            if (interaction.isButton()) {
                let modal = yield drawModal(interaction);
                (0, discord_modals_1.showModal)(modal, {
                    client: client,
                    interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
                });
            }
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
        }
    });
}
function isSubscribed(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let discordServerID = interaction.guildId;
        let user = {
            Discord_ID: interaction.user.id,
            Discord_Handle: interaction.user.username
        };
        try {
            result = yield (0, userBackendless_1.isSubscribedToQuest)(user, twitterQuestName, discordServerID);
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
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = modalSubmit.name;
        let msg = "Error trying to check if Twitter handle is valid! Got: 'OTHER_ERROR' ";
        yield modal.deferReply({ ephemeral: true });
        let isEmailValid;
        let isTwitterValid;
        let firstNameMsg = 'Not provided';
        let lastNameMsg = 'Not provided';
        let emailMsg = 'Not provided';
        let questMsg = 'OK! You are now on the Wallet quest!!. This is the information I got from you: ';
        let userID = modal.user.id;
        let twitterValid = false;
        let twitterHandleValidText = '';
        try {
            const modalFirstName = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id);
            const modalLastName = modal.getTextInputValue(twitterQuestFields.modal.componentsList[1].id);
            const modalEmail = modal.getTextInputValue(twitterQuestFields.modal.componentsList[2].id);
            const modalTwitterHandle = modal.getTextInputValue(twitterQuestFields.modal.componentsList[3].id);
            if (modalFirstName != null) {
                modalFirstName.trim();
                firstNameMsg = modalFirstName;
                questInit_1.usersFirstName.set(userID, modalFirstName);
            }
            if (modalLastName != null) {
                modalLastName.trim();
                lastNameMsg = modalLastName;
                questInit_1.usersLastName.set(userID, modalLastName);
            }
            if (modalEmail != null) {
                modalEmail.trim();
                isEmailValid = (0, email_validator_1.validate)(modalEmail);
                emailMsg = modalEmail;
            }
            else {
                isEmailValid = true;
            }
            if (modalTwitterHandle != null) {
                modalTwitterHandle.trim();
                isTwitterValid = yield (0, miscTools_1.isTwitterHandleValid)(modalTwitterHandle);
                switch (isTwitterValid) {
                    case 'HANDLE_NOT_EXISTS':
                        console.log('HANDLE_NOT_EXISTS');
                        twitterHandleValidText = "The handle you are using doesn't exist! Please try again";
                        break;
                    case 'HANDLE_EXISTS':
                        twitterValid = true;
                        break;
                    case 'HANDLE_ERROR':
                        twitterHandleValidText = "The handle you are using doesn't follow Twitter handle guideliness. Are you sure you typed it correctly?";
                        break;
                    case 'OTHER_ERROR':
                        twitterHandleValidText = "The handle you are using is giving an error. Are you sure you typed it correctly?";
                        break;
                    case null:
                        (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, 'Function returned null');
                        break;
                    default:
                        (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, "Default: Switch statement didn't match any of the case clauses");
                        break;
                }
            }
            if (twitterValid && isEmailValid) {
                questInit_1.usersEmail.set(userID, modalEmail);
                questInit_1.usersTwitterHandle.set(userID, modalTwitterHandle);
                if (subscribed) {
                    questMsg = "You edited the Wallet Quest. This is the information I'll be editing: ";
                }
                else { //Give EXP points, tokens, and levelup
                    //userLevelUp(userID)
                }
            }
            else {
                if (!twitterValid) {
                }
            }
        }
        catch (err) {
            throw err;
        }
    });
}
class TwitterQuest {
    get menu() {
        return menu;
    }
    get joinQuestButtonLabel() {
        return twitterQuestFields.button.customId;
    }
    get modalCustomID() {
        return twitterQuestFields.modal.id;
    }
    embedRedraw(interaction) {
        return embedRedraw(interaction);
    }
    drawButton(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield drawButton(interaction);
        });
    }
    joinQuestButtonClicked(interaction, client) {
        joinQuestButtonClicked(interaction, client);
    }
    modalQuestSubmit(modal) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield modalSubmit(modal);
        });
    }
}
exports.TwitterQuest = TwitterQuest;
