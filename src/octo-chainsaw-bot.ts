import { FormatUtility } from './format-utility';
import { IReadOnlyService } from './interfaces/services';
import { MittagService } from './mittag-service';
import { Menu, MittagApiResult } from './interfaces/mittag-api-result';
var Botkit = require("botkit");
var fs = require('fs');

export class OctoChainsawBot {
    private _controller: any;
    private _mittagService: MittagService;
    private _menus: MittagApiResult;
    private _today: Date;
    private _bots: {} = {};
    private _port: string;

    private trackBot(bot) {
        this._bots[bot.config.token] = bot;
    }

    constructor(slackClientId: string, slackClientSecret: string, port: string, mittagApiKey: string) {
        this._controller = Botkit.slackbot({
            debug: false,
            json_file_store: './bot_data/',
            interactive_replies: true
        });

        this._controller.configureSlackApp({
            clientId: slackClientId,
            clientSecret: slackClientSecret,
            scopes: ['bot']
        });

        this._port = port;

        this.initDefaultBehavior();
        this._mittagService = new MittagService(mittagApiKey);
    }

    public start() {
        this.initControllers();
    }

    private initControllers() {
         this._controller.setupWebserver(this._port, (err,webserver)=> {
            this._controller.createWebhookEndpoints(this._controller.webserver);

            this._controller.createOauthEndpoints(this._controller.webserver, (err,req,res) => {
                if (err) {
                    res.status(500).send("ERROR: " + err);
                } else {
                    res.send("Success!");
                }
            })
        });

        this._controller.on('create_bot', (bot,config) => {
            console.log(this._bots);

            if (this._bots[bot.config.token]) {
                //do nothing
            } else {
                bot.startRTM(function(err,bot,payload) {
                    if (err) {
                        console.log('*** Failed to start RTM')
                    }
                    console.log("*** RTM started!");
                });
            }
        });

        this._controller.on('rtm_open', (bot) => {
            console.log("*** RTM api connected!");
        });

        this._controller.on("rtm_close", (bot) => {
            console.log("*** RTM api disconnected!");
            console.log("*** Trying to reconnect bot!");
        });

        this._controller.on(["direct_message","mention","direct_mention"], (bot,message) => {
            bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'robot_face',
            },function(err) {
                if (err) { console.log(err) }
                bot.reply(message,'I heard you loud and clear boss.');
            });
        });

        this._controller.storage.teams.all(function(err,teams) {
            if (err) {
                throw new Error(err);
            }

            // connect all teams with bots up to slack!
            for (var t in teams) {
                if (teams[t].bot) {
                    teams[t].retry = Infinity;
                    this._controller.spawn(teams[t]).startRTM(function(err, bot) {
                        if (err) {
                            console.log('Error connecting bot to Slack:',err);
                        } else {
                            this.trackBot(bot);
                        }
                    });
                }
            }
        });
    }

    private initDefaultBehavior() {
        this._controller.hears(["menus", "menu", "essen", "hunger"], "direct_message,direct_mention", (bot, message) => {
            var reply = {
                text: "Here are the menus for the default restaurants for " + new FormatUtility().FormatDate(new Date()),
                attachments: []
            }

            this._mittagService.fetchDefaults().then(x => {
                console.log(x);
                x.forEach(element => {
                    reply.attachments.push({
                        fallback: element.restaurant.name + "\n" + element.menu,
                        title: element.restaurant.name,
                        title_link: element.restaurant.url,
                        color: "good",
                        text: element.menu,
                        attachment_type: "default"
                    });
                });
                bot.reply(message, reply);
                bot.reply(message, { text: "powered by *www.mittag.at*" });
            })
        });
    }
}

