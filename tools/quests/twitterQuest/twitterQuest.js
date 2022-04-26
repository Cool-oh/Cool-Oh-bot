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
dotenv_1.default.config();
const filename = 'twitterQuests.ts';
const twitterQuestName = process.env.TWITTER_QUEST_NAME;
const twitterQuestFields = twitterQuest_json_1.default;
const menu = twitterQuestFields.menu;
//var interactionGlobal:Interaction
var subscribed; //If the user is subscribed to this quest
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
/*
async function init(interaction: Interaction,){
    //interactionGlobal = interaction
    let subscribed = await isSubscribed()
    if(subscribed){
        joinQuestButton.setLabel(twitterQuestFields.button.label_edit)
        console.log('Twitter Quests subscribed: ' + subscribed)
    }else{

    }
}*/
function drawButton(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let userID = interaction.user.id;
        const joinQuestButton = new discord_js_1.MessageButton()
            .setCustomId(twitterQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
            .setEmoji(twitterQuestFields.button.emoji) //CTRL+i :emojisense:
            .setLabel(twitterQuestFields.button.label)
            .setStyle(twitterQuestFields.button.style);
        subscribed = yield isSubscribed(interaction);
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
        return joinQuestButton;
    });
}
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
            console.log(err);
            throw err;
        }
    });
}
function joinQuestButtonClicked(interaction, client) {
    if (interaction.isButton()) {
        (0, discord_modals_1.showModal)(modal, {
            client: client,
            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
        });
    }
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
        yield modal.deferReply({ ephemeral: true });
        const firstResponse = modal.getTextInputValue(twitterQuestFields.modal.componentsList[0].id);
        //modal.reply('OK! You are now on the Twitter quest!!. This is the information I got from you: ' + `\n\`\`\`${firstResponse}\`\`\``)
        modal.followUp({ content: 'Congrats! Powered by discord-modals.' + `\`\`\`${firstResponse}\`\`\``, ephemeral: true });
    });
}
class TwitterQuest {
    /*
    public async init(interaction: Interaction,){
        return await init (interaction)
    }
    public get embed(): MessageEmbed{
        return twitterQuestEmbed
    }

*/
    get joinQuestButtonLabel() {
        return twitterQuestFields.button.customId;
    }
    get menu() {
        return menu;
    }
    joinQuestButtonClicked(interaction, client) {
        joinQuestButtonClicked(interaction, client);
    }
    get modalCustomID() {
        return twitterQuestFields.modal.id;
    }
    modalQuestSubmit(modal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield modalSubmit(modal);
        });
    }
    get modal() {
        return modal;
    }
    embedRedraw(interaction) {
        return embedRedraw(interaction);
    }
    drawButton(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield drawButton(interaction);
        });
    }
}
exports.TwitterQuest = TwitterQuest;
