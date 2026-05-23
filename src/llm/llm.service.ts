import { Injectable } from '@nestjs/common';
import { LLMProvider, LLMMessage, LLMResponse } from './llm.interface';
import { OpenAIProvider } from './openai.provider';

@Injectable()
export class LLMService {
  private provider: LLMProvider;

  constructor() {
    // Factory pattern - swap providers here
    const providerType = process.env.LLM_PROVIDER || 'openai';
    
    switch (providerType) {
      case 'openai':
        this.provider = new OpenAIProvider();
        break;
      // Add more providers as needed
      default:
        this.provider = new OpenAIProvider();
    }
  }

  async generateConversation(
    messages: LLMMessage[],
    options?: Record<string, any>
  ): Promise<LLMResponse> {
    return this.provider.generateConversation(messages, options);
  }

  async generateTopicOpener(
    topic: string,
    userInterests: string[],
    targetLanguage: string
  ): Promise<string> {
    return this.provider.generateTopicOpener(topic, userInterests, targetLanguage);
  }
}
