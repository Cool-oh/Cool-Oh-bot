import {Snowflake } from 'discord.js';
import Backendless from 'backendless'
import dotenv from 'dotenv'
import { BackendlessPerson, AllQuests, WalletQuests, TwitterQuests, DiscordServer, Gamification, Quests, WalletQuestIntfc} from '../../interfaces/interfaces';
import {writeDiscordLog} from '../../features/discordLogger';
import { WalletQuest } from '../quests/walletQuest/walletQuest';
const _ = require("lodash");
const filename='userBackendless.ts'

dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME
const twitterQuestName = process.env.TWITTER_QUEST_NAME
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE
const backendlessDiscordServersTable = process.env.BACKENDLESS_DISCORDSERVERS_TABLE
const backendlessRelationshipDepth = Number(process.env.BACKENDLESS_RELATIONSHIP_DEPTH)

try {
    Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);

} catch (error:any) {
    writeDiscordLog(filename, 'Backendless initialization', 'Trying to inoitialize Backendless: ', error.toString())
    throw error
}

export async function getDiscordServerObjID(serverId:string):Promise<string>{
    let functionName = getDiscordServerObjID.name
    let errMsg = 'Trying to get discord server ObjectID from server iD: ' + serverId + ' in DDBB'
    var queryBuilder = Backendless.DataQueryBuilder.create()
    let result:DiscordServer[]
    queryBuilder.setWhereClause('server_id = ' + serverId)


    try {
        result =  await Backendless.Data.of( backendlessDiscordServersTable! ).find<DiscordServer>( queryBuilder )
        .catch( e => {
            writeDiscordLog(filename, functionName, errMsg, e.toString())
            return result
        })
        if(result[0]){
            return result[0].objectId!
        }
        else{
            return ''
        }

    } catch (error) {
        throw error
    }

}

 function getObject(object:object, searchString:string):any { //finds if the string is a property of the object. If it is, it returns the subobject
    var result;
    if (!object || typeof object !== 'object') return;
    Object.values(object).some(v => {
        if (v === searchString) return result = object;
        return result = getObject(v, searchString);
    });
    return result;
}


export async function isSubscribedToQuest(user:BackendlessPerson, questName: string, discordServerID:string): Promise <AllQuests|null> {//userID is the objectID in backendless for the user

    let resultFound
    try {
        let isUserRegistered = await checkIfDiscordIDRegistered(user.Discord_ID)
        if (isUserRegistered) { //user is registered
            if (isUserRegistered.Quests) { //the user has quests
               if(isUserRegistered.Quests[questName] ){ //If user is subscribed to the quest we are looking for
                   resultFound = getObject(isUserRegistered.Quests[questName],  discordServerID)
                   if (resultFound != null) {
                       for (let index = 0; index < isUserRegistered.Quests[questName].length; index++) {
                           if (isUserRegistered.Quests[questName][index].Discord_Server.server_id == resultFound.server_id) {
                            return isUserRegistered.Quests[questName][index] //we return the quest that matches the server id and the nameQuest
                           }
                       }
                   }else{
                    return null
                   }
                }
            }
       else { //user not registered. We register it
            updateDiscordUser(user)
            return null
            }
        }
    } catch (error) {
        throw error
    }

        return null


}


export async function checkIfEmailRegistered(email: string) : Promise<BackendlessPerson>{
    let result:BackendlessPerson[]
    let functionName = checkIfEmailRegistered.name
    let errMsg = 'Error checking if email ' + email + 'is registered in the DDBB'
    var whereClause = "email='" + email + "'";
    var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );
    queryBuilder.setRelationsDepth( backendlessRelationshipDepth );
    try {
        result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )
        .catch( e => {
            writeDiscordLog(filename, functionName, errMsg, e.toString())
            return result
        })
        return result[0]
    } catch (error) {
        throw error
    }
}

export async function  checkIfDiscordIDRegistered(discordUserId: Snowflake): Promise<BackendlessPerson> {
    let functionName = checkIfDiscordIDRegistered.name
    let errMsg = 'Trying to find discord user ID: ' + discordUserId + ' in DDBB'
    let result:BackendlessPerson[]
    var queryBuilder = Backendless.DataQueryBuilder.create()
    queryBuilder.setRelationsDepth( backendlessRelationshipDepth )
    queryBuilder.setWhereClause("Discord_ID = '" + discordUserId + "'")

    try {
        result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )
        .catch( e => {
            writeDiscordLog(filename, functionName, errMsg , e.toString())
            return result})
        return result[0]
    } catch (error) {
        throw error
    }
}


async function mergeBackendlessData(user1:BackendlessPerson, user2:BackendlessPerson){
    console.log("Merging data...")
    console.log("ID1: " + user1.objectId)
    console.log("ID2: " + user2.objectId)
    let functionName = mergeBackendlessData.name
    let removedUser1= removeEmpty(user1)
    let removedUser2 = removeEmpty(user2)
    let userResult
    let userMerged:BackendlessPerson
    let userToDelete:BackendlessPerson
    let user1LastDate
    let user2LastDate = new Date()

    if (user1.updated) {
        console.log("ID1: updated \n" )
        user1LastDate = new Date(user1.updated)
    }else {
        console.log("ID1: NOT updated \n" )
        user1LastDate = new Date(user1.created!)
    }
    if (user2.updated) {
        console.log("ID2: updated \n" )
        user2LastDate = new Date(user2.updated)
    }else {
        console.log("ID2: NOT updated \n" )
        user2LastDate = new Date(user2.created!)
    }
    //sort them the two users by date
    if (user1LastDate >user2LastDate) { //We take ID1
        userMerged = mergeUsersWithQuests(removedUser2, removedUser1)//merge both users, if same property, user1 overwrites user2 becasue it's newer
        userToDelete = user2
    } else { //we take ID2
        userMerged = mergeUsersWithQuests(removedUser1, removedUser2)//merge both users, if same property, user2 overwrites user1 becasue it's newer
        userToDelete = user1
    }
    try {

        await Backendless.Data.of( backendlessUserTable! ).remove( userToDelete.objectId! )
        .catch( e => writeDiscordLog(filename, functionName, 'Trying remove user with objectID: \n'+ userToDelete.objectId + ' from DDBB\n'  , e.toString()))

        userResult =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( userMerged )
        .catch( e => writeDiscordLog(filename, functionName, 'Trying to deep save a merged user: \n'+ JSON.stringify(userMerged) , e.toString()))

        console.log("User with ID: " + userToDelete.objectId! + ' deleted, and merged with user ID ' + userResult?.objectId + ' which is newer.\n')
    } catch (error) {
        throw(error)
    }
    return userResult
}

export function removeEmpty(obj:any):any { //removes null properties from an object and subobjects
    let functionName = removeEmpty.name
    try {
        var clean:any = Object.fromEntries(
          Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
            .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
        );
        return Array.isArray(obj) ? Object.values(clean) : clean;
    } catch (err:any) {

        writeDiscordLog(filename, functionName, 'Trying to remove null propreties from object: '+ JSON.stringify(obj) , err.toString())
    }
  }

function mergeQuests (userDDBB: BackendlessPerson, newUser: BackendlessPerson, questName: string):AllQuests[]{ //returns an array of merged questName quests
	let userToSaveQuests:AllQuests[] = []
	let arrayOfMerged = []
    let userDDBB_hasQuests = false
    let newUser_hasQuests = false
    if(newUser.Quests !== undefined) newUser_hasQuests = true
    if(userDDBB.Quests !== undefined) userDDBB_hasQuests = true
    if(newUser_hasQuests && userDDBB_hasQuests ){
		for (let index = 0; index < newUser.Quests![questName].length; index++) {
			loop2:
			for (let index2 = 0; index2 < userDDBB.Quests![questName].length; index2++) {
				if(newUser.Quests![questName][index].Discord_Server.objectId === userDDBB.Quests![questName][index2].Discord_Server.objectId){
					//Both quests have the same ServerID, so we merge them
					userToSaveQuests.push(_.merge(userDDBB.Quests![questName][index2], newUser.Quests![questName][index]))
					arrayOfMerged.push(index2) //array of indexes that produced a merge
					break loop2//we exit this loop
			}
				if(index2 === (userDDBB.Quests![questName].length - 1 ) ){ //at the end of loop
					userToSaveQuests.push(newUser.Quests![questName][index]) //if we are at the end of the loop and no quests are the same, we push the newuser quest
				}
            }
         }
            for (let index3 = 0; index3 <  userDDBB.Quests![questName].length; index3++) {
				if(!arrayOfMerged.includes(index3)){
					userToSaveQuests.push(userDDBB.Quests![questName][index3])
					}
			    }
                return userToSaveQuests
    }
    else{
        return userToSaveQuests
    }
}

function mergeUsersWithQuests(userDDBB: BackendlessPerson, newUser: BackendlessPerson): BackendlessPerson{
    let functionName = mergeUsersWithQuests.name
    let userDDBB_hasQuests = false
    let newUser_hasQuests = false
	let newUserHasWalletQuests = false
	let newUserHasTwitterQuests = false
	let userDDBBHasWalletQuests = false
	let userDDBBHasTwitterQuests = false
    let userQuestsObjId
	let userMergedWithQuests: BackendlessPerson = {Discord_ID:''}
	let userToSaveFirstLevel: BackendlessPerson
	let userToSaveWalletQuest: BackendlessPerson
	let userToSaveTwitterQuest: BackendlessPerson
	let mergedWalletQuests:WalletQuests = []
	let mergedTwitterQuests: TwitterQuests = []

	try {
        if(newUser.Quests != null) {newUser_hasQuests = true}
        if(userDDBB.Quests !=  null) {userDDBB_hasQuests = true}

        if(userDDBB_hasQuests  && newUser_hasQuests ){
            let newUserFirstLevel = {...newUser}
            if(newUser.Quests!.objectId != null){
                userQuestsObjId = newUser.Quests!.objectId
            }else{
                userQuestsObjId = userDDBB.Quests!.objectId
            }

            delete newUserFirstLevel.Quests
            let userDDBBFirstLevel = {...userDDBB}
            delete userDDBBFirstLevel.Quests
            userToSaveFirstLevel = _.merge(userDDBBFirstLevel, newUserFirstLevel)

        	if (newUser.Quests!.Wallet_quests !=  null) {newUserHasWalletQuests = true}
        	if (newUser.Quests!.Twitter_quests !=  null) {newUserHasTwitterQuests = true}
        	if (userDDBB.Quests!.Wallet_quests != null) {userDDBBHasWalletQuests = true}
        	if (userDDBB.Quests!.Twitter_quests !=  null) {userDDBBHasTwitterQuests = true}

        	if (userDDBBHasWalletQuests &&  newUserHasWalletQuests){
        	    mergedWalletQuests = mergeQuests( userDDBB, newUser, walletQuestName!) as WalletQuests
        	}
        	if (userDDBBHasTwitterQuests &&  newUserHasTwitterQuests){
        	    mergedTwitterQuests = mergeQuests(userDDBB, newUser, twitterQuestName!) as TwitterQuests
        	}
        	if(!userDDBBHasWalletQuests && newUserHasWalletQuests){
        	    for (let index = 0; index < newUser.Quests!.Wallet_quests!.length; index++) {
        	    	mergedWalletQuests.push(newUser.Quests!.Wallet_quests! [index])
        		}
        	}
        	if(userDDBBHasWalletQuests && !newUserHasWalletQuests){
        	    for (let index = 0; index < userDDBB.Quests!.Wallet_quests!.length; index++) {
        	        mergedWalletQuests.push(userDDBB.Quests!.Wallet_quests![index])
        	    }
        	}
        	if( !userDDBBHasTwitterQuests &&  newUserHasTwitterQuests){
        	    for (let index = 0; index < newUser.Quests!.Twitter_quests!.length; index++) {
        	    	mergedTwitterQuests.push(newUser.Quests!.Twitter_quests![index])
        	    }
        	}
        	if(userDDBBHasTwitterQuests && !newUserHasTwitterQuests){
        		for (let index = 0; index < userDDBB.Quests!.Twitter_quests!.length; index++) {
        		    mergedTwitterQuests.push(userDDBB.Quests!.Twitter_quests![index])
        		}
        	}
            userToSaveWalletQuest = {
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': {'objectId': userQuestsObjId, [walletQuestName!]: mergedWalletQuests} }
            userToSaveTwitterQuest  ={
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': {'objectId': userQuestsObjId, [twitterQuestName!]: mergedTwitterQuests} }
            userMergedWithQuests = _.merge(userToSaveFirstLevel, userToSaveWalletQuest, userToSaveTwitterQuest)

            return userMergedWithQuests
            }

        if ((!userDDBB_hasQuests && newUser_hasQuests) || (!userDDBB_hasQuests && !newUser_hasQuests)){
            return userMergedWithQuests = _.merge(userDDBB, newUser)
        }
        if (userDDBB_hasQuests && !newUser_hasQuests){
            userMergedWithQuests = _.merge(userDDBB, newUser) //we merge both, but lose the quests
            userMergedWithQuests.Quests = userDDBB.Quests //we restore the quests
            return userMergedWithQuests
        }
    } catch (err:any) {
        writeDiscordLog(filename, functionName, 'Trying to merge user1:  \n' + JSON.stringify(userDDBB) + ' \n \nand user2: \n'+ JSON.stringify(newUser),  err.toString())
        console.log(err)
    }
    return userMergedWithQuests
}

export async function updateDiscordUser(user:BackendlessPerson) {
    let functionName = updateDiscordUser.name
    let result
    let userEmail
    let registeredUser
    let userToSave:BackendlessPerson
    let removedUser = removeEmpty(user)
    try {
        if (!user.Discord_ID) {
            throw new Error("Unexpected error: Missing User DiscordID");
            }
        if(user.email){//email provided
            userEmail = await checkIfEmailRegistered(user.email)
            if (userEmail !== undefined) {//if email exists in ddbb
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in db: Problem. We update with the new data. Assume new data is better
                    console.log("1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb.")
                    if (userEmail.objectId == registeredUser.objectId) { //is it the same record? DiscordID & Email are in the same record
                        let msg = "1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same record. We UPDATE it"
                        console.log(msg)
                        removedUser.objectId =  userEmail.objectId
                        let removedUserEmail= removeEmpty(userEmail)
                        userToSave = mergeUsersWithQuests(removedUserEmail, removedUser)

                        result =  await Backendless.Data.of(backendlessUserTable!)
                        .deepSave<BackendlessPerson>( userToSave )
                        .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + userToSave.Discord_Handle  +
                        ' with discordID: ' + userToSave.Discord_ID + ' in DDBB: \n' + msg, e.toString()))
                    } else {//is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                        let msg = "1.2 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better"
                        console.log(msg)
                        //first we merge the two records in the database
                        let removedUserEmail = removeEmpty(userEmail)
                        let removedRegisteredUser = removeEmpty(registeredUser)
                        let mergedUser = await mergeBackendlessData(removedUserEmail, removedRegisteredUser) //we need to make sure which one is newer so we can merge them

                        //now merge the result with the user we want to save (removedUser)
                        let removedmergedUser= removeEmpty(mergedUser)
                        let userMergedSecond= mergeUsersWithQuests(removedmergedUser, removedUser)
                        result =  await Backendless.Data.of(backendlessUserTable!)
                        .deepSave<BackendlessPerson>( userMergedSecond )
                        .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' +  JSON.stringify(userMergedSecond) + ' in DDBB: \n' + msg, e.toString()))
                    }
                } else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                    let msg="2 Email Provided. Email exists in ddbb. DiscordID doesnt exist in ddbb: We UPDATE email ddbb with discordID."
                    console.log(msg)
                    removedUser.objectId =  userEmail.objectId
                    let removedUserEmail= removeEmpty(userEmail)

                    userToSave = mergeUsersWithQuests(removedUserEmail, removedUser)
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( userToSave )
                    .catch( e => writeDiscordLog(filename, functionName, msg + ' Trying to update user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg , e.toString()))
                }
            } else { //email !exist in ddbb
                let msg='email doesnt exist in ddbb'
                console.log(msg)
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    let msg = "3 Email Provided. Email doesnt exist in ddbb. DiscordID exists: We UPDATE record."
                    console.log(msg)
                    removedUser.objectId =  registeredUser.objectId
                    userToSave = mergeUsersWithQuests(registeredUser, removedUser)
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( userToSave )
                    .catch( e => writeDiscordLog(filename, functionName, msg +' Trying to save user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg , e.toString()))
                } else { //DiscordID !exist in ddbb: Create record
                    let msg = "4 Email Provided. Email doesnt exist in ddbb. DiscordID !exist: We CREATE record."
                    console.log(msg)
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( removedUser )
                    .catch( e => writeDiscordLog(filename, functionName, msg + ' Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
                }
            }
        }else{ //email not provided
            let registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
            if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                let msg = "5 Email NOT provided. DiscordID exists: We UPDATE record"
                console.log(msg)
                removedUser.objectId =  registeredUser.objectId
                userToSave = mergeUsersWithQuests(registeredUser, removedUser)
                result =  await Backendless.Data.of(backendlessUserTable!)
                .deepSave<BackendlessPerson>( userToSave )
                .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg , e.toString()))
            } else { //DiscordID !exist in ddbb: Create record
                let msg ="6 Email NOT provided. DiscordID !exists: We CREATE record"
                console.log(msg)
                result =  await Backendless.Data.of(backendlessUserTable!)
                .deepSave<BackendlessPerson>( removedUser )
                .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
            }
        }
    } catch (error) {
        throw error
    }
}

export async function getUserGamification(user:BackendlessPerson):Promise<Gamification | null>
 {
    try {
        let isUserRegistered = await checkIfDiscordIDRegistered(user.Discord_ID)
        if (isUserRegistered) { //user is registered
            if (isUserRegistered.Gamification) { //the user has gamification data
                return isUserRegistered.Gamification
            }

        } else{
            updateDiscordUser(user)
            return null
        }
        return null

    } catch (error) {
        return null
    }
}

export function getAllUserQuestsNames(user:BackendlessPerson):String[]|null {
    let temp:string[]
    let result:string[]=[]
    const words = ["created", "___class", "ownerId", "updated", "objectId", "Index_quests"];
    
    if(user.Quests != null){
        temp = Object.keys(user.Quests)
        for (let index = 0; index < temp.length; index++) {

            if(!words.some(word => temp![index].includes(word))){ //If it doesnt include any of the words in variable words[]
                if(user.Quests[temp![index]].length !=0){ //user has this quest
                    
                    result.push(temp![index])
                    console.log(user.Quests[temp![index]])
                }
                

            }
        }


	    return result
    }else{
        return null
    }
}
