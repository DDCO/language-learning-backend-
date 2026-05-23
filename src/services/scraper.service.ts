import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  url: string;
  summary: string;
  publishedAt?: Date;
  source: string;
}

@Injectable()
export class ScraperService {
  private readonly delayMs = parseInt(process.env.SCRAPING_DELAY_MS || '1000');
  private readonly redditLimit = parseInt(process.env.REDDIT_FETCH_LIMIT || '10');
  private readonly userAgent = process.env.REDDIT_USER_AGENT || 'language-learning-backend/1.0';

  /**
   * Scrape content from a news source based on interest
   */
  async scrapeByInterest(interest: string): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];
    
    try {
      if (interest.startsWith('reddit:r/')) {
        const subreddit = interest.replace('reddit:r/', '');
        const redditResults = await this.scrapeRedditSubreddit(subreddit);
        results.push(...redditResults.map((item) => ({ ...item, interest })));
      }
      
      await this.delay(this.delayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error scraping ${interest}:`, message);
    }

    return results;
  }

  async scrapeRedditSubreddit(subreddit: string): Promise<ScrapedContent[]> {
    const cleanSubreddit = subreddit.replace(/^r\//i, '').trim();
    if (!cleanSubreddit) {
      return [];
    }

    try {
      const response = await axios.get(`https://www.reddit.com/r/${cleanSubreddit}/hot.json`, {
        params: { limit: this.redditLimit },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      const posts = response.data?.data?.children || [];
      const content: ScrapedContent[] = posts
        .map((child: any) => child?.data)
        .filter((post: any) => post?.title && post?.permalink)
        .map((post: any) => ({
          title: post.title,
          url: `https://www.reddit.com${post.permalink}`,
          summary: post.selftext?.slice(0, 500) || post.title,
          source: `reddit:r/${cleanSubreddit}`,
          publishedAt: post.created_utc ? new Date(post.created_utc * 1000) : undefined,
        }));

      await this.delay(this.delayMs);
      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error scraping reddit r/${cleanSubreddit}:`, message);
      return [];
    }
  }

  /**
   * Generic page scraper
   */
  async scrapeURL(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });
      
      await this.delay(this.delayMs);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error scraping ${url}:`, message);
      return '';
    }
  }

  /**
   * Extract text from HTML
   */
  extractText(html: string, selector: string): string[] {
    const $ = cheerio.load(html);
    const results: string[] = [];
    
    $(selector).each((_, element) => {
      const text = $(element).text().trim();
      if (text) results.push(text);
    });
    
    return results;
  }

  /**
   * Simple delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
