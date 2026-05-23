import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LLMProvider, LLMMessage, LLMResponse } from './llm.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateConversation(
    messages: LLMMessage[],
    options?: Record<string, any>
  ): Promise<LLMResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: this.model,
        tokensUsed: response.data.usage?.total_tokens,
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateTopicOpener(
    topic: string,
    userInterests: string[],
    targetLanguage: string
  ): Promise<string> {
    const systemPrompt = `You are a friendly Portuguese language conversation partner. 
Start a natural conversation in ${targetLanguage} about "${topic}". 
The user's interests include: ${userInterests.join(', ')}.
Keep your opening short (2-3 sentences) and engaging, as if talking to a friend.
Respond only in ${targetLanguage}.`;

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Start a conversation about ${topic}`,
      },
    ];

    const response = await this.generateConversation(messages);
    return response.content;
  }
}
