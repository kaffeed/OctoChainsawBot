
export class OctoChainsawSettings {
    public mittagApiKey: string = process.env.mittagApiToken;
    public mittagApiEndpoint: string = "";
    public port: string = process.env.port;
    public slackClientId: string = process.env.slackClientId;
    public slackClientSecret: string = process.env.slackClientSecret;
}
