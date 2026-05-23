export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

export interface LLMProvider {
  generateConversation(
    messages: LLMMessage[],
    options?: Record<string, any>
  ): Promise<LLMResponse>;

  generateTopicOpener(
    topic: string,
    userInterests: string[],
    targetLanguage: string
  ): Promise<string>;
}
