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
exports.updateDiscordUser = exports.checkIfDiscordIDRegistered = exports.checkIfEmailRegistered = exports.isSubscribedToQuest = exports.getDiscordServerObjID = void 0;
const backendless_1 = __importDefault(require("backendless"));
const dotenv_1 = __importDefault(require("dotenv"));
const discordLogger_1 = require("../../features/discordLogger");
const _ = require("lodash");
const filename = 'userBackendless.ts';
dotenv_1.default.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
const backendlessDiscordServersTable = process.env.BACKENDLESS_DISCORDSERVERS_TABLE;
const backendlessRelationshipDepth = Number(process.env.BACKENDLESS_RELATIONSHIP_DEPTH);
try {
    backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
}
catch (error) {
    (0, discordLogger_1.writeDiscordLog)(filename, 'Backendless initialization', 'Trying to inoitialize Backendless: ', error.toString());
    throw error;
}
function getDiscordServerObjID(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = getDiscordServerObjID.name;
        let errMsg = 'Trying to get discord server ObjectID from server iD: ' + serverId + ' in DDBB';
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        let result;
        queryBuilder.setWhereClause('server_id = ' + serverId);
        try {
            result = yield backendless_1.default.Data.of(backendlessDiscordServersTable).find(queryBuilder)
                .catch(e => {
                (0, discordLogger_1.writeDiscordLog)(filename, functionName, errMsg, e.toString());
                return result;
            });
            if (result[0]) {
                return result[0].objectId;
            }
            else {
                return '';
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getDiscordServerObjID = getDiscordServerObjID;
function getObject(object, searchString) {
    var result;
    if (!object || typeof object !== 'object')
        return;
    Object.values(object).some(v => {
        if (v === searchString)
            return result = object;
        return result = getObject(v, searchString);
    });
    return result;
}
function isSubscribedToQuest(user, questName, discordServerID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isUserRegistered = yield checkIfDiscordIDRegistered(user.Discord_ID);
            if (isUserRegistered) { //user is registered
                if (isUserRegistered.Quests) { //the user has quests
                    if (isUserRegistered.Quests[questName]) { //If user is subscribed to the quest we are looking for
                        let resultFound = getObject(isUserRegistered.Quests[questName], discordServerID);
                        if (resultFound) {
                            return true;
                        }
                        else { //If user is not subscribed to the quest we are looking for
                            return false;
                        }
                    }
                }
                else { //the user is not doing any quest
                    return false;
                }
                return false;
            }
            else { //user not registered. We register it
                updateDiscordUser(user);
                return false;
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.isSubscribedToQuest = isSubscribedToQuest;
function getUserDeep(userID, relationsDepth) {
    return __awaiter(this, void 0, void 0, function* () {
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setRelationsDepth(relationsDepth);
        try {
            let result = yield backendless_1.default.Data.of(backendlessUserTable).findById(userID, queryBuilder);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
}
function checkIfEmailRegistered(email) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let functionName = checkIfEmailRegistered.name;
        let errMsg = 'Error checking if email ' + email + 'is registered in the DDBB';
        var whereClause = "email='" + email + "'";
        var queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
        queryBuilder.setRelationsDepth(3);
        try {
            result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder)
                .catch(e => {
                (0, discordLogger_1.writeDiscordLog)(filename, functionName, errMsg, e.toString());
                return result;
            });
            return result[0];
        }
        catch (error) {
            throw error;
        }
    });
}
exports.checkIfEmailRegistered = checkIfEmailRegistered;
function checkIfDiscordIDRegistered(discordUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = checkIfDiscordIDRegistered.name;
        let errMsg = 'Trying to find discord user ID: ' + discordUserId + ' in DDBB';
        let result;
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setRelationsDepth(backendlessRelationshipDepth);
        queryBuilder.setWhereClause("Discord_ID = '" + discordUserId + "'");
        try {
            result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder)
                .catch(e => {
                (0, discordLogger_1.writeDiscordLog)(filename, functionName, errMsg, e.toString());
                return result;
            });
            return result[0];
        }
        catch (error) {
            throw error;
        }
    });
}
exports.checkIfDiscordIDRegistered = checkIfDiscordIDRegistered;
function mergeBackendlessData(user1, user2) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Merging data...");
        console.log("ID1: " + user1.objectId);
        console.log("ID2: " + user2.objectId);
        let functionName = mergeBackendlessData.name;
        let removedUser1 = removeEmpty(user1);
        let removedUser2 = removeEmpty(user2);
        let userResult;
        let userMerged;
        let userToDelete;
        let user1LastDate;
        let user2LastDate = new Date();
        if (user1.updated) {
            console.log("ID1: updated \n");
            user1LastDate = new Date(user1.updated);
        }
        else {
            console.log("ID1: NOT updated \n");
            user1LastDate = new Date(user1.created);
        }
        if (user2.updated) {
            console.log("ID2: updated \n");
            user2LastDate = new Date(user2.updated);
        }
        else {
            console.log("ID2: NOT updated \n");
            user2LastDate = new Date(user2.created);
        }
        //sort them the two users by date
        if (user1LastDate > user2LastDate) { //We take ID1
            userMerged = mergeUsersWithQuests(removedUser2, removedUser1); //merge both users, if same property, user1 overwrites user2 becasue it's newer
            userToDelete = user2;
        }
        else { //we take ID2
            userMerged = mergeUsersWithQuests(removedUser1, removedUser2); //merge both users, if same property, user2 overwrites user1 becasue it's newer
            userToDelete = user1;
        }
        try {
            yield backendless_1.default.Data.of(backendlessUserTable).remove(userToDelete.objectId)
                .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying remove user with objectID: \n' + userToDelete.objectId + ' from DDBB\n', e.toString()));
            userResult = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(userMerged)
                .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to deep save a merged user: \n' + JSON.stringify(userMerged), e.toString()));
            console.log("User with ID: " + userToDelete.objectId + ' deleted, and merged with user ID ' + (userResult === null || userResult === void 0 ? void 0 : userResult.objectId) + ' which is newer.\n');
        }
        catch (error) {
            throw (error);
        }
        return userResult;
    });
}
function removeEmpty(obj) {
    let functionName = removeEmpty.name;
    try {
        var clean = Object.fromEntries(Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
            .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length)));
        return Array.isArray(obj) ? Object.values(clean) : clean;
    }
    catch (err) {
        (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to remove null propreties from object: ' + JSON.stringify(obj), err.toString());
    }
}
function mergeQuests(userDDBB, newUser, questName) {
    let userToSaveQuests = [];
    let arrayOfMerged = [];
    let userDDBB_hasQuests = false;
    let newUser_hasQuests = false;
    if (newUser.Quests !== undefined)
        newUser_hasQuests = true;
    if (userDDBB.Quests !== undefined)
        userDDBB_hasQuests = true;
    if (newUser_hasQuests && userDDBB_hasQuests) {
        for (let index = 0; index < newUser.Quests[questName].length; index++) {
            loop2: for (let index2 = 0; index2 < userDDBB.Quests[questName].length; index2++) {
                if (newUser.Quests[questName][index].Discord_Server.objectId === userDDBB.Quests[questName][index2].Discord_Server.objectId) {
                    //Both quests have the same ServerID, so we merge them
                    userToSaveQuests.push(_.merge(userDDBB.Quests[questName][index2], newUser.Quests[questName][index]));
                    arrayOfMerged.push(index2); //array of indexes that produced a merge
                    break loop2; //we exit this loop
                }
                if (index2 === (userDDBB.Quests[questName].length - 1)) { //at the end of loop
                    userToSaveQuests.push(newUser.Quests[questName][index]); //if we are at the end of the loop and no quests are the same, we push the newuser quest
                }
            }
        }
        for (let index3 = 0; index3 < userDDBB.Quests[questName].length; index3++) {
            if (!arrayOfMerged.includes(index3)) {
                userToSaveQuests.push(userDDBB.Quests[questName][index3]);
            }
        }
        return userToSaveQuests;
    }
    else {
        return userToSaveQuests;
    }
}
function mergeUsersWithQuests(userDDBB, newUser) {
    let functionName = mergeUsersWithQuests.name;
    let userDDBB_hasQuests = false;
    let newUser_hasQuests = false;
    let newUserHasWalletQuests = false;
    let newUserHasTwitterQuests = false;
    let userDDBBHasWalletQuests = false;
    let userDDBBHasTwitterQuests = false;
    let userQuestsObjId;
    let userMergedWithQuests = { Discord_ID: '' };
    let userToSaveFirstLevel;
    let userToSaveWalletQuest;
    let userToSaveTwitterQuest;
    let mergedWalletQuests = [];
    let mergedTwitterQuests = [];
    try {
        if (newUser.Quests != null) {
            newUser_hasQuests = true;
        }
        if (userDDBB.Quests != null) {
            userDDBB_hasQuests = true;
        }
        if (userDDBB_hasQuests && newUser_hasQuests) {
            let newUserFirstLevel = Object.assign({}, newUser);
            if (newUser.Quests.objectId != null) {
                userQuestsObjId = newUser.Quests.objectId;
            }
            else {
                userQuestsObjId = userDDBB.Quests.objectId;
            }
            delete newUserFirstLevel.Quests;
            let userDDBBFirstLevel = Object.assign({}, userDDBB);
            delete userDDBBFirstLevel.Quests;
            userToSaveFirstLevel = _.merge(userDDBBFirstLevel, newUserFirstLevel);
            if (newUser.Quests.Wallet_quests != null) {
                newUserHasWalletQuests = true;
            }
            if (newUser.Quests.Twitter_quests != null) {
                newUserHasTwitterQuests = true;
            }
            if (userDDBB.Quests.Wallet_quests != null) {
                userDDBBHasWalletQuests = true;
            }
            if (userDDBB.Quests.Twitter_quests != null) {
                userDDBBHasTwitterQuests = true;
            }
            if (userDDBBHasWalletQuests && newUserHasWalletQuests) {
                mergedWalletQuests = mergeQuests(userDDBB, newUser, 'Wallet_quests');
            }
            if (userDDBBHasTwitterQuests && newUserHasTwitterQuests) {
                mergedTwitterQuests = mergeQuests(userDDBB, newUser, 'Twitter_quests');
            }
            if (!userDDBBHasWalletQuests && newUserHasWalletQuests) {
                for (let index = 0; index < newUser.Quests.Wallet_quests.length; index++) {
                    mergedWalletQuests.push(newUser.Quests.Wallet_quests[index]);
                }
            }
            if (userDDBBHasWalletQuests && !newUserHasWalletQuests) {
                for (let index = 0; index < userDDBB.Quests.Wallet_quests.length; index++) {
                    mergedWalletQuests.push(userDDBB.Quests.Wallet_quests[index]);
                }
            }
            if (!userDDBBHasTwitterQuests && newUserHasTwitterQuests) {
                for (let index = 0; index < newUser.Quests.Twitter_quests.length; index++) {
                    mergedTwitterQuests.push(newUser.Quests.Twitter_quests[index]);
                }
            }
            if (userDDBBHasTwitterQuests && !newUserHasTwitterQuests) {
                for (let index = 0; index < userDDBB.Quests.Twitter_quests.length; index++) {
                    mergedTwitterQuests.push(userDDBB.Quests.Twitter_quests[index]);
                }
            }
            userToSaveWalletQuest = {
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': { 'objectId': userQuestsObjId, 'Wallet_quests': mergedWalletQuests }
            };
            userToSaveTwitterQuest = {
                'Discord_ID': userToSaveFirstLevel.Discord_ID,
                'Quests': { 'objectId': userQuestsObjId, 'Twitter_quests': mergedTwitterQuests }
            };
            userMergedWithQuests = _.merge(userToSaveFirstLevel, userToSaveWalletQuest, userToSaveTwitterQuest);
            return userMergedWithQuests;
        }
        if ((!userDDBB_hasQuests && newUser_hasQuests) || (!userDDBB_hasQuests && !newUser_hasQuests)) {
            return userMergedWithQuests = _.merge(userDDBB, newUser);
        }
        if (userDDBB_hasQuests && !newUser_hasQuests) {
            userMergedWithQuests = _.merge(userDDBB, newUser); //we merge both, but lose the quests
            userMergedWithQuests.Quests = userDDBB.Quests; //we restore the quests
            return userMergedWithQuests;
        }
    }
    catch (err) {
        (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to merge user1:  \n' + JSON.stringify(userDDBB) + ' \n \nand user2: \n' + JSON.stringify(newUser), err.toString());
        console.log(err);
    }
    return userMergedWithQuests;
}
function updateDiscordUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let functionName = updateDiscordUser.name;
        let result;
        let userEmail;
        let registeredUser;
        let userToSave;
        let removedUser = removeEmpty(user);
        try {
            if (!user.Discord_ID) {
                throw new Error("Unexpected error: Missing User DiscordID");
            }
            if (user.email) { //email provided
                userEmail = yield checkIfEmailRegistered(user.email);
                if (userEmail !== undefined) { //if email exists in ddbb
                    registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                    if (registeredUser !== undefined) { //DiscordID exists in db: Problem. We update with the new data. Assume new data is better
                        console.log("1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb.");
                        if (userEmail.objectId == registeredUser.objectId) { //is it the same record? DiscordID & Email are in the same record
                            let msg = "1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same record. We UPDATE it";
                            console.log(msg);
                            removedUser.objectId = userEmail.objectId;
                            let removedUserEmail = removeEmpty(userEmail);
                            userToSave = mergeUsersWithQuests(removedUserEmail, removedUser);
                            result = yield backendless_1.default.Data.of(backendlessUserTable)
                                .deepSave(userToSave)
                                .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to save user ' + userToSave.Discord_Handle +
                                ' with discordID: ' + userToSave.Discord_ID + ' in DDBB: \n' + msg, e.toString()));
                        }
                        else { //is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                            let msg = "1.2 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better";
                            console.log(msg);
                            //first we merge the two records in the database
                            let removedUserEmail = removeEmpty(userEmail);
                            let removedRegisteredUser = removeEmpty(registeredUser);
                            let mergedUser = yield mergeBackendlessData(removedUserEmail, removedRegisteredUser); //we need to make sure which one is newer so we can merge them
                            //now merge the result with the user we want to save (removedUser)
                            let removedmergedUser = removeEmpty(mergedUser);
                            let userMergedSecond = mergeUsersWithQuests(removedmergedUser, removedUser);
                            result = yield backendless_1.default.Data.of(backendlessUserTable)
                                .deepSave(userMergedSecond)
                                .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to save user ' + JSON.stringify(userMergedSecond) + ' in DDBB: \n' + msg, e.toString()));
                        }
                    }
                    else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                        let msg = "2 Email Provided. Email exists in ddbb. DiscordID doesnt exist in ddbb: We UPDATE email ddbb with discordID.";
                        console.log(msg);
                        removedUser.objectId = userEmail.objectId;
                        let removedUserEmail = removeEmpty(userEmail);
                        userToSave = mergeUsersWithQuests(removedUserEmail, removedUser);
                        result = yield backendless_1.default.Data.of(backendlessUserTable)
                            .deepSave(userToSave)
                            .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg + ' Trying to update user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg, e.toString()));
                    }
                }
                else { //email !exist in ddbb
                    let msg = 'email doesnt exist in ddbb';
                    console.log(msg);
                    registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                    if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                        let msg = "3 Email Provided. Email doesnt exist in ddbb. DiscordID exists: We UPDATE record.";
                        console.log(msg);
                        removedUser.objectId = registeredUser.objectId;
                        userToSave = mergeUsersWithQuests(registeredUser, removedUser);
                        result = yield backendless_1.default.Data.of(backendlessUserTable)
                            .deepSave(userToSave)
                            .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg + ' Trying to save user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg, e.toString()));
                    }
                    else { //DiscordID !exist in ddbb: Create record
                        let msg = "4 Email Provided. Email doesnt exist in ddbb. DiscordID !exist: We CREATE record.";
                        console.log(msg);
                        result = yield backendless_1.default.Data.of(backendlessUserTable)
                            .deepSave(removedUser)
                            .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, msg + ' Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg, e.toString()));
                    }
                }
            }
            else { //email not provided
                let registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    let msg = "5 Email NOT provided. DiscordID exists: We UPDATE record";
                    console.log(msg);
                    removedUser.objectId = registeredUser.objectId;
                    userToSave = mergeUsersWithQuests(registeredUser, removedUser);
                    result = yield backendless_1.default.Data.of(backendlessUserTable)
                        .deepSave(userToSave)
                        .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to save user ' + JSON.stringify(userToSave) + ' in DDBB: \n' + msg, e.toString()));
                    //result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( removedUser )
                }
                else { //DiscordID !exist in ddbb: Create record
                    let msg = "6 Email NOT provided. DiscordID !exists: We CREATE record";
                    console.log(msg);
                    result = yield backendless_1.default.Data.of(backendlessUserTable)
                        .deepSave(removedUser)
                        .catch(e => (0, discordLogger_1.writeDiscordLog)(filename, functionName, 'Trying to save user ' + JSON.stringify(removedUser) + ' in DDBB: \n' + msg, e.toString()));
                }
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.updateDiscordUser = updateDiscordUser;
