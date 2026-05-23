import { Injectable } from '@nestjs/common';
import { RedditTopicSourceService } from './reddit-topic-source.service';
import { TopicSourceSelection } from './topic-source.interface';

@Injectable()
export class TopicSourceService {
  constructor(private readonly redditSource: RedditTopicSourceService) {}

  async resolveTopics(selections: TopicSourceSelection[] = []): Promise<string[]> {
    const resolved: string[] = [];

    for (const selection of selections) {
      if (selection.source === 'reddit') {
        const items = selection.items?.length
          ? selection.items
          : this.redditSource.getDefaultSubreddits();
        const topics = await this.redditSource.resolveTopics(items);
        resolved.push(...topics);
      }
    }

    return [...new Set(resolved)];
  }
}
