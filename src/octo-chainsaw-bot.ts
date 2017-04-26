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
 
        this.initControllers(port);

        this._mittagService = new MittagService(mittagApiKey);

        this.initDefaultBehavior();
    }

    private initControllers(port) {
         this._controller.setupWebserver(port, (err,webserver)=> {
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
                bot.startRTM((err) => {
                    if (!err) {
                        this.trackBot(bot);
                    }

                    bot.startPrivateConversation({user: config.createdBy}, (err,convo) => {
                        if (err) {
                            console.log(err);
                        } else {
                            convo.say('I am a bot that has just joined your team');
                            convo.say('You must now /invite me to a channel so that I can be of use!');
                        }
                    });
                });
            }
        });

        this._controller.on('rtm_open', (bot) => {
            console.log("*** RTM api connected!");
        });

        this._controller.on("rtm_close", (bot) => {
            console.log("*** RTM api disconnected!");
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

