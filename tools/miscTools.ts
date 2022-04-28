import { TextInputComponent, TextInputStyle } from "discord-modals";
import { text } from "express";
import { QuestEmbedJson } from "../interfaces/interfaces";
import { usersEmail, usersFirstName, usersLastName } from "./quests/questInit";

export function titleCase(str:string) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
 }

// Builds an array of basic text Inputs with Name, lastname and email
 export function basicModalTextInputs(userID:string, questEmbedJson:QuestEmbedJson):TextInputComponent[]{
     let textInputs:TextInputComponent[] = []

    // We create a Text Input Component FIRST NAME
    const textInputFirstName =   new TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[0].id)
        .setLabel(questEmbedJson.modal.componentsList[0].label)
        .setStyle(questEmbedJson.modal.componentsList[0].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[0].required) // If it's required or not
    if(usersFirstName.get(userID)){
        textInputFirstName.setPlaceholder(usersFirstName.get(userID))
    }else{
        textInputFirstName.setPlaceholder(questEmbedJson.modal.componentsList[0].placeholder)
    }
    // We create a Text Input Component LAST NAME
    const textInputLastName =   new TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[1].id)
        .setLabel(questEmbedJson.modal.componentsList[1].label)
        .setStyle(questEmbedJson.modal.componentsList[1].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[1].required) // If it's required or not
    if(usersLastName.get(userID)){
        textInputLastName.setPlaceholder(usersLastName.get(userID))
    }else{
        textInputLastName.setPlaceholder(questEmbedJson.modal.componentsList[1].placeholder)
    }
    // We create a Text Input Component EMAIL
    const textInputEmail=   new TextInputComponent()
        .setCustomId(questEmbedJson.modal.componentsList[2].id)
        .setLabel(questEmbedJson.modal.componentsList[2].label)
        .setStyle(questEmbedJson.modal.componentsList[2].style as TextInputStyle) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setRequired(questEmbedJson.modal.componentsList[2].required) // If it's required or not
    if(usersEmail.get(userID)){
        textInputEmail.setPlaceholder(usersEmail.get(userID))
    }else{
        textInputEmail.setPlaceholder(questEmbedJson.modal.componentsList[2].placeholder)
    }

    textInputs.push(textInputFirstName, textInputLastName, textInputEmail )

     return textInputs

 }