import { MittagService } from './src/mittag-service';
import { OctoChainsawBot } from './src/octo-chainsaw-bot';
import { Container } from "aurelia-dependency-injection";
if (!process.env.slackClientId) {
    console.log("Error, no clientId specified!");
    process.exit(1);
}

if (!process.env.slackClientSecret) {
    console.log("Error, no clientSecret specified!");
    process.exit(1);
}

if (!process.env.mittagApiToken) {
    console.log("Error, no mittag-api token specified!");
    process.exit(1);
}

if (!process.env.port) {
    console.log("Error, no port specified!");
    process.exit(1);
}

console.log("Starting OctoChainsawBot...")

let container = Container.instance;

var bot = container.get(OctoChainsawBot);

bot.start();
