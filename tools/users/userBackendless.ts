import {Snowflake, ThreadChannel } from 'discord.js';
import Backendless from 'backendless'
import dotenv from 'dotenv'
import { BackendlessPerson } from '../../interfaces/interfaces';
const _ = require("lodash");


dotenv.config();

const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE
Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);
/*
export interface BackendlessPerson {
    ddbb_name?: string
    objectId?: string,
    email?: string,
    First_Name?: string,
    Last_Name?: string,
    Discord_Handle?: string,
    Discord_ID?: Snowflake,
    Twitter_Handle?: string,
    Twitter_ID?: number,
    created?: Date,
    updated?: Date
}*/



export async function checkIfEmailRegistered(email: string) : Promise<BackendlessPerson>{
    var whereClause = "email='" + email + "'";
    var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );
    try {
        let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )
        if (!result[0]) {
            console.log('User email not found')
        } else {
            console.log('User email found: ' + result[0].email)
        }
        return result[0]
    } catch (error) {
        throw error
    }

}

export async function  checkIfDiscordIDRegistered(discordUserId: Snowflake): Promise<BackendlessPerson> {

    var whereClause = "Discord_ID=" + discordUserId;
    var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );
    try {
        let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )
        if (!result[0]) {
            console.log('User not found')
        } else {
            console.log('User found. Name: ' + result[0].First_Name)
        }
        return result[0]
    } catch (error) {
        throw error
    }
}

async function mergeBackendlessData(user1:BackendlessPerson, user2:BackendlessPerson){
    console.log("Merging data...")
    console.log("ID1: " + user1.objectId)
    console.log("ID2: " + user2.objectId)
    let userResult
    let userMerged
    let userToDelete
    let user1LastDate
    let user2LastDate = new Date()

    if (user1.updated) {
        console.log("ID1: updated " )
        user1LastDate = new Date(user1.updated)
    }else {
        console.log("ID1: NOT updated " )
        user1LastDate = new Date(user1.created!)
        //user1LastDate = user1.created!
    }
    if (user2.updated) {
        console.log("ID2: updated " )
        user2LastDate = new Date(user2.updated)
    }else {
        console.log("ID2: NOT updated " )
        user2LastDate = new Date(user2.created!)
    }

    //sort them the two users by date
    if (user1LastDate >user2LastDate) { //We take ID1

       userMerged ={..._.omitBy(user2, _.isNull), ..._.omitBy(user1, _.isNull)}
      // userMerged = {...user2, ...user1} //merge both users, if same property, user1 overwrites user2 becasue it's newer
       userToDelete = user2

    } else { //we take ID2

       userMerged ={..._.omitBy(user1, _.isNull), ..._.omitBy(user2, _.isNull)} //merge both users, if same property, user2 overwrites user1 becasue it's newer
       userToDelete = user1
    }
    try {
        await Backendless.Data.of( backendlessUserTable! ).remove( userToDelete.objectId! )
        userResult =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( userMerged )
        console.log("User with ID: " + userToDelete.objectId! + 'deleted, and merged with user ID ' + userResult.objectId + ' which is newer.')
    } catch (error) {
        throw(error)
    }
    return userResult
}

export async function udpateDiscordUser(user:BackendlessPerson) {
    let result
    let userEmail
    let registeredUser
    try {
        if (!user.Discord_ID) {
            throw new Error("Unexpected error: Missing User DiscordID");
            }
        if(user.email){//email provided
            console.log('User provides email')
            userEmail = await checkIfEmailRegistered(user.email)
            console.log('User email: ' + userEmail)
            if (userEmail !== undefined) {//if email exists in ddbb
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in db: Problem. We update with the new data. Assume new data is better
                    console.log("1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb.")
                    if (userEmail.objectId == registeredUser.objectId) { //is it the same record? DiscordID & Email are in the same record
                        console.log("1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same record. We UPDATE it")
                        user.objectId =  userEmail.objectId
                        result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( user )
                    } else {//is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                        console.log("1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better")

                        let mergedUser = await mergeBackendlessData(userEmail, registeredUser)
                        console.log("1:" + JSON.stringify(userEmail))
                        console.log("2" + JSON.stringify(registeredUser))
                        console.log(mergedUser)
                    }

                } else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                    console.log("2 Email Provided. Email exists in ddbb. DiscordID !exist in ddbb: We UPDATE email ddbb with discordID")
                    user.objectId =  userEmail.objectId
                    result =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( user )
                }

            } else { //email !exist in ddbb
                console.log('email doesnt exist in ddbb')
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    console.log("3 Email Provided. Email !exist in ddbb. DiscordID exists: We UPDATE record")
                    user.objectId =  registeredUser.objectId
                    result =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( user )
                } else { //DiscordID !exist in ddbb: Create record
                    console.log("4 Email Provided. Email !exist in ddbb. DiscordID !exist: We CREATE record")
                    result =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( user )
                }

            }
        }else{ //email not provided
            let registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
            if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                console.log("5 Email !provided. DiscordID exists: We UPDATE record")
                user.objectId =  registeredUser.objectId
                result =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( user )

            } else { //DiscordID !exist in ddbb: Create record
                console.log("6 Email !provided. DiscordID !exists: We CREATE record")
                result =  await Backendless.Data.of( backendlessUserTable! ).save<BackendlessPerson>( user )
            }

        }
    } catch (error) {
        throw error
    }



}



