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

  /**
   * Scrape content from a news source based on interest
   */
  async scrapeByInterest(interest: string): Promise<ScrapedContent[]> {
    // This is a placeholder - real implementation would:
    // 1. Route to appropriate scrapers based on interest
    // 2. Parse relevant news sources
    // 3. Extract content and deduplicate
    
    const results: ScrapedContent[] = [];
    
    try {
      // Example: sports interest -> ESPN, others
      if (interest.toLowerCase() === 'sports') {
        // results = await this.scrapeESPN();
      } else if (interest.toLowerCase() === 'politics') {
        // results = await this.scrapeBBC();
      }
      // Add more mappings as needed
      
      await this.delay(this.delayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error scraping ${interest}:`, message);
    }

    return results;
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
