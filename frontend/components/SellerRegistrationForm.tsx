'use client';

import React, { useState } from 'react';
import { 
  MdBusiness, 
  MdLocationOn, 
  MdPerson, 
  MdPhone, 
  MdEmail, 
  MdDescription,
  MdUpload,
  MdCheck,
  MdError,
  MdWarning,
  MdInfo
} from 'react-icons/md';
import { registerSeller, getSigner } from '../utils/smartContracts';

interface SellerRegistrationData {
  legalEntityName: string;
  businessRegistrationNumber: string;
  taxIdentificationNumber: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  physicalAddress: string;
  region: string; // Ethiopian region
  businessType: 'COOPERATIVE' | 'PROCESSOR' | 'EXPORTER' | 'TRADER';
  bankAccountNumber: string;
  bankName: string;
  swiftCode: string;
  exportLicenseNumber?: string;
  documentHashes: {
    businessRegistration?: string;
    taxCertificate?: string;
    exportLicense?: string;
    bankStatement?: string;
    kycDocuments?: string;
  };
}

interface SellerRegistrationFormProps {
  onRegistrationComplete?: (sellerId: string) => void;
  onError?: (error: string) => void;
  userRole?: string;
}

const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'SNNP (Southern Nations)',
  'Somali',
  'Tigray'
];

const BUSINESS_TYPES = {
  COOPERATIVE: {
    label: 'Coffee Cooperative',
    description: 'Farmer-owned cooperative for green bean production',
    requiredDocs: ['businessRegistration', 'taxCertificate', 'kycDocuments']
  },
  PROCESSOR: {
    label: 'Coffee Processor',
    description: 'Processes green beans into retail products',
    requiredDocs: ['businessRegistration', 'taxCertificate', 'exportLicense', 'bankStatement']
  },
  EXPORTER: {
    label: 'Coffee Exporter',
    description: 'Exports coffee internationally',
    requiredDocs: ['businessRegistration', 'taxCertificate', 'exportLicense', 'bankStatement', 'kycDocuments']
  },
  TRADER: {
    label: 'Coffee Trader',
    description: 'Domestic coffee trading company',
    requiredDocs: ['businessRegistration', 'taxCertificate', 'bankStatement']
  }
};

export default function SellerRegistrationForm({ 
  onRegistrationComplete, 
  onError, 
  userRole 
}: SellerRegistrationFormProps) {
  const [formData, setFormData] = useState<SellerRegistrationData>({
    legalEntityName: '',
    businessRegistrationNumber: '',
    taxIdentificationNumber: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    physicalAddress: '',
    region: '',
    businessType: 'COOPERATIVE',
    bankAccountNumber: '',
    bankName: '',
    swiftCode: '',
    exportLicenseNumber: '',
    documentHashes: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Required fields validation
    if (!formData.legalEntityName.trim()) errors.push('Legal entity name is required');
    if (!formData.businessRegistrationNumber.trim()) errors.push('Business registration number is required');
    if (!formData.taxIdentificationNumber.trim()) errors.push('Tax identification number is required');
    if (!formData.contactPerson.trim()) errors.push('Contact person is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.physicalAddress.trim()) errors.push('Physical address is required');
    if (!formData.region) errors.push('Region selection is required');
    if (!formData.bankAccountNumber.trim()) errors.push('Bank account number is required');
    if (!formData.bankName.trim()) errors.push('Bank name is required');
    if (!formData.swiftCode.trim()) errors.push('SWIFT code is required');

    // Business type specific validation
    if (formData.businessType === 'EXPORTER' && !formData.exportLicenseNumber?.trim()) {
      errors.push('Export license number is required for exporters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Valid email address is required');
    }

    // Phone validation (Ethiopian format)
    const phoneRegex = /^(\+251|0)?9[0-9]{8}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.push('Valid Ethiopian phone number is required (e.g., +251901234567)');
    }

    // SWIFT code validation
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (formData.swiftCode && !swiftRegex.test(formData.swiftCode)) {
      errors.push('Valid SWIFT code is required (e.g., CBETETAA123)');
    }

    return errors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof SellerRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  // Mock document upload function
  const handleDocumentUpload = async (docType: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[docType] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            // Mock IPFS hash
            const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${docType}`;
            setFormData(prevData => ({
              ...prevData,
              documentHashes: {
                ...prevData.documentHashes,
                [docType]: mockHash
              }
            }));
            resolve(mockHash);
            return prev;
          }
          return { ...prev, [docType]: currentProgress + 10 };
        });
      }, 200);
    });
  };

  // Submit registration
  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🏢 Registering seller with data:', formData);
      
      // Generate seller ID from business registration number
      const sellerId = `SELLER_${formData.businessRegistrationNumber.replace(/[^A-Z0-9]/gi, '_').toUpperCase()}`;
      
      // Prepare contact info JSON string
      const contactInfo = JSON.stringify({
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        physicalAddress: formData.physicalAddress,
        region: formData.region,
        businessType: formData.businessType,
        taxId: formData.taxIdentificationNumber,
        bankInfo: {
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          swiftCode: formData.swiftCode
        },
        exportLicense: formData.exportLicenseNumber,
        documents: formData.documentHashes
      });

      // Get current user address as seller address
      const signer = await getSigner();
      const sellerAddress = await signer.getAddress();
      
      // Call smart contract function with correct parameters
      const result = await registerSeller(
        sellerId,
        sellerAddress,
        formData.legalEntityName,
        contactInfo
      );

      console.log('✅ Seller registered successfully:', result);
      
      if (onRegistrationComplete) {
        onRegistrationComplete(sellerId);
      }

    } catch (error) {
      console.error('❌ Seller registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredDocs = BUSINESS_TYPES[formData.businessType].requiredDocs;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MdBusiness size={32} className="text-blue-600" />
          Ethiopian Seller Registration
        </h2>
        <p className="text-gray-600">
          Register your coffee business for participation in the WAGA marketplace with full Ethiopian compliance
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[
            { step: 1, label: 'Business Info', icon: <MdBusiness size={20} /> },
            { step: 2, label: 'Contact Details', icon: <MdPerson size={20} /> },
            { step: 3, label: 'Banking Info', icon: <MdLocationOn size={20} /> },
            { step: 4, label: 'Documents', icon: <MdUpload size={20} /> }
          ].map(({ step, label, icon }) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <MdCheck size={20} /> : icon}
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MdError size={20} className="text-red-600" />
            <h4 className="font-semibold text-red-800">Please fix the following errors:</h4>
          </div>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Business Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Entity Name *
              </label>
              <input
                type="text"
                value={formData.legalEntityName}
                onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sidama Coffee Cooperative Union"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(BUSINESS_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                {BUSINESS_TYPES[formData.businessType].description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Registration Number *
              </label>
              <input
                type="text"
                value={formData.businessRegistrationNumber}
                onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BR/123456/2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Identification Number *
              </label>
              <input
                type="text"
                value={formData.taxIdentificationNumber}
                onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., TIN-123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Region</option>
                {ETHIOPIAN_REGIONS.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {formData.businessType === 'EXPORTER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export License Number *
                </label>
                <input
                  type="text"
                  value={formData.exportLicenseNumber || ''}
                  onChange={(e) => handleInputChange('exportLicenseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., EXP/LIC/123456"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next: Contact Details
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Abebe Bekele"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+251901234567"
              />
              <p className="text-sm text-gray-600 mt-1">Ethiopian format: +251XXXXXXXXX</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@sidamacoffee.et"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Address *
              </label>
              <textarea
                value={formData.physicalAddress}
                onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Complete physical address including city, subcity, woreda, and house number"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next: Banking Info
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Banking Information */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Banking Information</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MdInfo size={20} className="text-blue-600" />
              <h4 className="font-medium text-blue-800">Foreign Exchange Compliance</h4>
            </div>
            <p className="text-blue-700 text-sm">
              This banking information will be used for foreign exchange surrender compliance as per National Bank of Ethiopia regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Commercial Bank of Ethiopia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000123456789"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SWIFT Code *
              </label>
              <input
                type="text"
                value={formData.swiftCode}
                onChange={(e) => handleInputChange('swiftCode', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CBETETAA123"
                maxLength={11}
              />
              <p className="text-sm text-gray-600 mt-1">
                8-11 character SWIFT/BIC code for international transfers
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next: Documents
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Document Upload */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MdWarning size={20} className="text-amber-600" />
              <h4 className="font-medium text-amber-800">Required Documents for {BUSINESS_TYPES[formData.businessType].label}</h4>
            </div>
            <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
              {requiredDocs.map(doc => (
                <li key={doc}>
                  {doc === 'businessRegistration' && 'Business Registration Certificate'}
                  {doc === 'taxCertificate' && 'Tax Clearance Certificate'}
                  {doc === 'exportLicense' && 'Export License'}
                  {doc === 'bankStatement' && 'Bank Statement (Last 3 months)'}
                  {doc === 'kycDocuments' && 'KYC Documents (ID, Passport)'}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'businessRegistration', label: 'Business Registration', required: requiredDocs.includes('businessRegistration') },
              { key: 'taxCertificate', label: 'Tax Certificate', required: requiredDocs.includes('taxCertificate') },
              { key: 'exportLicense', label: 'Export License', required: requiredDocs.includes('exportLicense') },
              { key: 'bankStatement', label: 'Bank Statement', required: requiredDocs.includes('bankStatement') },
              { key: 'kycDocuments', label: 'KYC Documents', required: requiredDocs.includes('kycDocuments') }
            ].filter(doc => doc.required).map(({ key, label, required }) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{label}</h4>
                  {required && <span className="text-red-500 text-sm">Required</span>}
                </div>
                
                {formData.documentHashes[key as keyof typeof formData.documentHashes] ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <MdCheck size={20} />
                    <span className="text-sm">Document uploaded successfully</span>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await handleDocumentUpload(key, file);
                          } catch (error) {
                            console.error('Upload failed:', error);
                          }
                        }
                      }}
                      className="hidden"
                      id={`upload-${key}`}
                    />
                    <label
                      htmlFor={`upload-${key}`}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <MdUpload size={20} className="text-gray-400" />
                      <span className="text-gray-600">Click to upload {label}</span>
                    </label>
                    
                    {uploadProgress[key] !== undefined && uploadProgress[key] < 100 && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[key]}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress[key]}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MdCheck size={20} />
                  <span>Complete Registration</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}