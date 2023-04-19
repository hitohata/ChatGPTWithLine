import { APIGatewayProxyEvent } from "aws-lambda";
import { LineClient } from "OtherResources/Line/LineClient";
import { ChatGPTClient } from "OtherResources/ChatGPT/ChatGPTClient";

const chatGPTApiClient = new ChatGPTClient();

export const lambdaHandler = async (event: APIGatewayProxyEvent) => {

    console.log(event)

    try {

        const lineClientOrError = LineClient.create(event);

        if (lineClientOrError.isError()) {
            console.error(lineClientOrError.getError());
            return {
                statusCode: 400,
                body: JSON.stringify(lineClientOrError.getError())
            }
        }
        const lineClint = lineClientOrError.getValue();

        const responseText = await chatGPTApiClient.createChatCompletion(lineClint.userInput);

        await lineClint.replayMessage(responseText);

        return {
            statusCode: 200,
            body: null
        }

    } catch (error) {

        if (error instanceof Error) {
            console.error(error.message);
        }

        return {
            statusCode: 400,
            body: JSON.stringify(error)
        }
    }

}
