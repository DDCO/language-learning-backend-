import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from '../entities/conversation.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { LLMService } from '../llm/llm.service';
import { LLMMessage } from '../llm/llm.interface';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    private llmService: LLMService,
  ) {}

  /**
   * Create a new conversation started by an AI-generated opener
   */
  async startConversation(
    userId: string,
    profile: UserProfile,
    topic: string,
    contentSource?: string,
  ): Promise<Conversation> {
    // Generate opening message from LLM
    const openerContent = await this.llmService.generateTopicOpener(
      topic,
      profile.interests,
      profile.targetLanguage,
    );

    const initialMessages: Message[] = [
      {
        role: 'assistant',
        content: openerContent,
        timestamp: new Date(),
      },
    ];

    const conversation = this.conversationRepo.create({
      user: { id: userId },
      profile,
      topic,
      contentSource,
      messages: initialMessages,
      messageCount: 1,
      status: 'active',
    });

    return this.conversationRepo.save(conversation);
  }

  /**
   * Add a user message to a conversation and get AI response
   */
  async addMessage(
    conversationId: string,
    userMessage: string,
    targetLanguage: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Generate AI response
    const systemPrompt = `You are a friendly ${targetLanguage} conversation partner. 
Continue the conversation naturally in ${targetLanguage}. 
Keep responses conversational and engaging, like talking to a friend.
Respond only in ${targetLanguage}.`;

    const llmMessages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await this.llmService.generateConversation(llmMessages);

    conversation.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
    });

    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();

    return this.conversationRepo.save(conversation);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.find({
      where: { user: { id: userId } },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  /**
   * Mark conversation as completed
   */
  async completeConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.status = 'completed';
    conversation.updatedAt = new Date();

    return this.conversationRepo.save(conversation);
  }
}
