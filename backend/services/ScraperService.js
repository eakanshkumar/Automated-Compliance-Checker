import axios from 'axios';
import {load} from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ScraperService {
  constructor() {
    this.baseDataPath = path.join(__dirname, '..', 'data');
  }

  async scrapeProductPage(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = load(response.data);

      // Extract product information
      const title = $('h1').first().text().trim() || 
                   $('[class*="title"]').first().text().trim() ||
                   $('title').text().trim();

      const description = $('meta[name="description"]').attr('content') ||
                         $('[class*="description"]').first().text().trim();

      const keyFeatures = [];
      $('ul li, ol li').each((i, el) => {
        const feature = $(el).text().trim();
        if (feature.length > 10 && feature.length < 200) {
          keyFeatures.push(feature);
        }
      });

      const images = [];
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && (src.includes('product') || src.includes('packaging'))) {
          images.push({
            url: src.startsWith('http') ? src : new URL(src, url).href,
            alt: $(el).attr('alt') || ''
          });
        }
      });

      return {
        title,
        description,
        keyFeatures: keyFeatures.slice(0, 10), // Limit to 10 features
        images: images.slice(0, 5), // Limit to 5 images
        htmlText: this.extractRelevantText($)
      };
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape product page: ${error.message}`);
    }
  }

  extractRelevantText($) {
    const relevantSelectors = [
      '.product-description',
      '.product-details',
      '.specifications',
      '[class*="detail"]',
      '[class*="info"]',
      '[class*="spec"]',
      'p', 'span', 'div'
    ];

    let relevantText = '';
    relevantSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && text.length < 500) {
          relevantText += text + ' ';
        }
      });
    });

    return relevantText.trim();
  }

  async downloadImage(imageUrl, productId) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000
      });

      const imagesDir = path.join(this.baseDataPath, 'images', productId);
      await fs.mkdir(imagesDir, { recursive: true });

      const imageName = `image_${Date.now()}.jpg`;
      const imagePath = path.join(imagesDir, imageName);

      await fs.writeFile(imagePath, response.data);
      return imagePath;
    } catch (error) {
      console.error('Image download error:', error);
      return null;
    }
  }
}

export default ScraperService;