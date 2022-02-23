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
exports.udpateDiscordUser = exports.checkIfDiscordIDRegistered = exports.checkIfEmailRegistered = void 0;
const backendless_1 = __importDefault(require("backendless"));
const dotenv_1 = __importDefault(require("dotenv"));
const _ = require("lodash");
dotenv_1.default.config();
const backendlessUserTable = process.env.BACKENDLESS_USER_TABLE;
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
function checkIfEmailRegistered(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var whereClause = "email='" + email + "'";
        var queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
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
        var whereClause = "Discord_ID=" + discordUserId;
        var queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
        try {
            let result = yield backendless_1.default.Data.of(backendlessUserTable).find(queryBuilder);
            if (!result[0]) {
                console.log('User not found');
            }
            else {
                console.log('User found. Name: ' + result[0].First_Name);
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
            //user1LastDate = user1.created!
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
            userMerged = Object.assign(Object.assign({}, _.omitBy(user2, _.isNull)), _.omitBy(user1, _.isNull));
            // userMerged = {...user2, ...user1} //merge both users, if same property, user1 overwrites user2 becasue it's newer
            userToDelete = user2;
        }
        else { //we take ID2
            userMerged = Object.assign(Object.assign({}, _.omitBy(user1, _.isNull)), _.omitBy(user2, _.isNull)); //merge both users, if same property, user2 overwrites user1 becasue it's newer
            userToDelete = user1;
        }
        try {
            yield backendless_1.default.Data.of(backendlessUserTable).remove(userToDelete.objectId);
            userResult = yield backendless_1.default.Data.of(backendlessUserTable).save(userMerged);
            console.log("User with ID: " + userToDelete.objectId + 'deleted, and merged with user ID ' + userResult.objectId + ' which is newer.');
        }
        catch (error) {
            throw (error);
        }
        return userResult;
    });
}
function udpateDiscordUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        let userEmail;
        let registeredUser;
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
                            console.log("1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. But it's same reccord. We UPDATE it");
                            user.objectId = userEmail.objectId;
                            result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                        }
                        else { //is it a different record? DiscordID & Email are in different records. PROBLEM. We merge the data, assuming new data is better
                            console.log("1.1 Email Provided. Email exists in ddbb. DiscordID exists in ddbb. They are in different records. PROBLEM. We merge the data, assuming new data is better");
                            let mergedUser = yield mergeBackendlessData(userEmail, registeredUser);
                            console.log("1:" + JSON.stringify(userEmail));
                            console.log("2" + JSON.stringify(registeredUser));
                            console.log(mergedUser);
                        }
                    }
                    else { //DiscordID !exist in ddbb: we update email ddbb with discordId. WE OVERWRITE discordID! Assume new data is better
                        console.log("2 Email Provided. Email exists in ddbb. DiscordID !exist in ddbb: We UPDATE email ddbb with discordID");
                        user.objectId = userEmail.objectId;
                        result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                    }
                }
                else { //email !exist in ddbb
                    console.log('email doesnt exist in ddbb');
                    registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                    if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                        console.log("3 Email Provided. Email !exist in ddbb. DiscordID exists: We UPDATE record");
                        user.objectId = registeredUser.objectId;
                        result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                    }
                    else { //DiscordID !exist in ddbb: Create record
                        console.log("4 Email Provided. Email !exist in ddbb. DiscordID !exist: We CREATE record");
                        result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                    }
                }
            }
            else { //email not provided
                let registeredUser = yield checkIfDiscordIDRegistered(user.Discord_ID);
                if (registeredUser !== undefined) { //DiscordID exists in ddbb: Update record
                    console.log("5 Email !provided. DiscordID exists: We UPDATE record");
                    user.objectId = registeredUser.objectId;
                    result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                }
                else { //DiscordID !exist in ddbb: Create record
                    console.log("6 Email !provided. DiscordID !exists: We CREATE record");
                    result = yield backendless_1.default.Data.of(backendlessUserTable).save(user);
                }
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.udpateDiscordUser = udpateDiscordUser;
