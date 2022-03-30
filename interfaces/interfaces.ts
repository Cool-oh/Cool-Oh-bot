import { ColorResolvable, MessageButtonStyleResolvable, Snowflake } from "discord.js";
import dotenv from 'dotenv'
dotenv.config();

export interface Gamification{
    ddbb_name?: "Gamification_Xibstar_Test"
    objectId?: string,
    level?: number,
    XP?: number,
    date_published?: Date
    created?: Date,
    tokens?:number
}
export interface Gamifications{
    ddbb_name?: "Gamifications_Test"
    objectId?: string,
    level?: number,
    XP?: number,
    date_published?: Date
    created?: Date,
    tokens?:number,
    Discord_Server:DiscordServer
}

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
export interface DiscordServer {
    objectId?: string,
    created?: Date,
    ownerId?: string,
    server_id?: string,
    server_name?: string,
    updated?: Date,
    token_type?:string
}



export interface AllQuests {
    Discord_Server: DiscordServer
    created?: Date,
    objectId?: string,
    ownerId?: string,
    updated?: Date,
    no_interactions?:number
}

interface IndexQuest extends AllQuests{
    Level?:number,
    XP?: number,
    total_coins_earned?: number,

}
export interface IndexQuests extends Array<IndexQuest>{}

export interface WalletQuestIntfc extends AllQuests{

    solana_address?: string,
}


export interface WalletQuests extends Array<WalletQuestIntfc>{}

interface TwitterQuest extends AllQuests{

    twitter_handle: string,
    twitter_id: string,

}
export interface TwitterQuests extends Array<TwitterQuest>{}

export interface Quests {
    created?: Date,
    objectId?: string,
    ownerId?: string,
    updated?: Date,
    Index_quests?:IndexQuests
    Wallet_quests?:WalletQuests,
    Twitter_quests?: TwitterQuests,
    [key: string]: any
}

export interface BackendlessPerson {
    ddbb_name?: string,
    objectId?: string,
    email?: string,
    First_Name?: string,
    Last_Name?: string,
    Discord_Handle?: string,
    Discord_ID: Snowflake,
    Twitter_Handle?: string,
    Twitter_ID?: number,
    created?: Date,
    updated?: Date
    Quests?: Quests
    Gamification?:Gamification,
    Gamifications?:Gamifications[]
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
    fields:
        { name: string, value: string,  inline: boolean}[],
    image: string,
    footer: {
        text:string ,
        image:string
    },
    button: {
        customId: string,
        emoji: string,
        label: string,
        label_edit:string
        style: MessageButtonStyleResolvable
    },
    menu: {
        label: string,
        value: string,
        description: string
    },
    modal: {
        id: string,
        title: string,
        componentsList:
            {
            id: string,
            label: string,
            style: string,
            minLenght: number,
            maxLength: number,
            placeholder: string,
            required: boolean,
        }[]
    }
}