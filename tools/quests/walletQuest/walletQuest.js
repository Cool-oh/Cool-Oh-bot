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
const web3_js_1 = require("@solana/web3.js");
const userBackendless_1 = require("../../users/userBackendless");
const discordLogger_1 = require("../../../features/discordLogger");
const questInit_1 = require("../../quests/questInit");
dotenv_1.default.config();
const walletQuestName = process.env.WALLET_QUEST_NAME;
const walletQuestFields = walletQuest_json_1.default;
const walletQuestTokenPrize = walletQuestFields.tokenPrize;
const menu = walletQuestFields.menu;
const filename = 'walletQuests.ts';
var userToSave;
var subscribed; //If the user is subscribed to this quest
/*

async function init(interaction: Interaction){
    let functionName = init.name
    let msg = 'Trying to init the Wallet Quest'
    try {
        await refreshData(interaction)
     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
     }
 }*/
/*
 async function refreshData(interaction: Interaction) {
    let functionName = refreshData.name
    let msg = 'Trying to refresh user gobal data'
    let userWalletQuest:WalletQuestIntfc|null
    let userId=interaction.user.id
    let discordServerID = interaction.guildId!
    let subscribed = false
    try {
       let user = await  checkIfDiscordIDRegistered(userId)

       if(user != null){
        userWalletQuest = await isSubscribedToQuest(user, walletQuestName!, discordServerID)
        if (userWalletQuest != null){
            subscribed = true
            usersSolanaAddress.set(userId, userWalletQuest.solana_address!)}
         if(user.First_Name != null){
            usersFirstName.set(userId, user.First_Name)}
         if(user.Last_Name != null){
            usersLastName.set(userId, user.Last_Name) }
         if(user.email != null){
            usersEmail.set(userId,user.email) }
         if(user.Gamifications != null){
         }
     }
     usersIsSubscribed.set(userId, subscribed)

     } catch (err:any) {
         writeDiscordLog(filename, functionName, msg,  err.toString())
         console.log(err)
     }

}*/
function drawModal(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        // We create a Text Input Component FIRST NAME
        const textInputFirstName = new discord_modals_1.TextInputComponent()
            .setCustomId(walletQuestFields.modal.componentsList[0].id)
            .setLabel(walletQuestFields.modal.componentsList[0].label)
            .setStyle(walletQuestFields.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            //.setPlaceholder(usersFirstName.get(interaction.user.id))
            .setRequired(walletQuestFields.modal.componentsList[0].required); // If it's required or not
        if (questInit_1.usersFirstName.get(interaction.user.id)) {
            textInputFirstName.setPlaceholder(questInit_1.usersFirstName.get(interaction.user.id));
        }
        else {
            textInputFirstName.setPlaceholder(walletQuestFields.modal.componentsList[0].placeholder);
        }
        // We create a Text Input Component LAST NAME
        const textInputLastName = new discord_modals_1.TextInputComponent()
            .setCustomId(walletQuestFields.modal.componentsList[1].id)
            .setLabel(walletQuestFields.modal.componentsList[1].label)
            .setStyle(walletQuestFields.modal.componentsList[1].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            .setRequired(walletQuestFields.modal.componentsList[1].required); // If it's required or not
        if (questInit_1.usersLastName.get(interaction.user.id)) {
            textInputLastName.setPlaceholder(questInit_1.usersLastName.get(interaction.user.id));
        }
        else {
            textInputLastName.setPlaceholder(walletQuestFields.modal.componentsList[1].placeholder);
        }
        // We create a Text Input Component EMAIL
        const textInputEmail = new discord_modals_1.TextInputComponent()
            .setCustomId(walletQuestFields.modal.componentsList[2].id)
            .setLabel(walletQuestFields.modal.componentsList[2].label)
            .setStyle(walletQuestFields.modal.componentsList[2].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            .setRequired(walletQuestFields.modal.componentsList[2].required); // If it's required or not
        if (questInit_1.usersEmail.get(interaction.user.id)) {
            textInputEmail.setPlaceholder(questInit_1.usersEmail.get(interaction.user.id));
        }
        else {
            textInputEmail.setPlaceholder(walletQuestFields.modal.componentsList[2].placeholder);
        }
        // We create a Text Input Component SOLANA ADDRESS
        const textInputProvideSolana = new discord_modals_1.TextInputComponent() // We create a Text Input Component
            .setCustomId(walletQuestFields.modal.componentsList[3].id)
            .setLabel(walletQuestFields.modal.componentsList[3].label)
            .setStyle(walletQuestFields.modal.componentsList[3].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
            .setMinLength(walletQuestFields.modal.componentsList[3].minLenght)
            .setMaxLength(walletQuestFields.modal.componentsList[3].maxLength)
            .setRequired(walletQuestFields.modal.componentsList[3].required); // If it's required or not
        if (questInit_1.usersSolanaAddress.get(interaction.user.id)) {
            textInputProvideSolana.setPlaceholder(questInit_1.usersSolanaAddress.get(interaction.user.id));
        }
        else {
            textInputProvideSolana.setPlaceholder(walletQuestFields.modal.componentsList[3].placeholder);
        }
        const modal = new discord_modals_1.Modal() // We create a Modal
            .setCustomId(walletQuestFields.modal.id)
            .setTitle(walletQuestFields.modal.title)
            .addComponents(textInputFirstName, textInputLastName, textInputEmail, textInputProvideSolana);
        return modal;
    });
}
function drawButton(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let joinQuestButton = new discord_js_1.MessageButton()
            .setCustomId(walletQuestFields.button.customId) //our own name for our button in our code to detect which button the user clicked on
            .setEmoji(walletQuestFields.button.emoji) //CTRL+i :emojisense:
            .setLabel(walletQuestFields.button.label)
            .setStyle(walletQuestFields.button.style);
        subscribed = yield isSubscribed(interaction);
        if (subscribed) {
            joinQuestButton.setLabel(walletQuestFields.button.label_edit);
        }
        else {
            joinQuestButton.setLabel(walletQuestFields.button.label);
        }
        return joinQuestButton;
    });
}
function embedRedraw(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = embedRedraw.name;
        let msg = 'Trying to init the Quest';
        let userWalletQuest;
        let discordServerID = interaction.guildId;
        let userID = interaction.user.id;
        let walletQuestEmbed = new discord_js_1.MessageEmbed()
            .setColor(walletQuestFields.color)
            .setTitle(walletQuestFields.title)
            .setURL(walletQuestFields.url)
            .setAuthor(walletQuestFields.author)
            .setDescription(walletQuestFields.description)
            .setThumbnail(walletQuestFields.thumbnail)
            .addFields(walletQuestFields.fields)
            .setImage(walletQuestFields.image)
            .setFooter(walletQuestFields.footer);
        try {
            let user = yield (0, userBackendless_1.checkIfDiscordIDRegistered)(interaction.user.id);
            if (user != null) {
                userWalletQuest = (0, userBackendless_1.isSubscribedToQuest2)(user, walletQuestName, discordServerID);
                if (userWalletQuest != null) {
                    walletQuestEmbed.setDescription('You are alreday subscribed to this quest. Click the button below to edit it.');
                    questInit_1.usersSolanaAddress.set(userID, userWalletQuest.solana_address);
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
            return walletQuestEmbed;
        }
        catch (err) {
            (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg, err.toString());
            console.log(err);
            throw err;
        }
    });
}
function joinQuestButtonClicked(interaction, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (interaction.isButton()) {
                // await init(interaction) //we initialize again to make sure the modal has the right data from DDBB
                // await refreshData(interaction)
                let modal = yield drawModal(interaction);
                (0, discord_modals_1.showModal)(modal, {
                    client: client,
                    interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
                });
            }
        }
        catch (err) {
            console.log(err);
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
function isSubscribed(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let discordServerID = interaction.guildId;
        let user = {
            Discord_ID: interaction.user.id,
            Discord_Handle: interaction.user.username
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
function userLevelUp(userID) {
    let userXP = questInit_1.usersXP.get(userID);
    userXP += walletQuestTokenPrize;
    questInit_1.usersXP.set(userID, userXP);
    let userLevel = 1;
    questInit_1.usersLevel.set(userID, userLevel);
    let userTokens = questInit_1.usersTokens.get(userID);
    userTokens += walletQuestTokenPrize;
    questInit_1.usersTokens.set(userID, userTokens);
}
function modalSubmit(modal) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        yield modal.deferReply({ ephemeral: true });
        let isEmailValid;
        let firstNameMsg = 'Not provided';
        let lastNameMsg = 'Not provided';
        let emailMsg = 'Not provided';
        let questMsg = 'OK! You are now on the Wallet quest!!. This is the information I got from you: ';
        let userID = modal.user.id;
        const modalFirstName = modal.getTextInputValue(walletQuestFields.modal.componentsList[0].id);
        const modalLastName = modal.getTextInputValue(walletQuestFields.modal.componentsList[1].id);
        const modalEmail = modal.getTextInputValue(walletQuestFields.modal.componentsList[2].id);
        const modalSolanaAddress = modal.getTextInputValue(walletQuestFields.modal.componentsList[3].id);
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
        if (modalSolanaAddress != null) {
            modalSolanaAddress.trim();
        }
        let isSolAddress = validateSolAddress(modalSolanaAddress);
        if (isSolAddress && isEmailValid) {
            questInit_1.usersEmail.set(userID, modalEmail);
            questInit_1.usersSolanaAddress.set(userID, modalSolanaAddress);
            let discordServerObjID = yield (0, userBackendless_1.getDiscordServerObjID)(modal.guildId);
            if (subscribed) {
                questMsg = "You edited the Wallet Quest. This is the information I'll be editing: ";
            }
            else { //Give EXP points, tokens, and levelup
                userLevelUp(userID);
            }
            console.log('usersLevel.get(userID): ' + questInit_1.usersLevel.get(userID));
            console.log('usersXP.get(userID): ' + questInit_1.usersXP.get(userID));
            modal.followUp({ content: questMsg + '\nName: ' + firstNameMsg
                    + '\nLast Name: ' + lastNameMsg + '\nEmail: ' + emailMsg + '\nSolana address: ' + `\`\`\`${modalSolanaAddress}\`\`\``, ephemeral: true });
            userToSave = {
                First_Name: modalFirstName,
                Last_Name: modalLastName,
                email: modalEmail,
                Discord_ID: modal.user.id,
                Discord_Handle: modal.user.username,
                Quests: {
                    Wallet_quests: [{
                            solana_address: modalSolanaAddress,
                            Discord_Server: {
                                objectId: discordServerObjID,
                                server_id: modal.guildId,
                                server_name: (_a = modal.guild) === null || _a === void 0 ? void 0 : _a.name
                            }
                        }]
                },
                Gamifications: [{
                        Level: questInit_1.usersLevel.get(userID),
                        XP: questInit_1.usersXP.get(userID),
                        Tokens: questInit_1.usersTokens.get(userID),
                        Discord_Server: {
                            objectId: discordServerObjID,
                            server_id: modal.guildId,
                            server_name: (_b = modal.guild) === null || _b === void 0 ? void 0 : _b.name,
                        }
                    }]
            };
            (0, userBackendless_1.updateDiscordUser)(userToSave);
        }
        else {
            let msg = "";
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
    /*
    public async init(interaction:Interaction){
        return await init (interaction)
    }*/
    get menu() {
        return menu;
    }
    get joinQuestButtonLabel() {
        return walletQuestFields.button.customId;
    }
    joinQuestButtonClicked(interaction, client) {
        joinQuestButtonClicked(interaction, client);
    }
    get modalCustomID() {
        return walletQuestFields.modal.id;
    }
    modalQuestSubmit(modal) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield modalSubmit(modal);
        });
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
exports.WalletQuest = WalletQuest;
