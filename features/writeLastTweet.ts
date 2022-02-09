/*
 * This file checks the database every 15 min and
 * updates it if there's a new tweet form @cool_oh_nft
 */
import axios from 'axios'
import { Client, TextChannel } from 'discord.js'
import dotenv from 'dotenv'
import Backendless from 'backendless'
import {Twitter_Cool_oh_NFT, TwitterTimelineData, Twitter_Cool_oh_NFT_To_Save} from '../interfaces/interfaces'

const channelNotificationsId = process.env.CHANNEL_NOTIFICATIONS
const backendlessMaxNumObjects = Number(process.env.BACKENDLESS_MAX_NUM_OBJECTS)
const twitterID = process.env.TWITTER_ID
const backendlessTwitterIdColumn = process.env.BACKENDLESS_TWITTER_ID_COLUMN
const twitterMaxQuery = Number(process.env.TWITTER_MAX_QUERY)
const backendlessTable = process.env.BACKENDLESS_TABLE
var totalNewTweetsSaved = 0
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + process.env.TWITTER_TOKEN_BEARER
    },
    }

dotenv.config();
Backendless.initApp(process.env.BACKENDLESS_APP_ID!, process.env.BACKENDLESS_API_KEY!);



 async function saveAllTweetsToBackendless(twitterTimelineData:TwitterTimelineData) {

    const res2  = [...twitterTimelineData.data.data]
    //Prepare array to be accepted by backendless
    const newArrayOfObj:Twitter_Cool_oh_NFT_To_Save[] = res2.map(({
        id: tweet_id,
        text: tweet_text,
        created_at: date_published
    }) => ({
         tweet_id,tweet_text,date_published
    }));


if(newArrayOfObj.length > backendlessMaxNumObjects){
    //Backendless only allow to store 100 items per bulkCreate command
    let slicedArray:Twitter_Cool_oh_NFT_To_Save[]
    let chunk = newArrayOfObj.length / backendlessMaxNumObjects
    if((newArrayOfObj.length % backendlessMaxNumObjects) > 0){
        chunk = ~~(newArrayOfObj.length/backendlessMaxNumObjects) + 1
        }
        console.log('Array length: ' + newArrayOfObj.length)
		console.log('Splitting the array in '+ chunk + ' chunks')
		let j = 0
		let k = backendlessMaxNumObjects
		for (let index = 0; index < chunk; index++) {

            slicedArray = newArrayOfObj.slice(j,k)
            j += backendlessMaxNumObjects
            k += backendlessMaxNumObjects
            console.log( ' Chunk ' + index +'. Updating database with ' + slicedArray.length + ' new tweets...')
            totalNewTweetsSaved = slicedArray.length
          //  await Backendless.Data.of( "Twitter_Cool_oh_NFT" ).bulkCreate( slicedArray )
          //This is much faster:
            Backendless.Data.of( backendlessTable! ).bulkCreate( slicedArray )
            .then( function ( obj )  {
            console.log( "object saved.")
            totalNewTweetsSaved = 0
                } )
            .catch( function( error ) {
                 console.log( "got error - " + error )
             })

            }
	}else{
        //If array is small enough to save directly into backendless
        console.log( 'Updating database with ' + newArrayOfObj.length + ' new tweets...')
        totalNewTweetsSaved = newArrayOfObj.length
        Backendless.Data.of( backendlessTable! ).bulkCreate( newArrayOfObj )
        .then( function ( obj )  {
            console.log( "object saved.")
            totalNewTweetsSaved = 0
            } )
        .catch( function( error ) {
            console.log( "got error - " + error )
            })
        }
}


async function getAllTweets(twitterUserID: string, maxResults: number, since_id?:string): Promise<TwitterTimelineData> {
    //gets the last maxResults tweets timeline from a userid. Maxresults is max 100

    let uri = ""
    let tempUri= ""
    let tempTimelineData: TwitterTimelineData
    let timelineData
    let nextPaginationToken

    if(maxResults > 100){
        throw 'maxResults can not be over 100!!'
    }
    if(since_id){
         uri = 'https://api.twitter.com/2/users/' + twitterUserID + '/tweets?max_results=' + maxResults + "&since_id="+ since_id +"&tweet.fields=created_at"
    }else{
         uri = 'https://api.twitter.com/2/users/' + twitterUserID + '/tweets?max_results=' + maxResults + "&tweet.fields=created_at"
    }

    tempTimelineData = await axios.get(uri, headers)
    timelineData = tempTimelineData
    nextPaginationToken = tempTimelineData.data.meta.next_token
    

    if (nextPaginationToken != undefined) {
        //There's pagination and there are more tweets
        console.log(" There's pagination: " + nextPaginationToken)
        tempUri = uri +'&pagination_token=' + nextPaginationToken
        let paginationID = 1
        while (nextPaginationToken != undefined) {

            tempTimelineData = await axios.get(tempUri, headers)
            tempUri = tempUri.replace(nextPaginationToken, tempTimelineData.data.meta.next_token);
            nextPaginationToken = tempTimelineData.data.meta.next_token
            console.log(" Length: " + tempTimelineData.data.meta.result_count)

            for (let index = 0; index < tempTimelineData.data.meta.result_count; index++) {
                timelineData.data.data.push(tempTimelineData.data.data[index]);

            }
            console.log(' Pagination ' + paginationID + ': ' + tempTimelineData.data.meta.next_token)
            paginationID ++
        }

    } else {

    }

    return timelineData
}

async function getBackendlessLastTweet() : Promise <Twitter_Cool_oh_NFT>{

    //first get Last Tweet
    var queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.setPageSize( 1 ).setOffset( 0 ).setSortBy( ["date_published DESC" ] );

    let result =  await Backendless.Data.of( backendlessTable! ).find<Twitter_Cool_oh_NFT>( queryBuilder )

    if (result[0] == undefined) {
        //database is empty!
        console.log('Database is empty!')
    }else{
        //Now try to see if that tweet was a thread and might have more tweets
        var whereClause = "date_published = '" + result[0].date_published + "'";
        queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause( whereClause );

        result =  await Backendless.Data.of( backendlessTable! ).find<Twitter_Cool_oh_NFT>( queryBuilder )
        if(result.length > 1)
        {
            //console.log('Backendless last tweet is a thread of ' + result.length + ' tweets. Ordering them by id...' )
            let sortedArray = sortByKey(result, backendlessTwitterIdColumn!) // Sort the thread by tweetId
            let lastTweetStored = sortedArray.at(-1) //get last item in the sorted array. It's the latest one.
            return lastTweetStored
        }
    }

    return result[0]
}


function sortByKey(array:any, key:string) {
    return array.sort(function(a:any, b:any) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


async function backendlessUpdateIfNeeded(){

    let databaseLastTweet = await getBackendlessLastTweet(); //if last tweets where part of a thread, it returns an array with the thread (all have the same timestamp)

    let twitterTimeline = await getAllTweets(twitterID!, twitterMaxQuery, databaseLastTweet?.tweet_id )

    if(twitterTimeline.data.meta.result_count == 0){
        //database is up to date
        console.log('Database up to date')

    }else{
        //database needs to be updated
        console.log('Database NOT up to date')
        console.log('Saving new tweets after tweet ID: ' + databaseLastTweet?.tweet_id + ' ' + databaseLastTweet?.tweet_text)
        saveAllTweetsToBackendless(twitterTimeline)
    }
}




export default async (client: Client) => {

    async function checkIfUpdateNeeded() {
        await backendlessUpdateIfNeeded()

         if(totalNewTweetsSaved !=0 ) {
            (client.channels.cache.get(channelNotificationsId!) as TextChannel ).send('Just updated the database with ' + totalNewTweetsSaved + ' Tweets...')
            console.log('Messaged Discord! New tweets saved: ' + totalNewTweetsSaved)
        }
         setTimeout(checkIfUpdateNeeded, 1000 * 60 * 15)
    }

    checkIfUpdateNeeded()

}

export const config = {
    dbName: 'WRITE_LAST_TWEETS',
    displayName: 'Write last Tweets to Database'
}