import { Client, validateSignature, TextMessage, WebhookRequestBody } from "@line/bot-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";
import { LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET } from "settings";
import { Result } from "Utils/Result";

interface ILineClient {
    replayMessage(message: string): Promise<void>
}

export class LineClient implements ILineClient {

    private readonly client: Client;
    private readonly replayToken: string
    private readonly message: string;

    constructor (replayToken: string, message: string) {

        this.replayToken = replayToken;
        this.message = message;

        this.client = new Client({
            channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
            channelSecret: LINE_CHANNEL_SECRET,
        })
    }

    get userInput(): string {
        return this.message;
    }

    /**
     * replay an text message to the user.
     * @param message 
     */
    async replayMessage(message: string): Promise<void> {

        const textMessage: TextMessage = {
            type: "text",
            text: message
        };

        await this.client.replyMessage(this.replayToken, textMessage);

    };

    static create(event: APIGatewayProxyEvent): Result < LineClient, string > {
        if (!event.headers['x-line-signature']) {
            return Result.fail("Signature is not found in the request.")
        };

        const signature = event.headers['x-line-signature'];

        if (!event.body) {
            return Result.fail("Body is not found.");
        };

        if (!validateSignature(event.body, LINE_CHANNEL_SECRET, signature)) {
            return Result.fail("Invalid signature.");
        }

        const webhookRequestBody: WebhookRequestBody = JSON.parse(event.body);

        if (webhookRequestBody.events.length === 0) {
            return Result.fail("Event is not found.");
        }

        if (webhookRequestBody.events[0].type !== "message") {
            return Result.fail("Event type is not message. This APP accepts only message event");
        };

        const replayToken = webhookRequestBody.events[0].replyToken;

        if (webhookRequestBody.events[0].message.type !== "text") {
            return Result.fail("Message type is not text. This APP accepts only text message");
        }

        const userInput = webhookRequestBody.events[0].message.text;


        return Result.ok(new LineClient(replayToken, userInput));
    }


}
