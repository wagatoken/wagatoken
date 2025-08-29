"use client";

import { useState } from "react";
import { MdCheck, MdCreate, MdLocationOn, MdGrade, MdStorage, MdTimeline, MdCoffee, MdArrowBack, MdArrowForward } from 'react-icons/md';
import { BatchCreationData } from "@/utils/ipfsMetadata";

interface ProgressiveFormProps {
  batchForm: Partial<BatchCreationData>;
  handleInputChange: (field: keyof BatchCreationData, value: any) => void;
  handleArrayInputChange: (field: 'certifications' | 'cupping_notes', value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

interface FormStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  required: string[];
  optional: string[];
}

const formSteps: FormStep[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Essential details about your coffee batch",
    icon: MdLocationOn,
    color: "#3b82f6",
    required: ['name', 'origin', 'farmer'],
    optional: ['altitude']
  },
  {
    id: 2,
    title: "Processing & Production",
    description: "How your coffee was processed and produced",
    icon: MdCoffee,
    color: "#f97316",
    required: [],
    optional: ['process', 'roastProfile', 'roastDate', 'packagingInfo']
  },
  {
    id: 3,
    title: "Quality & Certifications",
    description: "Quality metrics and certifications",
    icon: MdGrade,
    color: "#10b981",
    required: [],
    optional: ['certifications', 'cupping_notes']
  },
  {
    id: 4,
    title: "Inventory & Pricing",
    description: "Quantity and pricing information",
    icon: MdStorage,
    color: "#f59e0b",
    required: ['quantity', 'pricePerUnit', 'packagingInfo'],
    optional: []
  },
  {
    id: 5,
    title: "Important Dates",
    description: "Production and expiry dates",
    icon: MdTimeline,
    color: "#f43f5e",
    required: ['productionDate', 'expiryDate'],
    optional: []
  },
  {
    id: 6,
    title: "Description",
    description: "Detailed description of your coffee batch",
    icon: MdCreate,
    color: "#64748b",
    required: ['description'],
    optional: []
  }
];

export default function ProgressiveForm({ 
  batchForm, 
  handleInputChange, 
  handleArrayInputChange, 
  onSubmit, 
  loading 
}: ProgressiveFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const validateStep = (step: number): boolean => {
    const stepData = formSteps.find(s => s.id === step);
    if (!stepData) return false;

    return stepData.required.every(field => {
      const value = batchForm[field as keyof BatchCreationData];
      if (field === 'quantity') return value && (value as number) > 0;
      if (field === 'pricePerUnit') return value && parseFloat(value as string) > 0;
      if (field === 'packagingInfo') return value && ['250g', '500g'].includes(value as string);
      if (field === 'productionDate' || field === 'expiryDate') return !!value;
      return value && (value as string).trim().length > 0;
    });
  };

  const canProceedToStep = (step: number): boolean => {
    if (step === 1) return true;
    // For steps 2-3, just need step 1 complete
    if (step <= 3) return validateStep(1);
    // For steps 4-6, need step 1 and any previous required steps
    if (step === 4) return validateStep(1);
    if (step === 5) return validateStep(1) && validateStep(4);
    if (step === 6) return validateStep(1) && validateStep(4) && validateStep(5);
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(currentStep);
        return newSet;
      });
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  };

  const isFormComplete = (): boolean => {
    return formSteps.every(step => validateStep(step.id));
  };

  const currentStepData = formSteps.find(s => s.id === currentStep);
  const currentStepValid = validateStep(currentStep);

  return (
    <div className="web3-premium-card animate-card-entrance" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
        margin: '-24px -24px 16px -24px',
        padding: '16px 24px',
        borderRadius: '24px 24px 0 0'
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MdCreate size={20} style={{color: 'white'}} />
          </div>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '2px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Create New Coffee Batch</h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              margin: 0
            }}>
              Step {currentStep} of 6 - {currentStepData?.title}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            {formSteps.map((step) => (
              <div 
                key={step.id} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: canProceedToStep(step.id) ? 'pointer' : 'not-allowed',
                  opacity: canProceedToStep(step.id) ? 1 : 0.5,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleStepClick(step.id)}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: completedSteps.has(step.id) ? '#10b981' : 
                             currentStep === step.id ? '#f59e0b' : 
                             'rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  border: currentStep === step.id ? '2px solid white' : 'none'
                }}>
                  {completedSteps.has(step.id) ? <MdCheck size={14} /> : step.id}
                </div>
                <span style={{
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '2px',
                  textAlign: 'center',
                  maxWidth: '50px'
                }}>
                  {step.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            height: '3px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #f59e0b)',
              width: `${(completedSteps.size / 6) * 100}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStepData && (
        <div>
          <div style={{
            background: `linear-gradient(135deg, ${currentStepData.color}15, ${currentStepData.color}08)`,
            border: `2px solid ${currentStepData.color}30`,
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{
                background: `${currentStepData.color}20`,
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <currentStepData.icon size={20} style={{color: currentStepData.color}} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: currentStepData.color,
                  margin: 0
                }}>
                  {currentStepData.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: 0
                }}>
                  {currentStepData.description}
                </p>
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdCoffee size={16} />
                    Batch Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Sidama Coffee Batch #1001"
                  />
                </div>
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdLocationOn size={16} />
                    Origin/Region<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.origin || ''}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Sidama, Ethiopia"
                  />
                </div>
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdLocationOn size={16} />
                    Farmer/Cooperative<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.farmer || ''}
                    onChange={(e) => handleInputChange('farmer', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Kochere Farmers Cooperative"
                  />
                </div>
                <div>
                  <label className="web3-form-label">
                    Altitude (meters)
                  </label>
                  <input
                    type="text"
                    value={batchForm.altitude || ''}
                    onChange={(e) => handleInputChange('altitude', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., 1,800-2,100m"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Processing Details */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="web3-form-label">
                    Processing Method
                  </label>
                  <select
                    value={batchForm.process || ''}
                    onChange={(e) => handleInputChange('process', e.target.value)}
                    className="web3-ethereum-input w-full"
                  >
                    <option value="">Select processing method</option>
                    <option value="washed">Washed</option>
                    <option value="natural">Natural</option>
                    <option value="honey">Honey</option>
                    <option value="semi-washed">Semi-washed</option>
                  </select>
                </div>
                <div>
                  <label className="web3-form-label">
                    Roast Profile
                  </label>
                  <select
                    value={batchForm.roastProfile || 'Medium'}
                    onChange={(e) => handleInputChange('roastProfile', e.target.value)}
                    className="web3-ethereum-input w-full"
                  >
                    <option value="Light">Light Roast</option>
                    <option value="Medium">Medium Roast</option>
                    <option value="Dark">Dark Roast</option>
                  </select>
                </div>
                <div>
                  <label className="web3-form-label">
                    Roast Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.roastDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('roastDate', e.target.value)}
                    className="web3-ethereum-input w-full"
                  />
                </div>
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdStorage size={16} />
                    Package Size<span className="required">*</span>
                  </label>
                  <select
                    value={batchForm.packagingInfo || '250g'}
                    onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                    className="web3-ethereum-input w-full"
                  >
                    <option value="250g">250g Bags</option>
                    <option value="500g">500g Bags</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Quality Metrics */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdGrade size={16} />
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={batchForm.certifications?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
                  />
                </div>
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdGrade size={16} />
                    Cupping Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={batchForm.cupping_notes?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('cupping_notes', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Citrus, Chocolate, Floral, Bright acidity"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Inventory Details */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdStorage size={16} />
                    Quantity (bags)<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={batchForm.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., 100"
                    min="1"
                  />
                </div>
                <div>
                  <label className="web3-form-label flex items-center gap-2">
                    <MdStorage size={16} />
                    Price per Unit (USD)<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={batchForm.pricePerUnit || ''}
                    onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., 12.50"
                    min="0.01"
                    max="100"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Date Management */}
            {currentStep === 5 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="web3-form-label">
                    Production Date<span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={batchForm.productionDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleInputChange('productionDate', new Date(e.target.value))}
                    className="web3-ethereum-input w-full"
                  />
                </div>
                <div>
                  <label className="web3-form-label">
                    Expiry Date<span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={batchForm.expiryDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleInputChange('expiryDate', new Date(e.target.value))}
                    className="web3-ethereum-input w-full"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Description */}
            {currentStep === 6 && (
              <div>
                <label className="web3-form-label flex items-center gap-2">
                  <MdCreate size={16} />
                  Batch Description<span className="required">*</span>
                </label>
                <textarea
                  value={batchForm.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="web3-ethereum-input w-full"
                  placeholder="Describe this coffee batch - origin story, flavor profile, processing details, and what makes it special..."
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: currentStep === 1 ? '#e5e7eb' : '#f3f4f6',
                color: currentStep === 1 ? '#9ca3af' : '#374151',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <MdArrowBack size={16} />
              Previous
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <span>Step {currentStep} of 6</span>
              {currentStepValid && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#10b981'
                }}>
                  <MdCheck size={16} />
                  Complete
                </div>
              )}
            </div>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                disabled={!currentStepValid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentStepValid ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : '#e5e7eb',
                  color: currentStepValid ? 'white' : '#9ca3af',
                  cursor: currentStepValid ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  boxShadow: currentStepValid ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                Next
                <MdArrowForward size={16} />
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={!isFormComplete() || loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isFormComplete() && !loading ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                  color: isFormComplete() && !loading ? 'white' : '#9ca3af',
                  cursor: isFormComplete() && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  boxShadow: isFormComplete() && !loading ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #9ca3af',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <MdCreate size={16} />
                    Create Batch & Generate QR Codes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
