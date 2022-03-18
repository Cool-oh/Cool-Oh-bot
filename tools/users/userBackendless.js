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
exports.udpateDiscordUser = exports.checkIfDiscordIDRegistered = exports.checkIfEmailRegistered = exports.isSubscribedToQuest = exports.getAllUserQuests = void 0;
const backendless_1 = __importDefault(require("backendless"));
const dotenv_1 = __importDefault(require("dotenv"));
const _ = require("lodash");
dotenv_1.default.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
const backendlessRelationshipDepth = Number(process.env.BACKENDLESS_RELATIONSHIP_DEPTH);
try {
    backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
}
catch (error) {
    throw error;
}
function onQuickSearchChangeHandler(quickCriteria, objectArray) {
    let quickResult = objectArray.filter(obj => Object.values(obj).some(val => val ? val.toString().toLowerCase().includes(quickCriteria) : false));
    return quickResult;
}
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
function getAllUserQuests(user, discordServerID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isUserRegistered = yield checkIfDiscordIDRegistered(user.Discord_ID);
            if (isUserRegistered) { //user is registered
                if (isUserRegistered.Quests) { //the user has quests. We get all of them, but only the ones from the current discord server
                }
                else { //the user is not subscribed to any quest
                    return [];
                }
            }
            else { //user not registered. We register it
                let userToSave = {
                    Discord_ID: user.Discord_ID,
                    Discord_Handle: user.Discord_Handle
                };
                udpateDiscordUser(userToSave);
                return [];
            }
        }
        catch (error) {
        }
    });
}
exports.getAllUserQuests = getAllUserQuests;
function isSubscribedToQuest(user, questName, discordServerID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isUserRegistered = yield checkIfDiscordIDRegistered(user.Discord_ID);
            if (isUserRegistered) { //user is registered
                console.log('isUserRegistered ' + JSON.stringify(isUserRegistered));
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
                udpateDiscordUser(user);
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
        var whereClause = "email='" + email + "'";
        var queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
        queryBuilder.setRelationsDepth(3);
        try {
            let result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder);
            if (!result[0]) {
                console.log('User email not found');
            }
            else {
                console.log('User email found: ' + result[0].email);
            }
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
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setRelationsDepth(backendlessRelationshipDepth);
        queryBuilder.setWhereClause('Discord_ID = ' + discordUserId);
        try {
            let result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder);
            if (!result[0]) {
                console.log('User not found');
            }
            else {
                console.log('User found. Discord Handle: ' + result[0].Discord_Handle);
            }
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
        let removedUser1 = removeEmpty(user1);
        let removedUSer2 = removeEmpty(user2);
        let userResult;
        let userMerged;
        let userToDelete;
        let user1LastDate;
        let user2LastDate = new Date();
        if (user1.updated) {
            console.log("ID1: updated ");
            user1LastDate = new Date(user1.updated);
        }
        else {
            console.log("ID1: NOT updated ");
            user1LastDate = new Date(user1.created);
        }
        if (user2.updated) {
            console.log("ID2: updated ");
            user2LastDate = new Date(user2.updated);
        }
        else {
            console.log("ID2: NOT updated ");
            user2LastDate = new Date(user2.created);
        }
        //sort them the two users by date
        if (user1LastDate > user2LastDate) { //We take ID1
            userMerged = mergeUsersWithQuests(removedUSer2, removedUser1); //merge both users, if same property, user1 overwrites user2 becasue it's newer
            userToDelete = user2;
        }
        else { //we take ID2
            userMerged = mergeUsersWithQuests(removedUser1, removedUSer2); //merge both users, if same property, user2 overwrites user1 becasue it's newer
            userToDelete = user1;
        }
        try {
            yield backendless_1.default.Data.of(backendlessUserTable).remove(userToDelete.objectId);
            userResult = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(userMerged);
            console.log("User with ID: " + userToDelete.objectId + ' deleted, and merged with user ID ' + userResult.objectId + ' which is newer.');
        }
        catch (error) {
            throw (error);
        }
        return userResult;
    });
}
function removeEmpty(obj) {
    var clean = Object.fromEntries(Object.entries(obj)
        .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
        .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length)));
    return Array.isArray(obj) ? Object.values(clean) : clean;
}
function deepSave(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(user);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
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
            console.log('Index: ' + index);
            loop2: for (let index2 = 0; index2 < userDDBB.Quests[questName].length; index2++) {
                if (newUser.Quests[questName][index].Discord_Server.objectId === userDDBB.Quests[questName][index2].Discord_Server.objectId) {
                    //Both quests have the same ServerID, so we merge them
                    userToSaveQuests.push(_.merge(userDDBB.Quests[questName][index2], newUser.Quests[questName][index]));
                    arrayOfMerged.push(index2); //array of indexes that produced a merge
                    break loop2; //we exit this loop
                }
                if (index2 === (userDDBB.Quests[questName].length - 1)) { //at the end of loop
                    console.log('Pushing end of loop:' + '\n');
                    userToSaveQuests.push(newUser.Quests[questName][index]); //if we are at the end of the loop and no quests are the same, we push the newuser quest
                }
            }
        }
        for (let index3 = 0; index3 < userDDBB.Quests[questName].length; index3++) {
            if (!arrayOfMerged.includes(index3)) {
                console.log('Pushing remanent:' + '\n');
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
    let userDDBB_hasQuests = false;
    let newUser_hasQuests = false;
    let newUserHasWalletQuests = false;
    let newUserHasTwitterQuests = false;
    let userDDBBHasWalletQuests = false;
    let userDDBBHasTwitterQuests = false;
    let userMergedWithQuests = { Discord_ID: '' };
    let userToSaveFirstLevel;
    let userToSaveWalletQuest;
    let userToSaveTwitterQuest;
    let mergedWalletQuests = [];
    let mergedTwitterQuests = [];
    let newUserFirstLevel = Object.assign({}, newUser);
    delete newUserFirstLevel.Quests;
    let userDDBBFirstLevel = Object.assign({}, userDDBB);
    delete userDDBBFirstLevel.Quests;
    userToSaveFirstLevel = _.merge(userDDBBFirstLevel, newUserFirstLevel);
    if (newUser.Quests !== undefined)
        newUser_hasQuests = true;
    if (userDDBB.Quests !== undefined)
        userDDBB_hasQuests = true;
    if (newUser_hasQuests && userDDBB_hasQuests) {
        if (newUser.Quests.Wallet_quests !== undefined)
            newUserHasWalletQuests = true;
        if (newUser.Quests.Twitter_quests !== undefined)
            newUserHasTwitterQuests = true;
        if (userDDBB.Quests.Wallet_quests !== undefined)
            userDDBBHasWalletQuests = true;
        if (userDDBB.Quests.Twitter_quests !== undefined)
            userDDBBHasTwitterQuests = true;
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
        console.log('mergedWalletQuests: ' + JSON.stringify(mergedWalletQuests) + '\n');
        console.log('mergedTwitterQuests: ' + JSON.stringify(mergedTwitterQuests) + '\n');
        userToSaveWalletQuest = {
            'Discord_ID': userToSaveFirstLevel.Discord_ID,
            'Quests': { 'Wallet_quests': mergedWalletQuests }
        };
        userToSaveTwitterQuest = {
            'Discord_ID': userToSaveFirstLevel.Discord_ID,
            'Quests': { 'Twitter_quests': mergedTwitterQuests }
        };
        userMergedWithQuests = _.merge(userToSaveFirstLevel, userToSaveWalletQuest, userToSaveTwitterQuest);
        console.log('userMergedWithQuests FINAL: ' + JSON.stringify(userMergedWithQuests) + '\n');
        return userMergedWithQuests;
    }
    return userMergedWithQuests;
}
function udpateDiscordUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
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
                console.log('User provides email');
                userEmail = yield checkIfEmailRegistered(user.email);
                console.log('User email: ' + userEmail);
                if (userEmail !== undefined) { //if email exists in ddbb
                    registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                    if (registeredUser !== undefined) { //DiscordID exists in db: Problem. We update with the new data. Assume new data is better
                        console.log("1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb.");
                        if (userEmail.objectId == registeredUser.objectId) { //is it the same record? DiscordID & Email are in the same record
                            console.log("1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same record. We UPDATE it");
                            removedUser.objectId = userEmail.objectId;
                            let removedUserEmail = removeEmpty(userEmail);
                            //userToSave = _.merge(removedUserEmail, removedUser)
                            userToSave = mergeUsersWithQuests(removedUserEmail, removedUser);
                            result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(userToSave).catch(console.error);
                        }
                        else { //is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                            console.log("1.2 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better");
                            //first we merge the two records in the database
                            let mergedUser = yield mergeBackendlessData(userEmail, registeredUser); //we need to make sure which one is newer so we can merge them
                            console.log("1 User with email in ddbb:" + JSON.stringify(userEmail) + '\n');
                            console.log("2 User with DiscordId in ddbb" + JSON.stringify(registeredUser) + '\n');
                            console.log("Merged User: " + JSON.stringify(mergedUser) + '\n');
                            //now merge the result with the user we want to save (removedUser)
                            let removedmergedUser = removeEmpty(mergedUser);
                            let userMergedSecond = _.merge(removedmergedUser, removedUser);
                            console.log('User to save: ' + JSON.stringify(userMergedSecond) + '\n');
                            result = yield deepSave(userMergedSecond);
                        }
                    }
                    else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                        console.log("2 Email Provided. Email exists in ddbb. DiscordID !exist in ddbb: We UPDATE email ddbb with discordID");
                        removedUser.objectId = userEmail.objectId;
                        result = yield deepSave(removedUser);
                        // result =  await Backendless.Data.of( backendlessUserTable! ).deepSave<BackendlessPerson>( user )
                    }
                }
                else { //email !exist in ddbb
                    console.log('email doesnt exist in ddbb');
                    registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                    if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                        console.log("3 Email Provided. Email !exist in ddbb. DiscordID exists: We UPDATE record");
                        removedUser.objectId = registeredUser.objectId;
                        result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(removedUser);
                    }
                    else { //DiscordID !exist in ddbb: Create record
                        console.log("4 Email Provided. Email !exist in ddbb. DiscordID !exist: We CREATE record");
                        result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(removedUser);
                    }
                }
            }
            else { //email not provided
                let registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    console.log("5 Email !provided. DiscordID exists: We UPDATE record");
                    removedUser.objectId = registeredUser.objectId;
                    result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(removedUser);
                }
                else { //DiscordID !exist in ddbb: Create record
                    console.log("6 Email !provided. DiscordID !exists: We CREATE record");
                    result = yield backendless_1.default.Data.of(backendlessUserTable).deepSave(removedUser);
                }
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.udpateDiscordUser = udpateDiscordUser;
