import { Client, validateSignature, TextMessage, WebhookRequestBody } from "@line/bot-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";
import { LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET } from "settings";
import { Result } from "Utils/Result";

export class LineClass {

    private readonly _userInput: string;
    private readonly _replayToken: string;

    private constructor (replayToken: string, userInput: string) {

        this._replayToken = replayToken;
        this._userInput = userInput;
    }

    get userInput(): string {
        return this._userInput;
    }

    get replayToken(): string {
        return this._replayToken;
    }

    static create(event: APIGatewayProxyEvent): Result<LineClass, string> {
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


        return Result.ok(new LineClass(replayToken, userInput));
    }


}
