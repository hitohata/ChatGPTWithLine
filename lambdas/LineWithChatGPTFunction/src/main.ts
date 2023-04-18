import { ContainerDefinition } from "aws-cdk-lib/aws-ecs";
import { open } from "fs";
import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
import { type } from "os";

const configuration = new Configuration({
    apiKey: process.env.API_KEY
})

const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();

const chat = openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
        role: "user",
        content: "Say Hi to me"
    }]
})

try {

    const res = await chat;

    console.log(res.data.choices);

} catch (error) {
    console.log(error);
}
