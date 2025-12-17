const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Expense = require('../models/Expense');

// Multi-pass OCR with image optimization for better text extraction
const extractTextFromImage = async (imagePath) => {
  try {
    console.log('Starting image processing for OCR...');
    
    const optimizedImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.png');
    const contrastImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_contrast.png');
    const thresholdImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_threshold.png');
    
    const metadata = await sharp(imagePath).metadata();
    console.log(`Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    await sharp(imagePath)
      .resize(Math.max(2400, metadata.width * 2), null, { 
        withoutEnlargement: false,
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 1.5 })
      .normalize()
      .png({ quality: 100 })
      .toFile(optimizedImagePath);

    await sharp(imagePath)
      .resize(Math.max(2400, metadata.width * 2), null, { 
        withoutEnlargement: false,
        kernel: sharp.kernel.lanczos3
      })
      .normalize()
      .linear(1.5, -20)
      .sharpen({ sigma: 2 })
      .grayscale()
      .png({ quality: 100 })
      .toFile(contrastImagePath);

    await sharp(imagePath)
      .resize(Math.max(2400, metadata.width * 2), null, { 
        withoutEnlargement: false,
        kernel: sharp.kernel.lanczos3
      })
      .normalize()
      .grayscale()
      .threshold(128)
      .png({ quality: 100 })
      .toFile(thresholdImagePath);

    console.log('Image processing completed, starting OCR...');

    const tesseractConfig = {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      tessedit_ocr_engine_mode: 1,
      tessedit_pageseg_mode: 1,
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$-:/ ',
      preserve_interword_spaces: 1,
    };

    const createOCRPromise = (imagePath, label) => {
      return Promise.race([
        Tesseract.recognize(imagePath, 'eng', tesseractConfig),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`OCR timeout for ${label}`)), 90000)
        )
      ]);
    };

    console.log('Running OCR on multiple image versions...');
    const [result1, result2, result3] = await Promise.allSettled([
      createOCRPromise(optimizedImagePath, 'optimized'),
      createOCRPromise(contrastImagePath, 'contrast'),
      createOCRPromise(thresholdImagePath, 'threshold')
    ]);

    let bestResult = null;
    let bestConfidence = 0;
    let successfulResults = 0;

    [result1, result2, result3].forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data) {
        successfulResults++;
        console.log(`OCR ${index + 1} Confidence: ${result.value.data.confidence}%`);
        if (result.value.data.confidence > bestConfidence) {
          bestResult = result.value;
          bestConfidence = result.value.data.confidence;
        }
      } else {
        console.log(`OCR ${index + 1} failed:`, result.reason?.message || 'Unknown error');
      }
    });

    [optimizedImagePath, contrastImagePath, thresholdImagePath].forEach(path => {
      if (fs.existsSync(path)) {
        try {
          fs.unlinkSync(path);
        } catch (err) {
          console.error(`Error deleting ${path}:`, err);
        }
      }
    });

    if (!bestResult || successfulResults === 0) {
      throw new Error('All OCR attempts failed. Please try with a clearer image.');
    }

    console.log(`OCR completed successfully. Best confidence: ${bestConfidence}%`);
    return bestResult.data.text;
    
  } catch (error) {
    console.error('Error extracting text from image:', error);
    
    const cleanupPaths = [
      imagePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.png'),
      imagePath.replace(/\.(jpg|jpeg|png)$/i, '_contrast.png'),
      imagePath.replace(/\.(jpg|jpeg|png)$/i, '_threshold.png')
    ];
    
    cleanupPaths.forEach(path => {
      if (fs.existsSync(path)) {
        try {
          fs.unlinkSync(path);
        } catch (err) {
          console.error(`Error cleaning up ${path}:`, err);
        }
      }
    });
    
    throw error;
  }
};

const extractTextFromPDF = async (pdfPath) => {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Intelligent text parsing with pattern recognition
const parseReceiptText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const expenseData = {
    amount: null,
    category: 'Other',
    merchant: null,
    date: null,
    items: []
  };

  const amountPatterns = [
    /(?:total|grand\s*total|final\s*total|amount\s*due|balance\s*due)[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /(?:total|grand\s*total|final\s*total|amount\s*due|balance\s*due)[:\s]*(\d+[.,]\d{2})/i,
    /(?:subtotal|sub\s*total|sub-total)[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /(?:amount|sum|charge)[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /\$\s*(\d+[.,]\d{2})/g,
    /(\d+[.,]\d{2})\s*\$?/g
  ];

  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{1,2}\s+\w+\s+\d{4})/,
    /date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+\d{1,2}:\d{2}/
  ];

  const categoryMap = {
    'Food': [
      'restaurant', 'cafe', 'pizza', 'burger', 'dining', 'food', 'kitchen', 'grill', 'bar',
      'mcdonald', 'subway', 'starbucks', 'kfc', 'domino', 'taco', 'wendy', 'chipotle',
      'buffet', 'dine', 'eatery', 'bistro', 'deli', 'bakery', 'coffee', 'tea'
    ],
    'Groceries': [
      'grocery', 'supermarket', 'market', 'walmart', 'target', 'costco', 'store', 'mart',
      'kroger', 'safeway', 'whole foods', 'trader joe', 'aldi', 'publix', 'food lion',
      'harris teeter', 'giant', 'stop shop', 'wegmans', 'heb', 'meijer'
    ],
    'Transportation': [
      'gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'bus', 'train', 'subway',
      'shell', 'exxon', 'bp', 'chevron', 'mobil', 'citgo', 'speedway', 'marathon',
      'transportation', 'transit', 'toll', 'garage'
    ],
    'Shopping': [
      'mall', 'shop', 'retail', 'clothing', 'fashion', 'electronics', 'amazon', 'ebay',
      'best buy', 'apple', 'nike', 'adidas', 'zara', 'hm', 'forever 21', 'gap',
      'old navy', 'tj maxx', 'marshalls', 'nordstrom', 'macys', 'kohls'
    ],
    'Healthcare': [
      'pharmacy', 'hospital', 'clinic', 'medical', 'doctor', 'health', 'cvs', 'walgreens',
      'rite aid', 'urgent care', 'dental', 'vision', 'therapy', 'medicine', 'prescription'
    ],
    'Entertainment': [
      'cinema', 'movie', 'theater', 'theatre', 'game', 'sport', 'gym', 'fitness', 'netflix',
      'spotify', 'youtube', 'entertainment', 'club', 'concert', 'show', 'amusement'
    ],
    'Utilities': [
      'electric', 'electricity', 'gas bill', 'water', 'internet', 'phone', 'cable',
      'utility', 'verizon', 'att', 'comcast', 'spectrum', 'tmobile', 'sprint'
    ]
  };

  const merchantPatterns = [
    /^([A-Z][A-Z\s&'.,-]+[A-Z])$/m,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|LLC|Corp|Co|Ltd)\.?)?)$/m,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Store|Market|Shop|Restaurant|Cafe)?)$/m
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    for (const pattern of merchantPatterns) {
      const match = line.match(pattern);
      if (match && match[1].length > 2 && match[1].length < 50) {
        expenseData.merchant = match[1].trim();
        break;
      }
    }
    if (expenseData.merchant) break;
  }

  if (!expenseData.merchant && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.match(/\d{2}\/\d{2}\/\d{4}/)) {
      expenseData.merchant = firstLine;
    }
  }

  const fullText = text.toLowerCase();
  let foundAmounts = [];

  for (const pattern of amountPatterns) {
    const matches = fullText.match(pattern);
    if (matches) {
      if (pattern.global) {
        for (const match of matches) {
          const amount = parseFloat(match.replace(/[^\d.]/g, ''));
          if (amount > 0 && amount < 10000) {
            foundAmounts.push({ amount, priority: 1 });
          }
        }
      } else {
        const amount = parseFloat(matches[1].replace(/[^\d.]/g, ''));
        if (amount > 0 && amount < 10000) {
          const priority = matches[0].toLowerCase().includes('total') ? 3 : 2;
          foundAmounts.push({ amount, priority });
        }
      }
    }
  }

  foundAmounts.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return b.amount - a.amount;
  });

  if (foundAmounts.length > 0) {
    expenseData.amount = foundAmounts[0].amount;
  }

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const testDate = new Date(parts[2], parts[0] - 1, parts[1]);
          if (!isNaN(testDate.getTime())) {
            expenseData.date = testDate.toISOString().split('T')[0];
            break;
          }
        }
      } else {
        expenseData.date = date.toISOString().split('T')[0];
        break;
      }
    }
  }

  const textForCategory = (expenseData.merchant + ' ' + fullText).toLowerCase();
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => textForCategory.includes(keyword.toLowerCase()))) {
      expenseData.category = category;
      break;
    }
  }

  const itemPatterns = [
    /^([A-Za-z][A-Za-z\s\d\-\.]+?)\s+\$?(\d+[.,]\d{2})$/gm,
    /^(\d+)\s+([A-Za-z][A-Za-z\s\d\-\.]+?)\s+\$?(\d+[.,]\d{2})$/gm,
    /^([A-Za-z][A-Za-z\s\d\-\.]+?)\s+@\s+\$?(\d+[.,]\d{2})$/gm,
  ];

  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const itemName = match[1] || match[2];
      const price = parseFloat((match[2] || match[3]).replace(/[^\d.]/g, ''));
      
      if (itemName && itemName.length > 2 && itemName.length < 50 && price > 0 && price < 1000) {
        expenseData.items.push({
          name: itemName.trim(),
          price: price
        });
      }
    }
  }

  const uniqueItems = [];
  const seenItems = new Set();
  for (const item of expenseData.items) {
    const key = item.name.toLowerCase();
    if (!seenItems.has(key)) {
      seenItems.add(key);
      uniqueItems.push(item);
    }
  }
  expenseData.items = uniqueItems.slice(0, 20);

  return expenseData;
};

// Main controller function to extract expense from receipt
const extractExpenseFromReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    
    let extractedText = '';
    let processingMethod = '';

// OCR processing with multi-pass optimization
    if (fileType.startsWith('image/')) {
      processingMethod = 'OCR';
      console.log('Starting OCR processing for image...');
      extractedText = await extractTextFromImage(filePath);
    } else if (fileType === 'application/pdf') {
      processingMethod = 'PDF Parser';
      console.log('Starting PDF text extraction...');
      extractedText = await extractTextFromPDF(filePath);
    } else {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload JPG, PNG, or PDF files.'
      });
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from the uploaded file. Please ensure the image is clear and readable.'
      });
    }

    console.log('Text extraction completed, starting data parsing...');
// Parse extracted text into structured expense data
    const expenseData = parseReceiptText(extractedText);

    // Validate parsed data
    if (!expenseData.amount || expenseData.amount <= 0) {
      expenseData.amount = null;
      expenseData.parseWarning = 'Could not automatically detect the total amount. Please enter it manually.';
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log('Receipt processing completed successfully');
    res.status(200).json({
      success: true,
      message: 'Receipt processed successfully',
      processingMethod: processingMethod,
      extractedText: extractedText,
      expenseData: expenseData,
      confidence: expenseData.amount ? 'High' : 'Low'
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    // Check if response has already been sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error processing receipt. Please try again with a clearer image or different file.',
        error: error.message
      });
    }
  }
};

// Create expense from parsed receipt data
const addExpenseFromReceipt = async (req, res) => {
  try {
    const { amount, category, merchant, date, items } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const expenseDate = date ? new Date(date) : new Date();
    
    const newExpense = new Expense({
      user: userId,
      amount: parseFloat(amount),
      category: category || 'Other',
      icon: 'fas fa-receipt', // Default icon for receipt-based expenses
      date: expenseDate,
      source: 'receipt', // Mark as receipt-based
      merchant: merchant || 'Unknown',
      items: items || []
    });

    await newExpense.save();

    res.status(200).json({
      success: true,
      message: 'Expense added successfully from receipt',
      expense: newExpense
    });

  } catch (error) {
    console.error('Error adding expense from receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense: ' + error.message
    });
  }
};

module.exports = {
  extractExpenseFromReceipt,
  addExpenseFromReceipt
};
