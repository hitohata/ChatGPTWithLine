import { Configuration, OpenAIApi } from "openai";
import { CHAT_GPT_API_KEY } from "settings";

interface IChatGPTClient {
    createChatCompletion(input: string): Promise<string>;
}

export class ChatGPTClient  implements IChatGPTClient {
    private readonly chatGPTClient: OpenAIApi;
    private MODEL = "gpt-3.5-turbo";

    constructor() {
        const config: Configuration = new Configuration({
            apiKey: CHAT_GPT_API_KEY
        });

        this.chatGPTClient = new OpenAIApi(config);
    }

    public async createChatCompletion(input: string): Promise<string> {
        const replay = await this.chatGPTClient.createChatCompletion({
            model: this.MODEL,
            messages: [{
                role: "user",
                content: input
            }],
            temperature: 0.4
        });

        const answer = replay.data.choices[0].message?.content;

        return answer ? answer : "No Message";
    }
}
