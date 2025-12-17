import React, { useState } from 'react';
import { useReceipt } from '../hooks/useReceipt';
import { expenseCategoryOptions, expenseIcons } from '../utils/data';
import { FiUpload, FiX, FiCheck, FiAlertCircle, FiEdit3 } from 'react-icons/fi';

const ReceiptUpload = ({ onExpenseAdded, onClose }) => {
  const { loading, error, extractExpenseFromReceipt, addExpenseFromReceipt } = useReceipt();
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image (JPEG, PNG) or PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setExtractedData(null);
      setFormData({
        amount: '',
        category: '',
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        items: []
      });
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) return;
    
    const result = await extractExpenseFromReceipt(selectedFile);
    if (result.success) {
      setExtractedData(result.data);
      setFormData({
        amount: result.data.expenseData.amount || '',
        category: result.data.expenseData.category || '',
        merchant: result.data.expenseData.merchant || '',
        date: result.data.expenseData.date || new Date().toISOString().split('T')[0],
        items: result.data.expenseData.items || []
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const result = await addExpenseFromReceipt(formData);
    if (result.success) {
      onExpenseAdded();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setFormData({
      amount: '',
      category: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      items: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Upload Receipt</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload Receipt
                  </span>
                  <span className="text-sm text-gray-500">
                    PNG, JPG, or PDF up to 10MB
                  </span>
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-700 font-medium mb-2">Tips for better results:</p>
                <ul className="text-xs text-blue-600 space-y-1 text-left">
                  <li>• Ensure good lighting when taking photos</li>
                  <li>• Keep the receipt flat and straight</li>
                  <li>• Make sure all text is clearly visible</li>
                  <li>• PDF receipts usually work better than photos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              {!extractedData && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={handleExtractData}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing... This may take 10-30 seconds</span>
                      </div>
                    ) : (
                      'Extract Data'
                    )}
                  </button>
                  {selectedFile.type === 'application/pdf' && (
                    <p className="text-xs text-gray-500 text-center">
                      PDF processing is faster than image OCR
                    </p>
                  )}
                  {selectedFile.type.startsWith('image/') && (
                    <p className="text-xs text-gray-500 text-center">
                      For best results, ensure the receipt is well-lit and text is clear
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="space-y-4">
              <div className={`border rounded-md p-3 ${
                extractedData.confidence === 'High' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex">
                  <FiCheck className={`h-5 w-5 ${
                    extractedData.confidence === 'High' ? 'text-green-400' : 'text-yellow-400'
                  }`} />
                  <div className="ml-3">
                    <p className={`text-sm ${
                      extractedData.confidence === 'High' ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      Receipt processed successfully using {extractedData.processingMethod}! 
                      {extractedData.confidence === 'High' 
                        ? ' High confidence detection - please review the data below.'
                        : ' Some details may need manual correction - please verify the information below.'
                      }
                    </p>
                    {extractedData.expenseData.parseWarning && (
                      <p className="text-sm text-orange-600 mt-1">
                        <FiAlertCircle className="inline h-4 w-4 mr-1" />
                        {extractedData.expenseData.parseWarning}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiEdit3 className="h-4 w-4 mr-1" />
                {showExtractedText ? 'Hide' : 'Show'} Extracted Text
              </button>

              {showExtractedText && (
                <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-600 mb-2">Raw extracted text:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {extractedData.extractedText}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {expenseCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant
                    </label>
                    <input
                      type="text"
                      name="merchant"
                      value={formData.merchant}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Items Display */}
                {formData.items.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items Found
                    </label>
                    <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
