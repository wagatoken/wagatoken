'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdPlayArrow, 
  MdStop, 
  MdCheckCircle, 
  MdError,
  MdWarning,
  MdInfo,
  MdRefresh,
  MdDownload,
  MdBugReport
} from 'react-icons/md';
import { WAGAUITestFramework, TestSuite, EndToEndTestConfig } from '../utils/uiTestFramework';

interface TestExecutionState {
  isRunning: boolean;
  currentSuite: string;
  currentTest: string;
  progress: number;
  startTime: number;
}

export default function ComprehensiveUITestRunner() {
  const [testFramework] = useState(new WAGAUITestFramework());
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [executionState, setExecutionState] = useState<TestExecutionState>({
    isRunning: false,
    currentSuite: '',
    currentTest: '',
    progress: 0,
    startTime: 0
  });
  const [testConfig, setTestConfig] = useState<EndToEndTestConfig>({
    skipSlowTests: false,
    enableZKTests: true,
    enableBankingTests: true
  });
  const [selectedSuites, setSelectedSuites] = useState<string[]>([
    'Contract Connectivity',
    'Seller Registration Flow',
    'Batch Creation Flow',
    'Compliance Workflow',
    'Admin Portal Components',
    'UI Component Integration'
  ]);

  useEffect(() => {
    // Initialize component
    console.log('🧪 WAGA UI Test Runner initialized');
  }, []);

  const runSelectedTests = async () => {
    setExecutionState({
      isRunning: true,
      currentSuite: 'Initializing...',
      currentTest: '',
      progress: 0,
      startTime: Date.now()
    });

    try {
      console.log('🚀 Starting comprehensive UI tests...');
      
      // Run the complete test suite
      const results = await testFramework.runCompleteTestSuite(testConfig);
      
      setTestResults(results);
      setExecutionState(prev => ({
        ...prev,
        isRunning: false,
        currentSuite: 'Completed',
        progress: 100
      }));

      console.log('✅ All tests completed');
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      setExecutionState(prev => ({
        ...prev,
        isRunning: false,
        currentSuite: 'Failed',
        progress: 0
      }));
    }
  };

  const runQuickTests = async () => {
    setTestConfig(prev => ({ ...prev, skipSlowTests: true, enableZKTests: false, enableBankingTests: false }));
    await runSelectedTests();
  };

  const stopTests = () => {
    setExecutionState(prev => ({
      ...prev,
      isRunning: false,
      currentSuite: 'Stopped',
      progress: 0
    }));
  };

  const downloadReport = () => {
    const report = generateTestReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waga-ui-test-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTestReport = (): string => {
    const totalTests = testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = testResults.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = testResults.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalDuration = testResults.reduce((sum, suite) => sum + suite.totalDuration, 0);

    let report = `WAGA Coffee Tokenization System - UI Test Report\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `================================================\n\n`;
    
    report += `SUMMARY\n`;
    report += `-------\n`;
    report += `Total Test Suites: ${testResults.length}\n`;
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)\n`;
    report += `Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)\n`;
    report += `Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n\n`;

    report += `DETAILED RESULTS\n`;
    report += `================\n\n`;

    testResults.forEach(suite => {
      const passRate = ((suite.passedTests / suite.totalTests) * 100).toFixed(1);
      const status = suite.failedTests === 0 ? 'PASS' : 'FAIL';
      
      report += `${status} | ${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} (${passRate}%)\n`;
      report += `Duration: ${(suite.totalDuration / 1000).toFixed(2)}s\n`;
      
      if (suite.failedTests > 0) {
        report += `Failed Tests:\n`;
        suite.tests.filter(t => !t.success).forEach(test => {
          report += `  - ${test.testName}: ${test.error}\n`;
        });
      }
      report += `\n`;
    });

    return report;
  };

  const getOverallStatus = () => {
    if (testResults.length === 0) return { status: 'pending', color: 'gray' };
    
    const totalFailed = testResults.reduce((sum, suite) => sum + suite.failedTests, 0);
    if (totalFailed === 0) return { status: 'passing', color: 'green' };
    
    const totalTests = testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const failureRate = (totalFailed / totalTests) * 100;
    
    if (failureRate < 10) return { status: 'mostly passing', color: 'yellow' };
    return { status: 'failing', color: 'red' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <MdBugReport size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">WAGA UI Test Runner</h1>
              <p className="text-blue-100">Comprehensive testing and validation of all UI components</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg bg-${overallStatus.color}-100 text-${overallStatus.color}-800 text-sm font-medium`}>
              {overallStatus.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Test Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.skipSlowTests}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, skipSlowTests: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Skip slow tests</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.enableZKTests}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, enableZKTests: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable ZK privacy tests</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.enableBankingTests}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, enableBankingTests: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable banking tests</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Test Suites</h3>
            <div className="space-y-2 text-sm">
              {[
                'Contract Connectivity',
                'Seller Registration Flow',
                'Batch Creation Flow',
                'Compliance Workflow',
                'ZK Privacy System',
                'Banking Integration',
                'Redemption Workflow',
                'Admin Portal Components',
                'UI Component Integration'
              ].map(suite => (
                <label key={suite} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSuites.includes(suite)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuites(prev => [...prev, suite]);
                      } else {
                        setSelectedSuites(prev => prev.filter(s => s !== suite));
                      }
                    }}
                    className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{suite}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={runSelectedTests}
                disabled={executionState.isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {executionState.isRunning ? <MdStop size={20} /> : <MdPlayArrow size={20} />}
                {executionState.isRunning ? 'Running...' : 'Run Full Tests'}
              </button>
              
              <button
                onClick={runQuickTests}
                disabled={executionState.isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MdRefresh size={20} />
                Quick Tests
              </button>

              {testResults.length > 0 && (
                <button
                  onClick={downloadReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <MdDownload size={20} />
                  Download Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Status */}
      {executionState.isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-900">Test Execution in Progress</h3>
            <button
              onClick={stopTests}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Tests
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Current Suite: {executionState.currentSuite}</span>
                <span>{executionState.progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${executionState.progress}%` }}
                ></div>
              </div>
            </div>
            
            {executionState.currentTest && (
              <div className="text-sm text-blue-700">
                Current Test: {executionState.currentTest}
              </div>
            )}
            
            <div className="text-sm text-blue-600">
              Elapsed: {((Date.now() - executionState.startTime) / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <MdInfo className="text-blue-600" size={20} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {testResults.length}
                  </div>
                  <div className="text-sm text-gray-600">Test Suites</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <MdCheckCircle className="text-green-600" size={20} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {testResults.reduce((sum, suite) => sum + suite.passedTests, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Tests Passed</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <MdError className="text-red-600" size={20} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {testResults.reduce((sum, suite) => sum + suite.failedTests, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Tests Failed</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <MdWarning className="text-yellow-600" size={20} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(testResults.reduce((sum, suite) => sum + suite.totalDuration, 0) / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            {testResults.map((suite, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className={`p-4 ${suite.failedTests === 0 ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {suite.failedTests === 0 ? (
                        <MdCheckCircle className="text-green-600" size={24} />
                      ) : (
                        <MdError className="text-red-600" size={24} />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{suite.suiteName}</h3>
                        <p className="text-sm text-gray-600">
                          {suite.passedTests}/{suite.totalTests} tests passed 
                          ({((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {(suite.totalDuration / 1000).toFixed(2)}s
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                  </div>
                </div>

                {suite.failedTests > 0 && (
                  <div className="p-4">
                    <h4 className="font-medium text-red-900 mb-3">Failed Tests:</h4>
                    <div className="space-y-2">
                      {suite.tests.filter(test => !test.success).map((test, testIndex) => (
                        <div key={testIndex} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                          <MdError className="text-red-500 mt-1" size={16} />
                          <div className="flex-1">
                            <div className="font-medium text-red-900">{test.testName}</div>
                            <div className="text-sm text-red-700">{test.error}</div>
                            <div className="text-xs text-red-600 mt-1">
                              Duration: {test.duration}ms
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Testing Instructions</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• <strong>Quick Tests:</strong> Run essential connectivity and basic functionality tests</p>
          <p>• <strong>Full Tests:</strong> Run comprehensive end-to-end testing including ZK privacy and banking</p>
          <p>• <strong>Custom Configuration:</strong> Select specific test suites and configure test parameters</p>
          <p>• <strong>Results Export:</strong> Download detailed test reports for documentation and debugging</p>
        </div>
      </div>
    </div>
  );
}