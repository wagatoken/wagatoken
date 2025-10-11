'use client';

import React, { useState, useEffect } from 'react';
import {
  MdVerified,
  MdDescription,
  MdLocationOn,
  MdNature,
  MdPark,
  MdMap,
  MdCheck,
  MdError,
  MdWarning,
  MdAdd,
  MdEdit,
  MdVisibility,
  MdRefresh,
  MdDownload,
  MdUpload,
  MdInfo
} from 'react-icons/md';
import {
  addECTAPermit,
  addQualityCertificate,
  addOriginVerification,
  getComplianceStatus,
  getBatchInfo
} from '../utils/smartContracts';

interface ECTAPermit {
  permitNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuer: string;
  batchId: string;
  documentHash?: string;
}

interface QualityCertificate {
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuer: string;
  gradeLevel: string;
  moistureContent: number;
  screenSize: string;
  batchId: string;
  documentHash?: string;
}

interface OriginVerification {
  verificationId: string;
  farmLocation: string;
  gpsCoordinates: string;
  farmerIdentity: string;
  cultivationPractices: string;
  harvestDate: Date;
  batchId: string;
  documentHash?: string;
}

interface EUDRCompliance {
  deforestationRiskAssessment: string;
  landUseHistory: string;
  satelliteImageryHash: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationDate: Date;
  batchId: string;
}

interface ComplianceStatus {
  batchId: string;
  hasECTAPermit: boolean;
  hasQualityCertificate: boolean;
  hasOriginVerification: boolean;
  hasEUDRCompliance: boolean;
  overallCompliant: boolean;
  lastUpdated: Date;
}

interface EthiopianComplianceDashboardProps {
  batchId?: string;
  userRole?: 'ADMIN' | 'COMPLIANCE_MANAGER' | 'EXPORTER' | 'VERIFIER';
}

export default function EthiopianComplianceDashboard({ 
  batchId,
  userRole = 'COMPLIANCE_MANAGER' 
}: EthiopianComplianceDashboardProps) {
  const [selectedBatchId, setSelectedBatchId] = useState(batchId || '');
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ecta' | 'quality' | 'origin' | 'eudr'>('overview');

  // Form states
  const [ectaForm, setEctaForm] = useState<Partial<ECTAPermit>>({});
  const [qualityForm, setQualityForm] = useState<Partial<QualityCertificate>>({});
  const [originForm, setOriginForm] = useState<Partial<OriginVerification>>({});
  const [eudrForm, setEudrForm] = useState<Partial<EUDRCompliance>>({});

  // Modals
  const [showECTAModal, setShowECTAModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showEUDRModal, setShowEUDRModal] = useState(false);

  // Load compliance status for batch
  const loadComplianceStatus = async (batchIdToLoad: string) => {
    if (!batchIdToLoad) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`📋 Loading compliance status for batch ${batchIdToLoad}...`);
      
      // Get compliance status from smart contract
      const status = await getComplianceStatus(batchIdToLoad);
      
      setComplianceStatus({
        batchId: batchIdToLoad,
        hasECTAPermit: status ? status.hasECTA : false,
        hasQualityCertificate: status ? status.hasQuality : false,
        hasOriginVerification: status ? status.hasOrigin : false,
        hasEUDRCompliance: false, // EUDR not implemented in contract yet
        overallCompliant: status ? status.isFullyCompliant : false,
        lastUpdated: new Date()
      });
      
      console.log('✅ Compliance status loaded:', status);
      
    } catch (error) {
      console.error('❌ Error loading compliance status:', error);
      setError('Failed to load compliance status');
      
      // Mock data for development
      setComplianceStatus({
        batchId: batchIdToLoad,
        hasECTAPermit: true,
        hasQualityCertificate: false,
        hasOriginVerification: true,
        hasEUDRCompliance: false,
        overallCompliant: false,
        lastUpdated: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // Add ECTA Permit
  const handleAddECTAPermit = async () => {
    if (!selectedBatchId || !ectaForm.permitNumber || !ectaForm.expiryDate) {
      setError('Please fill in all required ECTA permit fields');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Adding ECTA permit...', ectaForm);
      
      const result = await addECTAPermit(selectedBatchId, {
        permitNumber: ectaForm.permitNumber,
        exporterName: ectaForm.issuer || 'Ethiopian Coffee and Tea Authority',
        exporterLicense: 'ECTA-EXP-2023',
        issueDate: Math.floor(Date.now() / 1000),
        expiryDate: Math.floor((ectaForm.expiryDate as Date).getTime() / 1000),
        isValid: true,
        permitDocumentHash: ectaForm.documentHash || 'Qm...'
      });

      console.log('✅ ECTA permit added successfully:', result);
      setSuccess('ECTA permit added successfully');
      setShowECTAModal(false);
      setEctaForm({});
      
      // Reload compliance status
      await loadComplianceStatus(selectedBatchId);

    } catch (error) {
      console.error('❌ Error adding ECTA permit:', error);
      setError('Failed to add ECTA permit');
    } finally {
      setLoading(false);
    }
  };

  // Add Quality Certificate
  const handleAddQualityCertificate = async () => {
    if (!selectedBatchId || !qualityForm.certificateNumber || !qualityForm.gradeLevel) {
      setError('Please fill in all required quality certificate fields');
      return;
    }

    setLoading(true);
    try {
      console.log('⭐ Adding quality certificate...', qualityForm);
      
      const result = await addQualityCertificate(selectedBatchId, {
        certificateNumber: qualityForm.certificateNumber,
        gradingResult: qualityForm.gradeLevel,
        moistureContent: Math.round((qualityForm.moistureContent || 0) * 100), // Convert to basis points
        screenSize: parseInt(qualityForm.screenSize?.replace(/\D/g, '') || '18'), // Extract number
        scaeCompliant: true,
        issueDate: Math.floor(Date.now() / 1000),
        certificateHash: qualityForm.documentHash || 'Qm...',
        inspectorId: qualityForm.issuer || 'Ethiopian Coffee Quality Control Authority'
      });

      console.log('✅ Quality certificate added successfully:', result);
      setSuccess('Quality certificate added successfully');
      setShowQualityModal(false);
      setQualityForm({});
      
      // Reload compliance status
      await loadComplianceStatus(selectedBatchId);

    } catch (error) {
      console.error('❌ Error adding quality certificate:', error);
      setError('Failed to add quality certificate');
    } finally {
      setLoading(false);
    }
  };

  // Add Origin Verification
  const handleAddOriginVerification = async () => {
    if (!selectedBatchId || !originForm.farmLocation || !originForm.gpsCoordinates) {
      setError('Please fill in all required origin verification fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🌍 Adding origin verification...', originForm);
      
      const result = await addOriginVerification(selectedBatchId, {
        region: originForm.farmLocation?.split(',')[0] || 'Unknown Region',
        woreda: originForm.farmLocation?.split(',')[1] || 'Unknown Woreda',
        kebele: originForm.farmLocation?.split(',')[2] || 'Unknown Kebele',
        cooperativeName: originForm.farmerIdentity || 'Verified Farmer',
        cooperativeLicense: 'COOP-LIC-2023',
        verified: true,
        verificationDate: Math.floor(Date.now() / 1000),
        verificationDocumentHash: originForm.documentHash || 'Qm...'
      });

      console.log('✅ Origin verification added successfully:', result);
      setSuccess('Origin verification added successfully');
      setShowOriginModal(false);
      setOriginForm({});
      
      // Reload compliance status
      await loadComplianceStatus(selectedBatchId);

    } catch (error) {
      console.error('❌ Error adding origin verification:', error);
      setError('Failed to add origin verification');
    } finally {
      setLoading(false);
    }
  };

  // Load compliance status when batch ID changes
  useEffect(() => {
    if (selectedBatchId) {
      loadComplianceStatus(selectedBatchId);
    }
  }, [selectedBatchId]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MdVerified size={32} className="text-green-600" />
          Ethiopian Compliance Dashboard
        </h1>
        <p className="text-gray-600">
          Manage ECTA permits, quality certificates, origin verification, and EUDR compliance for coffee batches
        </p>
      </div>

      {/* Batch Selection */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Select Batch for Compliance Management
            </label>
            <input
              type="text"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch ID (e.g., 1001)"
            />
          </div>
          <button
            onClick={() => loadComplianceStatus(selectedBatchId)}
            disabled={!selectedBatchId || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRefresh size={20} />
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <MdError size={20} className="text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <MdCheck size={20} className="text-green-600" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Compliance Status Overview */}
      {complianceStatus && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compliance Status for Batch #{complianceStatus.batchId}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* ECTA Permit Status */}
            <div className={`p-4 rounded-lg border-2 ${
              complianceStatus.hasECTAPermit 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MdDescription size={20} className={complianceStatus.hasECTAPermit ? 'text-green-600' : 'text-red-600'} />
                <span className="font-semibold">ECTA Permit</span>
              </div>
              <div className="flex items-center gap-2">
                {complianceStatus.hasECTAPermit ? (
                  <>
                    <MdCheck size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">Compliant</span>
                  </>
                ) : (
                  <>
                    <MdError size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">Missing</span>
                  </>
                )}
              </div>
            </div>

            {/* Quality Certificate Status */}
            <div className={`p-4 rounded-lg border-2 ${
              complianceStatus.hasQualityCertificate 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MdVerified size={20} className={complianceStatus.hasQualityCertificate ? 'text-green-600' : 'text-red-600'} />
                <span className="font-semibold">Quality Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                {complianceStatus.hasQualityCertificate ? (
                  <>
                    <MdCheck size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">Certified</span>
                  </>
                ) : (
                  <>
                    <MdError size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">Missing</span>
                  </>
                )}
              </div>
            </div>

            {/* Origin Verification Status */}
            <div className={`p-4 rounded-lg border-2 ${
              complianceStatus.hasOriginVerification 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MdLocationOn size={20} className={complianceStatus.hasOriginVerification ? 'text-green-600' : 'text-red-600'} />
                <span className="font-semibold">Origin Verification</span>
              </div>
              <div className="flex items-center gap-2">
                {complianceStatus.hasOriginVerification ? (
                  <>
                    <MdCheck size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">Verified</span>
                  </>
                ) : (
                  <>
                    <MdError size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">Missing</span>
                  </>
                )}
              </div>
            </div>

            {/* EUDR Compliance Status */}
            <div className={`p-4 rounded-lg border-2 ${
              complianceStatus.hasEUDRCompliance 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MdPark size={20} className={complianceStatus.hasEUDRCompliance ? 'text-green-600' : 'text-red-600'} />
                <span className="font-semibold">EUDR Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                {complianceStatus.hasEUDRCompliance ? (
                  <>
                    <MdCheck size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">Compliant</span>
                  </>
                ) : (
                  <>
                    <MdError size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">Missing</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Overall Compliance Status */}
          <div className={`p-4 rounded-lg border-2 ${
            complianceStatus.overallCompliant 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {complianceStatus.overallCompliant ? (
                  <>
                    <MdCheck size={24} className="text-green-600" />
                    <span className="text-lg font-semibold text-green-800">Overall Status: COMPLIANT</span>
                  </>
                ) : (
                  <>
                    <MdWarning size={24} className="text-yellow-600" />
                    <span className="text-lg font-semibold text-yellow-800">Overall Status: INCOMPLETE</span>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Last updated: {complianceStatus.lastUpdated.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedBatchId && complianceStatus && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowECTAModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdAdd size={20} />
            <span>Add ECTA Permit</span>
          </button>
          
          <button
            onClick={() => setShowQualityModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MdAdd size={20} />
            <span>Add Quality Certificate</span>
          </button>
          
          <button
            onClick={() => setShowOriginModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <MdAdd size={20} />
            <span>Add Origin Verification</span>
          </button>
          
          <button
            onClick={() => setShowEUDRModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MdAdd size={20} />
            <span>Add EUDR Compliance</span>
          </button>
        </div>
      )}

      {/* ECTA Permit Modal */}
      {showECTAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdDescription size={24} className="text-blue-600" />
              Add ECTA Export Permit
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Number *
                </label>
                <input
                  type="text"
                  value={ectaForm.permitNumber || ''}
                  onChange={(e) => setEctaForm(prev => ({ ...prev, permitNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ECTA/EXP/2023/001234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer
                </label>
                <input
                  type="text"
                  value={ectaForm.issuer || 'Ethiopian Coffee and Tea Authority'}
                  onChange={(e) => setEctaForm(prev => ({ ...prev, issuer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={ectaForm.expiryDate ? ectaForm.expiryDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEctaForm(prev => ({ ...prev, expiryDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowECTAModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddECTAPermit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Permit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality Certificate Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdVerified size={24} className="text-green-600" />
              Add Quality Certificate
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Number *
                </label>
                <input
                  type="text"
                  value={qualityForm.certificateNumber || ''}
                  onChange={(e) => setQualityForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., QC/2023/001234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level *
                </label>
                <select
                  value={qualityForm.gradeLevel || ''}
                  onChange={(e) => setQualityForm(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Grade</option>
                  <option value="Grade 1">Grade 1 (Premium)</option>
                  <option value="Grade 2">Grade 2 (Standard)</option>
                  <option value="Grade 3">Grade 3 (Commercial)</option>
                  <option value="Specialty">Specialty Grade</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="12"
                    value={qualityForm.moistureContent || ''}
                    onChange={(e) => setQualityForm(prev => ({ ...prev, moistureContent: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 11.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Screen Size
                  </label>
                  <select
                    value={qualityForm.screenSize || ''}
                    onChange={(e) => setQualityForm(prev => ({ ...prev, screenSize: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Size</option>
                    <option value="Grade 1">Screen 18+ (Grade 1)</option>
                    <option value="Grade 2">Screen 16-17 (Grade 2)</option>
                    <option value="Grade 3">Screen 14-15 (Grade 3)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer
                </label>
                <input
                  type="text"
                  value={qualityForm.issuer || 'Ethiopian Coffee Quality Control Authority'}
                  onChange={(e) => setQualityForm(prev => ({ ...prev, issuer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowQualityModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQualityCertificate}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Origin Verification Modal */}
      {showOriginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdLocationOn size={24} className="text-amber-600" />
              Add Origin Verification
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Location *
                </label>
                <input
                  type="text"
                  value={originForm.farmLocation || ''}
                  onChange={(e) => setOriginForm(prev => ({ ...prev, farmLocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Sidama Zone, Bensa Woreda, Kore Kebele"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPS Coordinates *
                </label>
                <input
                  type="text"
                  value={originForm.gpsCoordinates || ''}
                  onChange={(e) => setOriginForm(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., 6.123456, 38.654321"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farmer Identity
                </label>
                <input
                  type="text"
                  value={originForm.farmerIdentity || ''}
                  onChange={(e) => setOriginForm(prev => ({ ...prev, farmerIdentity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Abebe Bekele (ID: 123456789)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cultivation Practices
                </label>
                <textarea
                  value={originForm.cultivationPractices || ''}
                  onChange={(e) => setOriginForm(prev => ({ ...prev, cultivationPractices: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Organic farming, shade-grown, integrated pest management"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowOriginModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOriginVerification}
                disabled={loading}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <MdInfo size={20} className="text-blue-600" />
          Ethiopian Coffee Export Compliance Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-800 mb-1">ECTA Requirements</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>Export permit from Ethiopian Coffee and Tea Authority</li>
              <li>Valid business registration</li>
              <li>Tax clearance certificate</li>
              <li>Quality inspection certificate</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-1">EUDR Requirements (EU Markets)</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>Deforestation risk assessment</li>
              <li>Geo-location data of production</li>
              <li>Land use history documentation</li>
              <li>Satellite imagery verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}