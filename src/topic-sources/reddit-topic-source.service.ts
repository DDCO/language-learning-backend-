import { Injectable } from '@nestjs/common';
import { TopicSourceAdapter } from './topic-source.interface';

@Injectable()
export class RedditTopicSourceService implements TopicSourceAdapter {
  readonly sourceName = 'reddit';

  async resolveTopics(items: string[]): Promise<string[]> {
    const clean = (items || [])
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^r\//i, ''));

    return clean.map((subreddit) => `reddit:r/${subreddit}`);
  }

  getDefaultSubreddits(): string[] {
    const raw = process.env.REDDIT_DEFAULT_SUBREDDITS || 'languagelearning,worldnews,technology';
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => v.replace(/^r\//i, ''));
  }
}
