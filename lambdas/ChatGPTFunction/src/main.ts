import { ChatGPTClient } from "OtherResources/ChatGPTClient";
import { LineClient } from "OtherResources/LineClient";
import { SQSClient } from "OtherResources/SQSClient";
import { SQSHandler } from "aws-lambda";

const sqsClient = new SQSClient();
const lineClient = new LineClient();
const chatGPTClient = new ChatGPTClient();

export const lambdaHandler: SQSHandler = async (event, context) => {

    if (event.Records.length === 0) {
        return;
    }

    await Promise.all(event.Records.map(async record => {

        try{
            const body = JSON.parse(record.body);

            // invalid request
            if (!(body.lineReplayToken && body.userInput)) {
                return;
            }

            const userInput = body.userInput;
            const replayToken = body.lineReplayToken;

            const completion = await chatGPTClient.createChatCompletion(userInput);

            await Promise.all([
                lineClient.replayMessage(replayToken, completion),
                sqsClient.deleteQueue(record.receiptHandle)
            ])
        } catch (e) {

            if (e instanceof Error) {
                console.error(e.message)
            } else {
                console.error(e)
            }
        }
    }))
}
