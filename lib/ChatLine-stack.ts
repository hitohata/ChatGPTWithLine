import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface IProps extends cdk.StackProps {
  API_KEY: string;
}

export class ChatLineStack extends cdk.Stack {

  private readonly environment: IProps;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    this.environment = props;

    this.lineFunction();

  }

  /**
   * this is private function in the CDK stack.
   * This function creates a lambda function that will be used to handle the massage from the Line.
   * @returns {lambda.Function}
   */
  private lineFunction(): lambda.Function {
    return new nodeLambda.NodejsFunction(this, "lineFunction", {
					runtime: lambda.Runtime.NODEJS_18_X,
					functionName: "lineWithCheatGPTFunction",
          environment: {
            API_KEY: this.environment.API_KEY
          }
			})
  }
}
