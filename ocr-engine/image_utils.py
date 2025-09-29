import cv2
import numpy as np
from PIL import Image
import os

def preprocess_image(image_path):
    """
    Preprocess image for better OCR results
    """
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply noise reduction
        denoised = cv2.medianBlur(gray, 3)
        
        # Apply thresholding
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Apply morphological operations to remove noise
        kernel = np.ones((1, 1), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)
        
        # Deskew image (simple approach)
        processed = deskew(processed)
        
        # Enhance resolution (optional)
        processed = cv2.resize(processed, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        return processed
        
    except Exception as e:
        print(f"Image preprocessing error: {e}")
        # Return original image if preprocessing fails
        return cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

def deskew(image):
    """
    Simple deskewing function for text images
    """
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Threshold the image
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Find coordinates of all non-zero pixels
        coords = np.column_stack(np.where(thresh > 0))
        
        # Get angle of minimum area rectangle
        angle = cv2.minAreaRect(coords)[-1]
        
        # Adjust angle
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        
        # Rotate image
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, 
                               borderMode=cv2.BORDER_REPLICATE)
        
        return rotated
    except Exception as e:
        print(f"Deskewing error: {e}")
        return image

def enhance_contrast(image):
    """
    Enhance image contrast using CLAHE
    """
    try:
        # Create CLAHE object
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(image)
        return enhanced
    except Exception as e:
        print(f"Contrast enhancement error: {e}")
        return image

def save_processed_image(image, output_path):
    """
    Save processed image to file
    """
    try:
        cv2.imwrite(output_path, image)
        return True
    except Exception as e:
        print(f"Error saving processed image: {e}")
        return False

if __name__ == "__main__":
    # Test the image utils
    test_image = "test_image.jpg"
    if os.path.exists(test_image):
        processed = preprocess_image(test_image)
        save_processed_image(processed, "processed_test.jpg")
        print("Image processing completed successfully")
    else:
        print("Test image not found")