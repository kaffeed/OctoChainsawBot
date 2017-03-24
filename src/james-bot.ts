import { MittagApiResult, MittagService } from './mittag-service';

var Botkit = require("botkit");

export class JamesBot {
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
            debug: true,
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

        // this.controller.spawn({
        //     token: slackApiToken
        // }).startRTM();

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
        this._controller.on('interactive_message_callback', function(bot, message) {
            var ids = message.callback_id.split(/\-/);
            var user_id = ids[0];
            var item_id = ids[1];

            this._controller.storage.users.get(user_id, function(err, user) {

                if (!user) {
                    user = {
                        id: user_id,
                        list: []
                    }
                }

                for (var x = 0; x < user.list.length; x++) {
                    if (user.list[x].id == item_id) {
                        if (message.actions[0].value=='flag') {
                            user.list[x].flagged = !user.list[x].flagged;
                        }
                        if (message.actions[0].value=='delete') {
                            user.list.splice(x,1);
                        }
                    }
                }


                var reply = {
                    text: 'Here is <@' + user_id + '>s list:',
                    attachments: [],
                }

                for (var x = 0; x < user.list.length; x++) {
                    reply.attachments.push({
                        title: user.list[x].text + (user.list[x].flagged? ' *FLAGGED*' : ''),
                        callback_id: user_id + '-' + user.list[x].id,
                        attachment_type: 'default',
                        actions: [
                            {
                                "name":"flag",
                                "text": ":waving_black_flag: Flag",
                                "value": "flag",
                                "type": "button",
                            },
                            {
                            "text": "Delete",
                                "name": "delete",
                                "value": "delete",
                                "style": "danger",
                                "type": "button",
                                "confirm": {
                                "title": "Are you sure?",
                                "text": "This will do something!",
                                "ok_text": "Yes",
                                "dismiss_text": "No"
                                }
                            }
                        ]
                    })
                }

                bot.replyInteractive(message, reply);
                this.contr
                this._controller.storage.users.save(user);


            });

        });

        this._controller.hears('interactive', 'direct_message', function(bot, message) {
            bot.reply(message, {
                attachments:[
                    {
                        title: 'Do you want to interact with my buttons?',
                        callback_id: '123',
                        attachment_type: 'default',
                        actions: [
                            {
                                "name":"yes",
                                "text": "Yes",
                                "value": "yes",
                                "type": "button",
                            },
                            {
                                "name":"no",
                                "text": "No",
                                "value": "no",
                                "type": "button",
                            }
                        ]
                    }
                ]
            });
        });

        this._controller.hears(['list','tasks'],'direct_mention,direct_message',function(bot,message) {
            this._controller.storage.users.get(message.user, function(err, user) {
                if (!user) {
                    user = {
                        id: message.user,
                        list: []
                    }
                }

                if (!user.list || !user.list.length) {
                    user.list = [
                        {
                            'id': 1,
                            'text': 'Test Item 1'
                        },
                        {
                            'id': 2,
                            'text': 'Test Item 2'
                        },
                        {
                            'id': 3,
                            'text': 'Test Item 3'
                        }
                    ]
                }

                var reply = {
                    text: 'Here is your list. Say `add <item>` to add items.',
                    attachments: [],
                }

                for (var x = 0; x < user.list.length; x++) {
                    reply.attachments.push({
                        title: user.list[x].text + (user.list[x].flagged? ' *FLAGGED*' : ''),
                        callback_id: message.user + '-' + user.list[x].id,
                        attachment_type: 'default',
                        actions: [
                            {
                                "name":"flag",
                                "text": ":waving_black_flag: Flag",
                                "value": "flag",
                                "type": "button",
                            },
                            {
                            "text": "Delete",
                                "name": "delete",
                                "value": "delete",
                                "style": "danger",
                                "type": "button",
                                "confirm": {
                                "title": "Are you sure?",
                                "text": "This will do something!",
                                "ok_text": "Yes",
                                "dismiss_text": "No"
                                }
                            }
                        ]
                    })
                }

                bot.reply(message, reply);

                this._controller.storage.users.save(user);
            });

        });



    }
}

