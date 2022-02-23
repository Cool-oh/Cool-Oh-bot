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
exports.config = exports.getBackendlessLastTweet = void 0;
/*
 * This file checks the database every 15 min and
 * updates it if there's a new tweet form @cool_oh_nft
 */
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const backendless_1 = __importDefault(require("backendless"));
const channelNotificationsId = process.env.CHANNEL_NOTIFICATIONS;
const backendlessMaxNumObjects = Number(process.env.BACKENDLESS_MAX_NUM_OBJECTS);
const twitterID = process.env.TWITTER_ID;
const backendlessTwitterIdColumn = process.env.BACKENDLESS_TWITTER_ID_COLUMN;
const twitterMaxQuery = Number(process.env.TWITTER_MAX_QUERY);
const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE;
var totalNewTweetsSaved = 0;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.TWITTER_TOKEN_BEARER
    },
};
dotenv_1.default.config();
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
function saveAllTweetsToBackendless(twitterTimelineData) {
    return __awaiter(this, void 0, void 0, function* () {
        const res2 = [...twitterTimelineData.data.data];
        //Prepare array to be accepted by backendless
        const newArrayOfObj = res2.map(({ id: tweet_id, text: tweet_text, created_at: date_published }) => ({
            tweet_id, tweet_text, date_published
        }));
        if (newArrayOfObj.length > backendlessMaxNumObjects) {
            //Backendless only allow to store 100 items per bulkCreate command
            let slicedArray;
            let chunk = newArrayOfObj.length / backendlessMaxNumObjects;
            if ((newArrayOfObj.length % backendlessMaxNumObjects) > 0) {
                chunk = ~~(newArrayOfObj.length / backendlessMaxNumObjects) + 1;
            }
            console.log('Array length: ' + newArrayOfObj.length);
            console.log('Splitting the array in ' + chunk + ' chunks');
            let j = 0;
            let k = backendlessMaxNumObjects;
            for (let index = 0; index < chunk; index++) {
                slicedArray = newArrayOfObj.slice(j, k);
                j += backendlessMaxNumObjects;
                k += backendlessMaxNumObjects;
                console.log(' Chunk ' + index + '. Updating database with ' + slicedArray.length + ' new tweets...');
                totalNewTweetsSaved = slicedArray.length;
                //  await Backendless.Data.of( "Twitter_Cool_oh_NFT" ).bulkCreate( slicedArray )
                //This is much faster:
                backendless_1.default.Data.of(backendlessTable).bulkCreate(slicedArray)
                    .then(function (obj) {
                    console.log("object saved.");
                    totalNewTweetsSaved = 0;
                })
                    .catch(function (error) {
                    console.log("got error - " + error);
                });
            }
        }
        else {
            //If array is small enough to save directly into backendless
            console.log('Updating database with ' + newArrayOfObj.length + ' new tweets...');
            totalNewTweetsSaved = newArrayOfObj.length;
            backendless_1.default.Data.of(backendlessTable).bulkCreate(newArrayOfObj)
                .then(function (obj) {
                console.log("object saved.");
                totalNewTweetsSaved = 0;
            })
                .catch(function (error) {
                console.log("got error - " + error);
            });
        }
    });
}
function getAllTweets(twitterUserID, maxResults, since_id) {
    return __awaiter(this, void 0, void 0, function* () {
        //gets the last maxResults tweets timeline from a userid. Maxresults is max 100
        let uri = "";
        let tempUri = "";
        let tempTimelineData;
        let timelineData;
        let nextPaginationToken;
        if (maxResults > 100) {
            throw 'maxResults can not be over 100!!';
        }
        if (since_id) {
            uri = 'https://api.twitter.com/2/users/' + twitterUserID + '/tweets?max_results=' + maxResults + "&since_id=" + since_id + "&tweet.fields=created_at";
        }
        else {
            uri = 'https://api.twitter.com/2/users/' + twitterUserID + '/tweets?max_results=' + maxResults + "&tweet.fields=created_at";
        }
        tempTimelineData = yield axios_1.default.get(uri, headers);
        timelineData = tempTimelineData;
        nextPaginationToken = tempTimelineData.data.meta.next_token;
        if (nextPaginationToken != undefined) {
            //There's pagination and there are more tweets
            console.log(" There's pagination: " + nextPaginationToken);
            tempUri = uri + '&pagination_token=' + nextPaginationToken;
            let paginationID = 1;
            while (nextPaginationToken != undefined) {
                tempTimelineData = yield axios_1.default.get(tempUri, headers);
                tempUri = tempUri.replace(nextPaginationToken, tempTimelineData.data.meta.next_token);
                nextPaginationToken = tempTimelineData.data.meta.next_token;
                console.log(" Length: " + tempTimelineData.data.meta.result_count);
                for (let index = 0; index < tempTimelineData.data.meta.result_count; index++) {
                    timelineData.data.data.push(tempTimelineData.data.data[index]);
                }
                console.log(' Pagination ' + paginationID + ': ' + tempTimelineData.data.meta.next_token);
                paginationID++;
            }
        }
        else {
        }
        return timelineData;
    });
}
function getBackendlessLastTweet() {
    return __awaiter(this, void 0, void 0, function* () {
        //first get Last Tweet
        var queryBuilder = backendless_1.default.DataQueryBuilder.create();
        queryBuilder.setPageSize(1).setOffset(0).setSortBy(["date_published DESC"]);
        try {
            let result = yield backendless_1.default.Data.of(backendlessTable).find(queryBuilder);
            if (result[0] == undefined) {
                //database is empty!
                console.log('Database is empty!');
            }
            else {
                //Now try to see if that tweet was a thread and might have more tweets
                var whereClause = "date_published = '" + result[0].date_published + "'";
                queryBuilder = backendless_1.default.DataQueryBuilder.create().setWhereClause(whereClause);
                result = yield backendless_1.default.Data.of(backendlessTable).find(queryBuilder);
                if (result.length > 1) {
                    //console.log('Backendless last tweet is a thread of ' + result.length + ' tweets. Ordering them by id...' )
                    let sortedArray = sortByKey(result, backendlessTwitterIdColumn); // Sort the thread by tweetId
                    let lastTweetStored = sortedArray.at(-1); //get last item in the sorted array. It's the latest one.
                    return lastTweetStored;
                }
            }
            return result[0];
        }
        catch (error) {
            console.log(error);
            throw (error);
        }
    });
}
exports.getBackendlessLastTweet = getBackendlessLastTweet;
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function backendlessUpdateIfNeeded() {
    return __awaiter(this, void 0, void 0, function* () {
        let databaseLastTweet = yield getBackendlessLastTweet(); //if last tweets where part of a thread, it returns an array with the thread (all have the same timestamp)
        let twitterTimeline = yield getAllTweets(twitterID, twitterMaxQuery, databaseLastTweet === null || databaseLastTweet === void 0 ? void 0 : databaseLastTweet.tweet_id);
        if (twitterTimeline.data.meta.result_count == 0) {
            //database is up to date
            console.log('Database up to date');
        }
        else {
            //database needs to be updated
            console.log('Database NOT up to date');
            console.log('Saving new tweets after tweet ID: ' + (databaseLastTweet === null || databaseLastTweet === void 0 ? void 0 : databaseLastTweet.tweet_id) + ' ' + (databaseLastTweet === null || databaseLastTweet === void 0 ? void 0 : databaseLastTweet.tweet_text));
            saveAllTweetsToBackendless(twitterTimeline);
        }
    });
}
exports.default = (client) => __awaiter(void 0, void 0, void 0, function* () {
    function checkIfUpdateNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            yield backendlessUpdateIfNeeded();
            if (totalNewTweetsSaved != 0) {
                client.channels.cache.get(channelNotificationsId).send('Just updated the database with ' + totalNewTweetsSaved + ' Tweets...');
                console.log('Messaged Discord! New tweets saved: ' + totalNewTweetsSaved);
            }
            setTimeout(checkIfUpdateNeeded, 1000 * 60 * 15);
        });
    }
    checkIfUpdateNeeded();
});
exports.config = {
    dbName: 'WRITE_LAST_TWEETS',
    displayName: 'Write last Tweets to Database'
};
