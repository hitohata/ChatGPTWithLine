import { SQSClient as SQSBase, DeleteMessageCommand, DeleteMessageCommandInput } from "@aws-sdk/client-sqs";
import { SQS_URL } from "settings";

interface ISQSClient {
    deleteQueue(receiptHandle: string): Promise<void>;
}

export class SQSClient extends SQSBase implements ISQSClient {
    constructor() {
        super({ region: "us-east-1" });
    }

    async deleteQueue(receiptHandle: string): Promise<void> {

        const params: DeleteMessageCommandInput = {
            QueueUrl: SQS_URL,
            ReceiptHandle: receiptHandle
        };

        await this.send(new DeleteMessageCommand(params));

        return;
    }

}
