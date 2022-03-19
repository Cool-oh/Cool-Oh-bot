import {Snowflake } from 'discord.js';
import Backendless from 'backendless'
import dotenv from 'dotenv'
import { BackendlessPerson, AllQuests, WalletQuests, TwitterQuests, DiscordServer} from '../../interfaces/interfaces';
import {writeDiscordLog} from '../../features/discordLogger';
const _ = require("lodash");
const filename='userBackendless.ts'

dotenv.config();

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
            console.log(result[0].server_id)
            return result[0].objectId!
        }
        else{
            console.log('doesnt exist')
            return ''
        }

    } catch (error) {
        throw error
    }

}

 function getObject(object:object, searchString:string) { //finds if the string is a property of the object. If it is, it returns the subobject
    var result;
    if (!object || typeof object !== 'object') return;
    Object.values(object).some(v => {
        if (v === searchString) return result = object;
        return result = getObject(v, searchString);
    });
    return result;
}

export async function isSubscribedToQuest(user:BackendlessPerson, questName: string, discordServerID:string): Promise <boolean> {//userID is the objectID in backendless for the user


    try {
        let isUserRegistered = await checkIfDiscordIDRegistered(user.Discord_ID)
        if (isUserRegistered) { //user is registered
            console.log('isUserRegistered ' + JSON.stringify(isUserRegistered ))

            if (isUserRegistered.Quests) { //the user has quests
               if(isUserRegistered.Quests[questName] ){ //If user is subscribed to the quest we are looking for
                   let resultFound = getObject(isUserRegistered.Quests[questName],  discordServerID)
                   if(resultFound)
                   {
                   return true

               }else{//If user is not subscribed to the quest we are looking for
                   return false
               }
             }
            } else {//the user is not doing any quest
                return false
            }
            return false
        } else { //user not registered. We register it
            updateDiscordUser(user)
            return false
            }

    } catch (error) {
        throw error
    }
}
async function getUserDeep(userID:string, relationsDepth: number): Promise<BackendlessPerson>  {

    var queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.setRelationsDepth( relationsDepth );
    try {
        let result = await Backendless.Data.of( backendlessUserTable! ).findById<BackendlessPerson>( userID, queryBuilder )
        return result
    } catch (error) {
        throw error
    }
  }

export async function checkIfEmailRegistered(email: string) : Promise<BackendlessPerson>{
    var whereClause = "email='" + email + "'";
    var queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );
    queryBuilder.setRelationsDepth( 3 );
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
    let functionName = checkIfDiscordIDRegistered.name
    let errMsg = 'Trying to find discord user ID: ' + discordUserId + ' in DDBB'
    var queryBuilder = Backendless.DataQueryBuilder.create()
    queryBuilder.setRelationsDepth( backendlessRelationshipDepth )
    queryBuilder.setWhereClause('Discord_ID = ' + discordUserId)


    try {
        let result =  await Backendless.Data.of( backendlessUserTable! ).find<BackendlessPerson>( queryBuilder )

        if (!result[0]) {
            console.log('User not found')
        } else {
            console.log('User found. Discord Handle: ' + result[0].Discord_Handle)
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
    let functionName = mergeBackendlessData.name
    let removedUser1= removeEmpty(user1)
    let removedUSer2 = removeEmpty(user2)
    let userResult
    let userMerged:BackendlessPerson
    let userToDelete:BackendlessPerson
    let user1LastDate
    let user2LastDate = new Date()

    if (user1.updated) {
        console.log("ID1: updated " )
        user1LastDate = new Date(user1.updated)
    }else {
        console.log("ID1: NOT updated " )
        user1LastDate = new Date(user1.created!)
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
        userMerged = mergeUsersWithQuests(removedUSer2, removedUser1)//merge both users, if same property, user1 overwrites user2 becasue it's newer
        userToDelete = user2

    } else { //we take ID2
        userMerged = mergeUsersWithQuests(removedUser1, removedUSer2)//merge both users, if same property, user2 overwrites user1 becasue it's newer
        userToDelete = user1
    }
    try {
        await Backendless.Data.of( backendlessUserTable! ).remove( userToDelete.objectId! )
        .catch( e => writeDiscordLog(filename, functionName, 'Trying remove user with objectID: '+ userToDelete.objectId + ' from DDBB'  , e.toString()))
        userResult =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( userMerged )
        .catch( e => writeDiscordLog(filename, functionName, 'Trying to deep save a merged user: '+ JSON.stringify(userMerged) , e.toString()))

        console.log("User with ID: " + userToDelete.objectId! + ' deleted, and merged with user ID ' + userResult?.objectId + ' which is newer.')
    } catch (error) {
        throw(error)
    }
    return userResult
}

function removeEmpty(obj:any) { //removes null properties from an object and subobjects
    var clean:any = Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
        .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
    );
    return Array.isArray(obj) ? Object.values(clean) : clean;
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
			console.log('Index: ' + index)
			loop2:
			for (let index2 = 0; index2 < userDDBB.Quests![questName].length; index2++) {
				if(newUser.Quests![questName][index].Discord_Server.objectId === userDDBB.Quests![questName][index2].Discord_Server.objectId){
					//Both quests have the same ServerID, so we merge them
					userToSaveQuests.push(_.merge(userDDBB.Quests![questName][index2], newUser.Quests![questName][index]))
					arrayOfMerged.push(index2) //array of indexes that produced a merge
					break loop2//we exit this loop
			}
				if(index2 === (userDDBB.Quests![questName].length - 1 ) ){ //at the end of loop
					console.log('Pushing end of loop:' + '\n')
					userToSaveQuests.push(newUser.Quests![questName][index]) //if we are at the end of the loop and no quests are the same, we push the newuser quest
				}
            }
         }
            for (let index3 = 0; index3 <  userDDBB.Quests![questName].length; index3++) {
				if(!arrayOfMerged.includes(index3)){
					console.log('Pushing remanent:' + '\n')
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
	let userMergedWithQuests: BackendlessPerson = {Discord_ID:''}
	let userToSaveFirstLevel: BackendlessPerson
	let userToSaveWalletQuest: BackendlessPerson
	let userToSaveTwitterQuest: BackendlessPerson
	let mergedWalletQuests:WalletQuests = []
	let mergedTwitterQuests: TwitterQuests = []

	try {
        let newUserFirstLevel = {...newUser}
        	delete newUserFirstLevel.Quests

        	let userDDBBFirstLevel = {...userDDBB}
        	delete userDDBBFirstLevel.Quests

         	userToSaveFirstLevel = _.merge(userDDBBFirstLevel, newUserFirstLevel)

            if(newUser.Quests !== undefined) newUser_hasQuests = true
            if(userDDBB.Quests !== undefined) userDDBB_hasQuests = true

            if(userDDBB_hasQuests  && newUser_hasQuests ){

        	    if (newUser.Quests!.Wallet_quests !== undefined) newUserHasWalletQuests = true
        	    if (newUser.Quests!.Twitter_quests !== undefined) newUserHasTwitterQuests = true
        	    if (userDDBB.Quests!.Wallet_quests !== undefined) userDDBBHasWalletQuests = true
        	    if (userDDBB.Quests!.Twitter_quests !== undefined)	userDDBBHasTwitterQuests = true

        	    if ( userDDBBHasWalletQuests &&  newUserHasWalletQuests){
        	    	mergedWalletQuests = mergeQuests( userDDBB, newUser, 'Wallet_quests') as WalletQuests
        	    }
        	    if ( userDDBBHasTwitterQuests &&  newUserHasTwitterQuests ){
        	    	mergedTwitterQuests = mergeQuests(userDDBB, newUser, 'Twitter_quests') as TwitterQuests
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

            console.log('mergedWalletQuests: ' + JSON.stringify(mergedWalletQuests)+ '\n')
            console.log('mergedTwitterQuests: ' + JSON.stringify(mergedTwitterQuests)+ '\n')
            userToSaveWalletQuest = {
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': {'Wallet_quests': mergedWalletQuests} }
            userToSaveTwitterQuest  ={
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': {'Twitter_quests': mergedTwitterQuests} }
            userMergedWithQuests = _.merge(userToSaveFirstLevel, userToSaveWalletQuest, userToSaveTwitterQuest)

            console.log('userMergedWithQuests FINAL: ' + JSON.stringify(userMergedWithQuests)+ '\n')

            return userMergedWithQuests
            }

    } catch (err:any) {

        writeDiscordLog(filename, functionName, 'Trying to save user ',  err.toString())
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
            console.log('User provides email')
            userEmail = await checkIfEmailRegistered(user.email)
            console.log('User email: ' + userEmail)
            if (userEmail !== undefined) {//if email exists in ddbb
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in db: Problem. We update with the new data. Assume new data is better
                    console.log("1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb.")
                    if (userEmail.objectId == registeredUser.objectId) { //is it the same record? DiscordID & Email are in the same record
                        let msg = "1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same record. We UPDATE it"
                        console.log(msg)
                        removedUser.objectId =  userEmail.objectId
                        let removedUserEmail= removeEmpty(userEmail)
                        //userToSave = _.merge(removedUserEmail, removedUser)
                        userToSave = mergeUsersWithQuests(removedUserEmail, removedUser)

                        result =  await Backendless.Data.of(backendlessUserTable!)
                        .deepSave<BackendlessPerson>( userToSave )
                        .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + userToSave.Discord_Handle  +
                        ' with discordID: ' + userToSave.Discord_ID + ' in DDBB: \n' + msg, e.toString()))
                    } else {//is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                        let msg = "1.2 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better"
                        console.log(msg)
                        //first we merge the two records in the database
                        let mergedUser = await mergeBackendlessData(userEmail, registeredUser) //we need to make sure which one is newer so we can merge them
                        console.log("1 User with email in ddbb:" + JSON.stringify(userEmail) + '\n')
                        console.log("2 User with DiscordId in ddbb" + JSON.stringify(registeredUser) + '\n')
                        console.log("Merged User: " + JSON.stringify(mergedUser) + '\n')
                        //now merge the result with the user we want to save (removedUser)
                        let removedmergedUser= removeEmpty(mergedUser)
                        let userMergedSecond= _.merge(removedmergedUser, removedUser)
                        console.log('User to save: ' + JSON.stringify(userMergedSecond) + '\n')

                        //result =  await deepSave(userMergedSecond )
                        result =  await Backendless.Data.of(backendlessUserTable!)
                        .deepSave<BackendlessPerson>( userMergedSecond )
                        .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + userToSave.Discord_Handle  +
                        ' with discordID: ' + userToSave.Discord_ID + ' in DDBB: \n' + msg, e.toString()))
                    }
                } else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                    let msg="2 Email Provided. Email exists in ddbb. DiscordID doesnt exist in ddbb: We UPDATE email ddbb with discordID"
                    console.log(msg)
                    removedUser.objectId =  userEmail.objectId
                   // result = await deepSave(removedUser)
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( removedUser )
                    .catch( e => writeDiscordLog(filename, functionName, 'Trying to update user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
                }
            } else { //email !exist in ddbb
                let msg='email doesnt exist in ddbb'
                console.log(msg)
                registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    console.log("3 Email Provided. Email doesnt exist in ddbb. DiscordID exists: We UPDATE record")
                    removedUser.objectId =  registeredUser.objectId
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( removedUser )
                    .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
                    //result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( removedUser )
                } else { //DiscordID !exist in ddbb: Create record
                    let msg = "4 Email Provided. Email doesnt exist in ddbb. DiscordID !exist: We CREATE record"
                    console.log(msg)
                    result =  await Backendless.Data.of(backendlessUserTable!)
                    .deepSave<BackendlessPerson>( removedUser )
                    .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
                    //result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( removedUser )
                }
            }
        }else{ //email not provided
            let registeredUser = await checkIfDiscordIDRegistered(user.Discord_ID)
            if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                let msg = "5 Email NOT provided. DiscordID exists: We UPDATE record"
                console.log(msg)
                removedUser.objectId =  registeredUser.objectId




/*
                result =  await Backendless.Data.of(backendlessUserTable!)
                .deepSave<BackendlessPerson>( removedUser )
                .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
                */

                userToSave = mergeUsersWithQuests(registeredUser, removedUser)
                result =  await Backendless.Data.of(backendlessUserTable!)
                .deepSave<BackendlessPerson>( userToSave )
                .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg , e.toString()))

                //result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( removedUser )
            } else { //DiscordID !exist in ddbb: Create record
                let msg ="6 Email NOT provided. DiscordID !exists: We CREATE record"
                console.log(msg)
                //result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( removedUser )
                result =  await Backendless.Data.of(backendlessUserTable!)
                .deepSave<BackendlessPerson>( removedUser )
                .catch( e => writeDiscordLog(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg , e.toString()))
            }
        }
    } catch (error) {
        throw error
    }
}



