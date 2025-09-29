import ScraperService from '../services/ScraperService.js';

const scraperService = new ScraperService();

export const testScrape = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scrapedData = await scraperService.scrapeProductPage(url);
    
    res.json({
      success: true,
      data: scrapedData
    });
  } catch (error) {
    console.error('Test scrape error:', error);
    res.status(500).json({ error: error.message });
  }
};