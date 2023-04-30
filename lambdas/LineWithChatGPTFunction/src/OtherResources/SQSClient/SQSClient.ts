import { SQSClient as SQSBase, SendMessageCommandInput, SendMessageCommand } from "@aws-sdk/client-sqs";
import { REGION, SQSUrl } from "settings";

interface IMessageContents {
    lineReplayToken: string
    userInput: string
}

export interface ISQSClient {
    sendMessage(message: IMessageContents): Promise<void>
}

/**
 * The wrapper of the SQS Client.
 */
export class SQSClient extends SQSBase implements ISQSClient {

    constructor() {
        super({region: REGION});
    }
    /**
     * get a message and send it to the SQS.
     * @param message {IMessageContents}
     */
    public async sendMessage(message: IMessageContents): Promise<void> {

        // SQS parameter
        const sqsParams: SendMessageCommandInput = {
            MessageBody: JSON.stringify(message),
            QueueUrl: SQSUrl
        }

        const command = new SendMessageCommand(sqsParams);

        await this.send(command);
    }
}
