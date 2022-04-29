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
exports.isTwitterHandleValid = exports.basicModalTextInputs = exports.titleCase = void 0;
const axios_1 = __importDefault(require("axios"));
const discord_modals_1 = require("discord-modals");
const questInit_1 = require("./quests/questInit");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.TWITTER_TOKEN_BEARER
    },
};
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}
exports.titleCase = titleCase;
// Builds an array of basic text Inputs with Name, lastname and email
function basicModalTextInputs(userID, questEmbedJson) {
    let textInputs = [];
    // We create a Text Input Component FIRST NAME
    const textInputFirstName = new discord_modals_1.TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[0].id)
        .setLabel(questEmbedJson.modal.componentsList[0].label)
        .setStyle(questEmbedJson.modal.componentsList[0].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[0].required); // If it's required or not
    if (questInit_1.usersFirstName.get(userID)) {
        textInputFirstName.setPlaceholder(questInit_1.usersFirstName.get(userID));
    }
    else {
        textInputFirstName.setPlaceholder(questEmbedJson.modal.componentsList[0].placeholder);
    }
    // We create a Text Input Component LAST NAME
    const textInputLastName = new discord_modals_1.TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[1].id)
        .setLabel(questEmbedJson.modal.componentsList[1].label)
        .setStyle(questEmbedJson.modal.componentsList[1].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[1].required); // If it's required or not
    if (questInit_1.usersLastName.get(userID)) {
        textInputLastName.setPlaceholder(questInit_1.usersLastName.get(userID));
    }
    else {
        textInputLastName.setPlaceholder(questEmbedJson.modal.componentsList[1].placeholder);
    }
    // We create a Text Input Component EMAIL
    const textInputEmail = new discord_modals_1.TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[2].id)
        .setLabel(questEmbedJson.modal.componentsList[2].label)
        .setStyle(questEmbedJson.modal.componentsList[2].style) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[2].required); // If it's required or not
    if (questInit_1.usersEmail.get(userID)) {
        textInputEmail.setPlaceholder(questInit_1.usersEmail.get(userID));
    }
    else {
        textInputEmail.setPlaceholder(questEmbedJson.modal.componentsList[2].placeholder);
    }
    textInputs.push(textInputFirstName, textInputLastName, textInputEmail);
    return textInputs;
}
exports.basicModalTextInputs = basicModalTextInputs;
function isTwitterHandleValid(twitterHandle) {
    return __awaiter(this, void 0, void 0, function* () {
        let uri = "";
        uri = 'https://api.twitter.com/2/users/by/username/' + twitterHandle;
        var message;
        try {
            let response = yield axios_1.default.get(uri, headers);
            if (response.data.errors) {
                message = 'HANDLE_NOT_EXISTS';
                return message;
            }
            else if (response.data.data.username) {
                message = 'HANDLE_EXISTS';
                return message;
            }
            else {
                return null;
            }
        }
        catch (reason) {
            if (reason.response.status === 400) {
                message = 'HANDLE_ERROR';
                return message;
            }
            else {
                message = 'OTHER_ERROR';
                return message;
            }
        }
    });
}
exports.isTwitterHandleValid = isTwitterHandleValid;
