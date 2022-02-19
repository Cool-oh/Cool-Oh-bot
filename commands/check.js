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
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const backendless_1 = __importDefault(require("backendless"));
const writeLastTweet_1 = require("../features/writeLastTweet");
dotenv_1.default.config();
const backendlessTable = process.env.BACKENDLESS_TWITTER_TABLE;
const iconDatabaseStats = process.env.ICON_DATABASE_STATS;
var actionTakenContent = '';
backendless_1.default.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_API_KEY);
function getDatabaseTweetCount() {
    return __awaiter(this, void 0, void 0, function* () {
        var dataQueryBuilder = backendless_1.default.DataQueryBuilder.create().setProperties("Count(objectId)");
        let result = yield backendless_1.default.Data.of(backendlessTable).find(dataQueryBuilder);
        return result[0].count;
    });
}
exports.default = {
    category: 'ManagementTools',
    description: 'Checks different backend things.',
    slash: true,
    testOnly: true,
    guildOnly: true,
    permissions: ['ADMINISTRATOR'],
    callback: ({ interaction: msgInt, channel, interaction }) => __awaiter(void 0, void 0, void 0, function* () {
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId('Database_Stats') //our own name for our button in our code to detect which button the user clicked on
            .setEmoji('📊') //CTRL+i :emojisense:
            .setLabel('Get Database Stats')
            .setStyle('PRIMARY'));
        yield msgInt.reply({
            content: 'Please select what you want me to do',
            components: [row],
            ephemeral: true // Only user who invokes the command can see the result
        });
        //Filter to ensure that the user who is clicking the button is the sae who sent the command
        //(that is, if ephemeral is set to false)
        const filter = (btnInt) => {
            return msgInt.user.id === btnInt.user.id;
        };
        const collector = channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 1000 * 15,
        });
        collector.on('end', (collection) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            //b) when the user clicks on the max number of buttons defined by collector
            collection.forEach((click) => {
                //console.log(click.user.id, click.customId) //customId is the name of the button we specified up in the code
            });
            if (((_a = collection.first()) === null || _a === void 0 ? void 0 : _a.customId) === 'Database_Stats') {
                actionTakenContent = 'Reporting last database stats!';
                let databaseTweetCount = yield getDatabaseTweetCount();
                let lastTweetSaved = yield (0, writeLastTweet_1.getBackendlessLastTweet)();
                const date = new Date(lastTweetSaved.created);
                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                var embed = new discord_js_1.MessageEmbed()
                    .setTitle("Database statistics")
                    .setColor("RED")
                    .setAuthor({
                    name: 'Cool-oh bot',
                    iconURL: iconDatabaseStats,
                    url: 'https://cool-oh.com'
                })
                    .addField('No. of Tweets', databaseTweetCount.toString())
                    .addField('Last tweet saved', (yield lastTweetSaved).tweet_text)
                    .addField('Saved to database  on', date.toLocaleDateString("en-US", options));
                //Send the results
                interaction.followUp({
                    embeds: [embed],
                    ephemeral: true
                });
            }
            yield msgInt.editReply({
                content: actionTakenContent,
                components: [] //Array we passed with all the buttons
            });
        }));
    }),
};
