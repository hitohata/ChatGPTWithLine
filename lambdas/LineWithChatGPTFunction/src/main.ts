import { APIGatewayProxyEvent } from "aws-lambda";
import { LineClass } from "OtherResources/Line/LineClass";
import { SQSClient } from "OtherResources/SQSClient/SQSClient";

export const lambdaHandler = async (event: APIGatewayProxyEvent) => {

    try {

        const lineOrError = LineClass.create(event);
        const sqsClient = new SQSClient();

        if (lineOrError.isError()) {
            console.error(lineOrError.getError());
            return {
                statusCode: 400,
                body: JSON.stringify(lineOrError.getError())
            }
        }

        const line = lineOrError.getValue();

        await sqsClient.sendMessage({
            lineReplayToken: line.replayToken,
            userInput: line.userInput
        })

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
