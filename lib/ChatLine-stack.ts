import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from "path";

interface IProps extends cdk.StackProps {
  API_KEY: string
  CHANNEL_SECRET: string
  CHANNEL_ACCESS_TOKEN: string
}

export class ChatLineStack extends cdk.Stack {

  private readonly apiKey: string;
  private readonly channelSecret: string;
  private readonly channelAccessToken: string;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    this.apiKey = props.API_KEY;
    this.channelSecret = props.CHANNEL_SECRET;
    this.channelAccessToken = props.CHANNEL_ACCESS_TOKEN;

    const messageQueue = this.sqsDefinition();

    const lineChatFunction = this.lineFunction(messageQueue);
    const chatGPTFunction = this.chatGPTFunction();

    const eventSource = new SqsEventSource(messageQueue, {
      maxConcurrency: 2
    });

    messageQueue.grantSendMessages(lineChatFunction);
    chatGPTFunction.addEventSource(eventSource);

    this.apiGateway(lineChatFunction);

  }

  /**
   * create SQS's definition
   * @returns {sqs.Queue}
   */
  private sqsDefinition(): sqs.Queue {
    return new sqs.Queue(this, "ChatQueue", {
      queueName: "QueueFromLineForChatGPT",
      visibilityTimeout: cdk.Duration.minutes(12),
    })
  }

  /**
   * this is private function in the CDK stack.
   * This function creates a lambda function that will be used to handle the massage from the Line.
   * @returns {lambda.Function}
   */
  private lineFunction(sqs: sqs.Queue): lambda.Function {
    return new nodeLambda.NodejsFunction(this, "lineFunction", {
					runtime: lambda.Runtime.NODEJS_18_X,
					functionName: "lineWithCheatGPTFunction",
          environment: {
            REGION: this.region,
            API_KEY: this.apiKey,
            LINE_CHANNEL_SECRET: this.channelSecret,
            LINE_CHANNEL_ACCESS_TOKEN: this.channelAccessToken,
            SQS_URL: sqs.queueUrl
          },
          entry: path.join(__dirname, "../lambdas//LineWithChatGPTFunction/src/main.ts"),
          handler: "lambdaHandler",
          timeout: cdk.Duration.seconds(30),
			})
  }

  /**
   * chat GPT function
   * @returns {lambda.Function}
   */
  private chatGPTFunction(): lambda.Function {
    return new nodeLambda.NodejsFunction(this, "chatGPTFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: "chatGPTLineFunction",
      environment: {
        API_KEY: this.apiKey,
        LINE_CHANNEL_SECRET: this.channelSecret,
        LINE_CHANNEL_ACCESS_TOKEN: this.channelAccessToken
      },
      entry: path.join(__dirname, "../lambdas/ChatGPTFunction/src/main.ts"),
      handler: "lambdaHandler",
      timeout: cdk.Duration.minutes(2),
    })
  }

  private apiGateway(lambdaFunction: lambda.Function) {
    const api = new cdk.aws_apigateway.RestApi(this, "lineApi");

    const chatApi = api.root.addResource("chat");
    const chatLambdaIntegration = new cdk.aws_apigateway.LambdaIntegration(lambdaFunction);
    chatApi.addMethod("POST", chatLambdaIntegration);
  }
}
