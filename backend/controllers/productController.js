import Product from '../models/Product.js';
import ScraperService from '../services/ScraperService.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scraperService = new ScraperService();

export const scanProduct = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Step 1: Scrape product page
    const scrapedData = await scraperService.scrapeProductPage(url);
    
    // Generate unique product ID
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Step 2: Download images
    const imagePaths = [];
    for (let i = 0; i < Math.min(scrapedData.images.length, 3); i++) {
      const imagePath = await scraperService.downloadImage(
        scrapedData.images[i].url, 
        productId
      );
      if (imagePath) {
        imagePaths.push({
          url: scrapedData.images[i].url,
          localPath: imagePath,
          textExtracted: false,
          ocrText: ''
        });
      }
    }

    // Step 3: Process images with OCR (Python script)
    let ocrText = '';
    for (const image of imagePaths) {
      try {
        const text = await processImageWithOCR(image.localPath);
        image.ocrText = text;
        image.textExtracted = true;
        ocrText += text + ' ';
      } catch (error) {
        console.error('OCR processing error:', error);
      }
    }

    // Step 4: Combine all text data
    const combinedText = `
      ${scrapedData.htmlText}
      ${scrapedData.description}
      ${scrapedData.keyFeatures.join(' ')}
      ${ocrText}
    `.trim();

    // Create product record
    const product = new Product({
      productId,
      url,
      title: scrapedData.title,
      description: scrapedData.description,
      keyFeatures: scrapedData.keyFeatures,
      images: imagePaths,
      extractedData: {
        htmlText: scrapedData.htmlText,
        ocrText: ocrText.trim(),
        combinedText: combinedText
      }
    });

    await product.save();

    res.json({
      success: true,
      message: 'Product scanned successfully',
      product: {
        id: product._id,
        productId: product.productId,
        title: product.title,
        images: product.images.length
      }
    });

  } catch (error) {
    console.error('Product scan error:', error);
    res.status(500).json({ error: error.message });
  }
};

const processImageWithOCR = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ocr-engine/ocr_processor.py'),
      imagePath
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`OCR process failed: ${error}`));
      }
    });
  });
};

export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};