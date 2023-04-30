import { Client, TextMessage } from "@line/bot-sdk";
import { LINE_ACCESS_TOKEN, LINE_CHANNEL_SECRET } from "settings";

interface ILineClient {
    replayMessage(replayToken: string, message: string): Promise<void>
}

export class LineClient implements ILineClient {

    private readonly lineClient: Client;

    constructor() {

        this.lineClient = new Client({
            channelAccessToken: LINE_ACCESS_TOKEN,
            channelSecret: LINE_CHANNEL_SECRET
        });
    }

    async replayMessage(replayToken: string, message: string): Promise<void> {

        const textMessage: TextMessage = {
            type: "text",
            text: message
        }

        await this.lineClient.replyMessage(replayToken, textMessage);
    }
}
