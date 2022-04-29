import { Modal } from "discord-modals";
import {ColorResolvable,Interaction,MessageButton,MessageEmbed,} from "discord.js";
import dotenv from "dotenv";
import { writeDiscordLog } from "../../features/discordLogger";
import {BackendlessPerson,Gamification,Gamifications,QuestEmbedJson,WalletQuestIntfc} from "../../interfaces/interfaces";
import { titleCase } from "../miscTools";
import {checkIfDiscordIDRegistered,	createBackendlessUser, getAllUserQuestsNames, getGamificationsData,	getUserGamification, isSubscribedToQuest2} from "../users/userBackendless";
import questInitJson from "./questInit.json";

export const usersFirstName = new Map()
export const usersLastName = new Map()
export const usersEmail = new Map()
export const usersSolanaAddress = new Map()
export const usersIsSubscribed = new Map()
export const usersLevel = new Map()
export const usersXP = new Map()
export const usersTokens = new Map()
export const usersTwitterHandle = new Map()


dotenv.config();
const walletQuestName = process.env.WALLET_QUEST_NAME;
const filename = "questInit.ts";
const questInitFields = questInitJson as QuestEmbedJson;
const menu = questInitFields.menu;
var interactionGlobal: Interaction;
var userGamificationsData: Gamifications | null;
var userXP: number = 0;
var userLevel: number = 0;
var userTokens: number = 0;
const modal = new Modal();
modal.setCustomId("");


async function  init(interaction: Interaction) {

	return await embedRedraw(interaction);
}

async function embedRedraw(interaction: Interaction):Promise <MessageEmbed> {
    let userId=interaction.user.id
    let questEmbed = new MessageEmbed()
	.setColor(questInitFields.color as ColorResolvable)
	.setTitle(questInitFields.title)
	.setURL(questInitFields.url)
	.setAuthor(questInitFields.author)
	.setDescription(questInitFields.description)
	.setThumbnail(questInitFields.thumbnail)
	.addFields(questInitFields.fields)
	.setImage(questInitFields.image)
	.setFooter(questInitFields.footer);
	let functionName = embedRedraw.name;
	let msg = "Trying to init the Quest";
	let userWalletQuest: WalletQuestIntfc | null;
	let discordServerID = interaction.guildId!;
	let solanaAddressText = "You didn't provide it yet"
	let userQuestsSubscribed = "You aren't doing any quest at the moment";
	const words = [
		"created",
		"___class",
		"ownerId",
		"updated",
		"objectId",
		"Index_quests",
	];

	let newUser:BackendlessPerson = {
	Discord_ID:interaction.user.id,
	Discord_Handle:interaction.user.username,
	Gamifications: [{
		Discord_Server: {
		server_id: interaction.guildId!,
		server_name: interaction.guild?.name
			}
		}]
	}

	try {
		let user = await checkIfDiscordIDRegistered(userId)
		if (user != null) {
			let userQuestsNames = getAllUserQuestsNames(user);
			if (userQuestsNames?.length !== 0 && userQuestsNames !== null) {
				if (userQuestsNames.length == 1) {
					userQuestsSubscribed =
						"You are subscribed to the following quest: \n";
				} else {
					userQuestsSubscribed =
						"You are subscribed to the following quests: \n";
				}
				for (let index = 0; index < userQuestsNames.length; index++) {
					if (!words.some((word) => userQuestsNames![index].includes(word))) {
						//If it doesnt include any of the words in variable words[]
						let tempString = userQuestsNames[index].replace(/_/g, " ");
						tempString = tempString.slice(0, -1);
						tempString = titleCase(tempString);
						userQuestsSubscribed += ".     " + tempString + "\n";
					}
				}
			}
			userWalletQuest = await isSubscribedToQuest2(user,walletQuestName!,discordServerID);

			if (userWalletQuest != null) {
				usersSolanaAddress.set(userId,userWalletQuest.solana_address!)
				solanaAddressText = userWalletQuest.solana_address!
			}
			if (user.Gamifications?.length !== 0) {
				userGamificationsData = await getGamificationsData(user, discordServerID);
				if (userGamificationsData != null) {
                    usersLevel.set(userId, userGamificationsData.Level!)
                    usersXP.set(userId, userGamificationsData.XP!)
                    usersTokens.set(userId, userGamificationsData.Tokens!)
				}
				questEmbed.setFields([]); //delete fields first
				questEmbed.addFields([
					questInitFields.fields[0],
					questInitFields.fields[1],
					{ name: "YOUR LEVEL", value: String(usersLevel.get(userId)), inline: false },
					{ name: "YOUR COOLS",value: String(usersTokens.get(userId)) + " $COOLs",inline: false},
					{ name: "YOUR EXP", value: String(usersXP.get(userId)) + " EXP", inline: false },
					{ name: "Your Quests", value: userQuestsSubscribed, inline: false },
					{ name: "YOUR SOLANA ADRESS", value: solanaAddressText, inline: false },
					questInitFields.fields[7],
					questInitFields.fields[8],
				])

			}else{ //If the user in the DDBB doesnt have a gamifications table
				//createBackendlessUser(newUser)
			}

            return questEmbed
		}else {

            createBackendlessUser(newUser)
            return questEmbed
        }

	} catch (err: any) {
		writeDiscordLog(filename, functionName, msg, err.toString());
		console.log(err);
        throw err
	}
}

function joinQuestButtonClicked(interaction: Interaction) {}
function modalSubmit(modal: any) {}

async function getGamificationData(): Promise<Gamification | null> {
	let result;
	let user: BackendlessPerson = {
		Discord_ID: interactionGlobal.user.id,
		Discord_Handle: interactionGlobal.user.username,
	};
	try {
		return (result = await getUserGamification(user));
	} catch (error) {
		throw error;
	}
}


export class QuestInit {
    public async init(interaction:Interaction){
        return await init (interaction)
    }

	public get menu() {
		return menu;
	}
	public joinQuestButtonClicked(interaction: Interaction) {
		joinQuestButtonClicked(interaction);
	}
	public get modal() {
		return modal;
	}
	public modalQuestSubmit(modal: any) {
		modalSubmit(modal);
	}

	public embedRedraw(interaction: Interaction) {
		return embedRedraw(interaction);
    }
    public drawButton(interaction: Interaction){
        let dummyButton = new MessageButton()
        return dummyButton
    }
    public  get joinQuestButtonLabel():string{
        return ''
    }
    public get modalCustomID():string{
        return ''
    }

}
