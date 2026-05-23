export interface TopicSourceSelection {
  source: string;
  items: string[];
}

export interface TopicSourceAdapter {
  readonly sourceName: string;
  resolveTopics(items: string[]): Promise<string[]>;
}
