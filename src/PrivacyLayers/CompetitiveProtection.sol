// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPrivacyLayer} from "../ZKCircuits/Interfaces/IPrivacyLayer.sol";

contract CompetitiveProtection is AccessControl, IPrivacyLayer {
    bytes32 public constant COMPETITIVE_ADMIN_ROLE = keccak256("COMPETITIVE_ADMIN_ROLE");
    bytes32 public constant MARKET_ANALYST_ROLE = keccak256("MARKET_ANALYST_ROLE");
    
    // Market segments and competitive positioning
    enum MarketSegment {
        Premium,        // High-end, specialty coffee
        MidMarket,      // Mid-range, quality coffee
        Value           // Budget-friendly coffee
    }
    
    // Competitive positioning data
    struct CompetitivePosition {
        MarketSegment segment;
        bool isCompetitive;
        uint256 competitiveScore;      // 0-100 score
        string positioningStatement;   // e.g., "Premium Tier Pricing"
        uint256 lastUpdated;
    }
    
    // Privacy configuration for each batch
    mapping(uint256 => PrivacyConfig) private s_batchPrivacyConfig;
    
    // Competitive positioning for each batch
    mapping(uint256 => CompetitivePosition) private s_competitivePositions;
    
    // Market analysis data
    mapping(MarketSegment => uint256) private s_marketThresholds;
    mapping(MarketSegment => string) private s_marketDescriptions;
    
    // Events
    event CompetitivePositionUpdated(
        uint256 indexed batchId,
        MarketSegment segment,
        bool isCompetitive,
        uint256 score
    );
    
    event MarketThresholdUpdated(MarketSegment segment, uint256 oldThreshold, uint256 newThreshold);
    event PrivacyConfigUpdated(uint256 indexed batchId, PrivacyLevel level);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPETITIVE_ADMIN_ROLE, msg.sender);
        _grantRole(MARKET_ANALYST_ROLE, msg.sender);
        
        // Initialize market thresholds
        s_marketThresholds[MarketSegment.Premium] = 85;
        s_marketThresholds[MarketSegment.MidMarket] = 70;
        s_marketThresholds[MarketSegment.Value] = 50;
        
        // Initialize market descriptions
        s_marketDescriptions[MarketSegment.Premium] = "Premium Tier - High-end specialty coffee";
        s_marketDescriptions[MarketSegment.MidMarket] = "Mid-Market - Quality coffee at accessible prices";
        s_marketDescriptions[MarketSegment.Value] = "Value Tier - Budget-friendly quality coffee";
    }
    
    // Privacy layer interface implementation
    function getPrivacyConfig(uint256 batchId) external view override returns (PrivacyConfig memory) {
        return s_batchPrivacyConfig[batchId];
    }
    
    function updatePrivacyConfig(uint256 batchId, PrivacyConfig calldata config) external override onlyRole(MARKET_ANALYST_ROLE) {
        s_batchPrivacyConfig[batchId] = config;
        emit PrivacyConfigUpdated(batchId, config.level);
    }
    
    function verifyPrivacyProofs(uint256 batchId) external override returns (bool) {
        PrivacyConfig memory config = s_batchPrivacyConfig[batchId];
        return config.pricingPrivate && config.qualityPrivate && config.supplyChainPrivate;
    }
    
    // Competitive positioning management
    function setCompetitivePosition(
        uint256 batchId,
        MarketSegment segment,
        bool isCompetitive,
        uint256 score,
        string calldata positioningStatement
    ) external onlyRole(MARKET_ANALYST_ROLE) {
        require(score <= 100, "Score must be 0-100");
        
        s_competitivePositions[batchId] = CompetitivePosition({
            segment: segment,
            isCompetitive: isCompetitive,
            competitiveScore: score,
            positioningStatement: positioningStatement,
            lastUpdated: block.timestamp
        });
        
        emit CompetitivePositionUpdated(batchId, segment, isCompetitive, score);
    }
    
    function getCompetitivePosition(uint256 batchId) external view returns (CompetitivePosition memory) {
        return s_competitivePositions[batchId];
    }
    
    // Market threshold management
    function setMarketThreshold(MarketSegment segment, uint256 threshold) external onlyRole(COMPETITIVE_ADMIN_ROLE) {
        require(threshold <= 100, "Threshold must be 0-100");
        
        uint256 oldThreshold = s_marketThresholds[segment];
        s_marketThresholds[segment] = threshold;
        
        emit MarketThresholdUpdated(segment, oldThreshold, threshold);
    }
    
    function getMarketThreshold(MarketSegment segment) external view returns (uint256) {
        return s_marketThresholds[segment];
    }
    
    function getMarketDescription(MarketSegment segment) external view returns (string memory) {
        return s_marketDescriptions[segment];
    }
    
    // Competitive analysis
    function analyzeCompetitiveness(uint256 batchId) external view returns (
        MarketSegment segment,
        bool isCompetitive,
        uint256 score,
        string memory positioning
    ) {
        CompetitivePosition memory position = s_competitivePositions[batchId];
        return (
            position.segment,
            position.isCompetitive,
            position.competitiveScore,
            position.positioningStatement
        );
    }
    
    // Market positioning validation
    function validateMarketPosition(uint256 batchId, MarketSegment expectedSegment) external view returns (bool) {
        CompetitivePosition memory position = s_competitivePositions[batchId];
        return position.segment == expectedSegment && position.isCompetitive;
    }
    
    // Privacy level determination based on competitive positioning
    function determineOptimalPrivacyLevel(uint256 batchId) external view returns (PrivacyLevel) {
        CompetitivePosition memory position = s_competitivePositions[batchId];
        
        if (position.segment == MarketSegment.Premium) {
            return PrivacyLevel.Private; // Maximum privacy for premium positioning
        } else if (position.segment == MarketSegment.MidMarket) {
            return PrivacyLevel.Selective; // Selective privacy for mid-market
        } else {
            return PrivacyLevel.Public; // Public for value positioning
        }
    }
    
    // Competitive intelligence protection
    function getProtectedPositioning(uint256 batchId) external view returns (string memory) {
        CompetitivePosition memory position = s_competitivePositions[batchId];
        PrivacyConfig memory privacy = s_batchPrivacyConfig[batchId];
        
        if (privacy.level == PrivacyLevel.Private) {
            return "Premium Quality - Verified Competitive";
        } else if (privacy.level == PrivacyLevel.Selective) {
            return position.positioningStatement;
        } else {
            return s_marketDescriptions[position.segment];
        }
    }
    
    // Market segment analysis
    function getMarketSegmentAnalysis() external view returns (
        uint256 premiumThreshold,
        uint256 midMarketThreshold,
        uint256 valueThreshold,
        string memory premiumDesc,
        string memory midMarketDesc,
        string memory valueDesc
    ) {
        return (
            s_marketThresholds[MarketSegment.Premium],
            s_marketThresholds[MarketSegment.MidMarket],
            s_marketThresholds[MarketSegment.Value],
            s_marketDescriptions[MarketSegment.Premium],
            s_marketDescriptions[MarketSegment.MidMarket],
            s_marketDescriptions[MarketSegment.Value]
        );
    }
    
    // Batch competitive summary
    function getBatchCompetitiveSummary(uint256 batchId) external view returns (
        MarketSegment segment,
        bool isCompetitive,
        uint256 score,
        string memory positioning,
        PrivacyLevel privacyLevel,
        string memory protectedPositioning
    ) {
        CompetitivePosition memory position = s_competitivePositions[batchId];
        PrivacyConfig memory privacy = s_batchPrivacyConfig[batchId];
        
        return (
            position.segment,
            position.isCompetitive,
            position.competitiveScore,
            position.positioningStatement,
            privacy.level,
            this.getProtectedPositioning(batchId)
        );
    }
    
    // Admin functions
    function grantCompetitiveAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(COMPETITIVE_ADMIN_ROLE, account);
    }
    
    function grantMarketAnalystRole(address account) external onlyRole(COMPETITIVE_ADMIN_ROLE) {
        _grantRole(MARKET_ANALYST_ROLE, account);
    }
    
    function revokeCompetitiveAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(COMPETITIVE_ADMIN_ROLE, account);
    }
    
    function revokeMarketAnalystRole(address account) external onlyRole(COMPETITIVE_ADMIN_ROLE) {
        _revokeRole(MARKET_ANALYST_ROLE, account);
    }
    
    // Emergency functions
    function emergencySetPublicPositioning(uint256 batchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // In emergency, make positioning public
        s_batchPrivacyConfig[batchId].level = PrivacyLevel.Public;
        emit PrivacyConfigUpdated(batchId, PrivacyLevel.Public);
    }
}
