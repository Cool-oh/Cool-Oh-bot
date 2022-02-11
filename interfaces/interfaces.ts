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