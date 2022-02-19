import { ColorResolvable, MessageButtonStyleResolvable } from "discord.js";

export interface TwitterUser {
    twitterId: number
}

export interface Twitter_Cool_oh_NFT {
    ddbb_name: "Twitter_Cool_oh_NFT"
    objectId: string,
    tweet_id: string,
    tweet_text: string
    date_published: Date
    created: Date
}

export interface Twitter_Cool_oh_NFT_To_Save {
    tweet_id: string,
    tweet_text: string
    date_published: Date
}
export interface Twitt {

    tweet_id: string,
    tweet_text: string
}


export interface TwitterTimelineData {
    status: string,
    statusText: string,
    headers: string,
    config: string,
    request: string,
    data: {
        data: [{
            id: string,
            text: string,
            created_at: Date
    }],

        meta:{
            oldest_id: string,
            newest_id: string,
            result_count: number,
            next_token: string
            }
    }
}

export interface DatabaseCount {
    count: number,
    class: string
}

export interface BackendlessPerson {
    ddbb_name?: string
    objectId?: string,
    email?: string,
    First_Name?: string,
    Last_Name?: string,
    Discord_Handle?: string,
    Discord_ID?: number,
    Twitter_Handle?: string,
    Twitter_ID?: number,
    created?: Date,
    updated?: Date
}

export interface QuestEmbedJson{
    color: ColorResolvable,
    title: string,
    url: string,
    author: {
        name: string,
        iconURL: string,
        url: string
    },
    description: string,
    thumbnail: string,
    fields: [
        { name: string, value: string,  inline: boolean},],
        image: string,
    footer: {
        text:string ,
        image:string
    },
    button: {
        customId: string,
        emoji: string,
        label: string,
        style: MessageButtonStyleResolvable
    },
    menu: {
        label: string,
        value: string
    }
}