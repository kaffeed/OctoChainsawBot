# OctoChainsaw

![Octo Chainsaw Logo](img/a_o_c.gif)

OctoChainsaw is a helper bot built on [botkit] (https://github.com/howdyai/botkit) for slack, built in typescript.

In order to start OctoChainsaw, simply clone it and install it's dependencies via 
`npm install`

Afterwards, compile the bot via `tsc` start the bot by running 

`slackClientId=<yourSlackClientId> slackClientSecret=<yourSlackClientSecret> port=<port> mittagApiToken=<mittagApiToken> node build/index.js`

As of now, OctoChainsaws capabilities approach nearly zero. 
It only has an api wrapper for http://mittag.at - kudos to them - and can display daily menus of my favorite restaurants around my work. 
This might change in the near future - hopefully it does.

