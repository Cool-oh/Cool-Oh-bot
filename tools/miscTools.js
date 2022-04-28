"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicModalTextInputs = exports.titleCase = void 0;
const discord_modals_1 = require("discord-modals");
const questInit_1 = require("./quests/questInit");
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
