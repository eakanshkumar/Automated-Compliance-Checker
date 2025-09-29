import cv2
import pytesseract
import easyocr
import numpy as np
import json
import sys
import os
from image_utils import preprocess_image

class OCRProcessor:
    def __init__(self, languages=['en', 'hi']):
        self.reader = easyocr.Reader(languages)
        self.tesseract_config = '--oem 3 --psm 6'
    
    def extract_text_easyocr(self, image_path):
        """Extract text using EasyOCR"""
        try:
            result = self.reader.readtext(image_path, detail=0, paragraph=True)
            return ' '.join(result)
        except Exception as e:
            print(f"EasyOCR error: {e}")
            return ""
    
    def extract_text_tesseract(self, image_path):
        """Extract text using Tesseract"""
        try:
            # Preprocess image
            processed_image = preprocess_image(image_path)
            text = pytesseract.image_to_string(processed_image, config=self.tesseract_config)
            return text
        except Exception as e:
            print(f"Tesseract error: {e}")
            return ""
    
    def extract_text_combined(self, image_path):
        """Combine both OCR engines for better accuracy"""
        print(f"Processing image: {image_path}")
        
        easyocr_text = self.extract_text_easyocr(image_path)
        tesseract_text = self.extract_text_tesseract(image_path)
        
        print(f"EasyOCR text length: {len(easyocr_text)}")
        print(f"Tesseract text length: {len(tesseract_text)}")
        
        # Simple combination strategy - prefer longer, more structured text
        if len(tesseract_text.strip()) > len(easyocr_text.strip()):
            result = tesseract_text
        else:
            result = easyocr_text
        
        # Clean up the text
        result = self.clean_text(result)
        print(f"Final text length: {len(result)}")
        
        return result
    
    def clean_text(self, text):
        """Clean and normalize extracted text"""
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special characters but keep essential punctuation
        text = ''.join(char for char in text if char.isalnum() or char in ' .,:;/-()₹$%')
        
        return text.strip()
    
    def extract_structured_info(self, text):
        """Extract structured information from OCR text"""
        info = {}
        
        # MRP patterns
        mrp_patterns = [
            r'MRP[\s:]*[₹Rs\.]*\s*(\d+[\.\d]*)',
            r'M\.R\.P[\s:]*[₹Rs\.]*\s*(\d+[\.\d]*)',
            r'Maximum Retail Price[\s:]*[₹Rs\.]*\s*(\d+[\.\d]*)'
        ]
        
        for pattern in mrp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['mrp'] = match.group(1)
                break
        
        # Net quantity patterns
        quantity_patterns = [
            r'Net\s*(Quantity|Qty|Wt|Weight)[\s:]*(\d+[\.\d]*)\s*(kg|g|ml|l|mg)',
            r'(\d+[\.\d]*)\s*(kg|g|ml|l|mg)\s*Net'
        ]
        
        for pattern in quantity_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['net_quantity'] = f"{match.group(2)} {match.group(3)}"
                break
        
        # Country of origin
        origin_patterns = [
            r'Made in\s*([A-Za-z\s]+)',
            r'Country of Origin[\s:]*([A-Za-z\s]+)',
            r'Manufactured in\s*([A-Za-z\s]+)'
        ]
        
        for pattern in origin_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['country_of_origin'] = match.group(1).strip()
                break
        
        return info

def main():
    if len(sys.argv) < 2:
        print("Usage: python ocr_processor.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"Error: Image file {image_path} does not exist")
        sys.exit(1)
    
    try:
        ocr = OCRProcessor()
        text = ocr.extract_text_combined(image_path)
        
        # Output the result as JSON for easy parsing by Node.js
        result = {
            'success': True,
            'text': text,
            'structured_info': ocr.extract_structured_info(text)
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'text': '',
            'structured_info': {}
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    import re  # Add this import
    main()