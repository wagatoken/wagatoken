// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WAGAECXPriceOracle
 * @dev Ethiopian Commodity Exchange (ECX) Price Oracle with ZK Privacy Integration
 * @notice Provides ECX coffee price data while maintaining competitive pricing privacy through ZK proofs
 * @author WAGA Team
 */
contract WAGAECXPriceOracle is AccessControl, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  ROLES                                     */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant ZK_VERIFIER_ROLE = keccak256("ZK_VERIFIER_ROLE");
    bytes32 public constant PRICING_VIEWER_ROLE = keccak256("PRICING_VIEWER_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error WAGAECXPriceOracle__InvalidPrice_updateECXPrice();
    error WAGAECXPriceOracle__InvalidConfidenceScore_updateECXPrice();
    error WAGAECXPriceOracle__NoBenchmarkPriceAvailable_getCompetitivePricingProof();
    error WAGAECXPriceOracle__InvalidExchangeRate_updateUSDToETBRate();
    error WAGAECXPriceOracle__InvalidRate_updateUSDToETBRate();

    /* -------------------------------------------------------------------------- */
    /*                              TYPE DECLARATIONS                             */
    /* -------------------------------------------------------------------------- */

    enum DataQuality {
        LOW,           // Estimated/Interpolated data
        MEDIUM,        // Market-derived data
        HIGH,          // Official ECX data
        OFFICIAL       // Direct ECX API data (future)
    }

    enum CoffeeGrade {
        LWSD4,         // Low Washed Sidamo Grade 4
        LUBPAA3,       // Low Unwashed Bebeka PAA Grade 3
        UGQ1,          // Unwashed General Quality Grade 1
        WGQ1,          // Washed General Quality Grade 1
        WGQ2,          // Washed General Quality Grade 2
        SPECIALTY      // Specialty grade (85+ SCA)
    }

    enum CoffeeOrigin {
        HW,            // Harrar Washed
        SC,            // Sidamo Coffee
        GM,            // Gemu (Gedeo/Yirgacheffe area)
        BB,            // Bebeka
        TK,            // Tepi/Kaffa
        LK,            // Limu/Kaffa
        GENERAL        // General Ethiopian
    }

    struct ECXPrice {
        CoffeeGrade grade;
        CoffeeOrigin origin;
        uint256 pricePerFeresulla;    // Price in Birr per 17kg (traditional ECX unit)
        uint256 pricePerKg;           // Calculated price per kg in Birr
        uint256 priceUSDPerKg;        // Price per kg in USD (using current exchange rate)
        uint256 timestamp;
        DataQuality quality;
        string source;                // "ECX_OFFICIAL", "MARKET_DATA", "ESTIMATED"
        uint256 confidence;           // Confidence score 1-100
        bytes32 dataHash;             // Hash for data integrity
    }

    struct ZKPriceProof {
        bytes32 proofHash;
        bytes zkProofData;
        uint256 benchmarkPrice;       // ECX benchmark price used in proof
        string competitiveClaim;      // e.g., "Below ECX Average", "Competitive"
        bool isVerified;
        uint256 timestamp;
        address prover;
    }

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // ECX price data storage
    mapping(bytes32 => ECXPrice) public latestPrices;           // gradeOriginHash => price
    mapping(bytes32 => ECXPrice[]) public priceHistory;        // gradeOriginHash => historical prices
    mapping(uint256 => ZKPriceProof) public batchPriceProofs;  // batchId => ZK price proof

    // Exchange rate (ETB to USD) - stored as rate * 10^8 for precision
    uint256 public etbToUsdRate = 1770886;  // ~56.50 ETB per USD inverted (1/56.50 * 10^8)
    uint256 private constant RATE_PRECISION = 10**8;

    // Price validation parameters
    uint256 public maxPriceDeviation = 2000; // 20% (basis points)
    uint256 public priceValidityPeriod = 86400; // 24 hours

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event ECXPriceUpdated(
        CoffeeGrade indexed grade,
        CoffeeOrigin indexed origin,
        uint256 pricePerKg,
        uint256 priceUSDPerKg,
        DataQuality quality,
        string source
    );

    event ZKPriceProofAdded(
        uint256 indexed batchId,
        bytes32 proofHash,
        string competitiveClaim,
        bool isCompetitive
    );

    event ExchangeRateUpdated(uint256 newRate, uint256 timestamp);

    event PriceValidationParametersUpdated(
        uint256 maxDeviation,
        uint256 validityPeriod
    );

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                             PRICE MANAGEMENT                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update ECX coffee price
     * @param grade Coffee grade
     * @param origin Coffee origin
     * @param pricePerFeresulla Price in Birr per 17kg
     * @param quality Data quality rating
     * @param source Data source identifier
     * @param confidence Confidence score (1-100)
     */
    function updateECXPrice(
        CoffeeGrade grade,
        CoffeeOrigin origin,
        uint256 pricePerFeresulla,
        DataQuality quality,
        string memory source,
        uint256 confidence
    ) external onlyRole(PRICE_UPDATER_ROLE) {
        if (pricePerFeresulla == 0) {
            revert WAGAECXPriceOracle__InvalidPrice_updateECXPrice();
        }
        if (confidence == 0 || confidence > 100) {
            revert WAGAECXPriceOracle__InvalidConfidenceScore_updateECXPrice();
        }

        // Calculate per-kg prices
        uint256 pricePerKg = (pricePerFeresulla * 1000) / 17; // Convert 17kg to per kg
        uint256 priceUSDPerKg = (pricePerKg * etbToUsdRate) / RATE_PRECISION;

        bytes32 gradeOriginHash = _getGradeOriginHash(grade, origin);
        bytes32 dataHash = keccak256(abi.encodePacked(
            grade, origin, pricePerFeresulla, block.timestamp, source
        ));

        ECXPrice memory newPrice = ECXPrice({
            grade: grade,
            origin: origin,
            pricePerFeresulla: pricePerFeresulla,
            pricePerKg: pricePerKg,
            priceUSDPerKg: priceUSDPerKg,
            timestamp: block.timestamp,
            quality: quality,
            source: source,
            confidence: confidence,
            dataHash: dataHash
        });

        // Update latest price
        latestPrices[gradeOriginHash] = newPrice;
        
        // Add to price history
        priceHistory[gradeOriginHash].push(newPrice);

        emit ECXPriceUpdated(grade, origin, pricePerKg, priceUSDPerKg, quality, source);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK PRICE PROOFS                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add ZK proof that batch price is competitive against ECX benchmark
     * @param batchId Batch identifier
     * @param grade ECX coffee grade for comparison
     * @param origin ECX coffee origin for comparison
     * @param zkProofData ZK proof data proving competitiveness
     * @param competitiveClaim Public claim about competitiveness
     */
    function addZKPriceProof(
        uint256 batchId,
        CoffeeGrade grade,
        CoffeeOrigin origin,
        bytes calldata zkProofData,
        string calldata competitiveClaim
    ) external onlyRole(ZK_VERIFIER_ROLE) {
        bytes32 gradeOriginHash = _getGradeOriginHash(grade, origin);
        ECXPrice memory benchmarkPrice = latestPrices[gradeOriginHash];

        if (benchmarkPrice.timestamp == 0) {
            revert WAGAECXPriceOracle__NoBenchmarkPriceAvailable_getCompetitivePricingProof();
        }
        if (block.timestamp - benchmarkPrice.timestamp > priceValidityPeriod) {
            revert WAGAECXPriceOracle__InvalidExchangeRate_updateUSDToETBRate();
        }

        // For now, we assume ZK proof is valid (in real implementation, this would call ZK verifier)
        // TODO: Integrate with actual ZK proof verification
        bool isVerified = _mockZKVerification(zkProofData, benchmarkPrice.priceUSDPerKg);

        bytes32 proofHash = keccak256(abi.encodePacked(
            batchId, zkProofData, benchmarkPrice.priceUSDPerKg, block.timestamp
        ));

        batchPriceProofs[batchId] = ZKPriceProof({
            proofHash: proofHash,
            zkProofData: zkProofData,
            benchmarkPrice: benchmarkPrice.priceUSDPerKg,
            competitiveClaim: competitiveClaim,
            isVerified: isVerified,
            timestamp: block.timestamp,
            prover: msg.sender
        });

        emit ZKPriceProofAdded(batchId, proofHash, competitiveClaim, isVerified);
    }

    /**
     * @dev Validate if a price is competitive against ECX benchmark (ZK-protected)
     * @param batchId Batch identifier
     * @return isCompetitive Whether the batch has competitive pricing
     * @return claim Public claim about competitiveness
     */
    function validatePriceCompetitiveness(uint256 batchId) external view returns (
        bool isCompetitive,
        string memory claim
    ) {
        ZKPriceProof memory proof = batchPriceProofs[batchId];
        return (proof.isVerified, proof.competitiveClaim);
    }

    /* -------------------------------------------------------------------------- */
    /*                                VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get latest ECX price for specific grade and origin
     * @param grade Coffee grade
     * @param origin Coffee origin
     * @return price Latest ECX price data
     */
    function getLatestPrice(
        CoffeeGrade grade,
        CoffeeOrigin origin
    ) external view returns (ECXPrice memory price) {
        bytes32 gradeOriginHash = _getGradeOriginHash(grade, origin);
        return latestPrices[gradeOriginHash];
    }

    /**
     * @dev Get ECX price benchmark for a coffee type
     * @param grade Coffee grade
     * @param origin Coffee origin
     * @return priceUSDPerKg Current benchmark price in USD per kg
     * @return confidence Confidence level of the price data
     * @return age Age of the price data in seconds
     */
    function getPriceBenchmark(
        CoffeeGrade grade,
        CoffeeOrigin origin
    ) external view returns (
        uint256 priceUSDPerKg,
        uint256 confidence,
        uint256 age
    ) {
        bytes32 gradeOriginHash = _getGradeOriginHash(grade, origin);
        ECXPrice memory price = latestPrices[gradeOriginHash];
        
        if (price.timestamp == 0) {
            return (0, 0, 0);
        }

        return (
            price.priceUSDPerKg,
            price.confidence,
            block.timestamp - price.timestamp
        );
    }

    /**
     * @dev Get price history for specific grade and origin
     * @param grade Coffee grade
     * @param origin Coffee origin
     * @return prices Array of historical prices
     */
    function getPriceHistory(
        CoffeeGrade grade,
        CoffeeOrigin origin
    ) external view onlyRole(PRICING_VIEWER_ROLE) returns (ECXPrice[] memory prices) {
        bytes32 gradeOriginHash = _getGradeOriginHash(grade, origin);
        return priceHistory[gradeOriginHash];
    }

    /**
     * @dev Get ZK price proof for a batch
     * @param batchId Batch identifier
     * @return proof ZK price proof data
     */
    function getZKPriceProof(uint256 batchId) external view returns (ZKPriceProof memory proof) {
        return batchPriceProofs[batchId];
    }

    /* -------------------------------------------------------------------------- */
    /*                             ADMIN FUNCTIONS                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update ETB to USD exchange rate
     * @param newRate New exchange rate (multiplied by 10^8 for precision)
     */
    function updateExchangeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRate == 0) {
            revert WAGAECXPriceOracle__InvalidRate_updateUSDToETBRate();
        }
        etbToUsdRate = newRate;
        emit ExchangeRateUpdated(newRate, block.timestamp);
    }

    /**
     * @dev Update price validation parameters
     * @param maxDeviation Maximum allowed price deviation in basis points
     * @param validityPeriod Price validity period in seconds
     */
    function updateValidationParameters(
        uint256 maxDeviation,
        uint256 validityPeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxPriceDeviation = maxDeviation;
        priceValidityPeriod = validityPeriod;
        emit PriceValidationParametersUpdated(maxDeviation, validityPeriod);
    }

    /* -------------------------------------------------------------------------- */
    /*                            INTERNAL FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generate hash for grade-origin combination
     */
    function _getGradeOriginHash(
        CoffeeGrade grade,
        CoffeeOrigin origin
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(grade, origin));
    }

    /**
     * @dev Mock ZK verification (replace with actual ZK verifier integration)
     * @param zkProofData ZK proof data
     * @param benchmarkPrice Benchmark price for verification
     * @return isValid Whether the proof is valid
     */
    function _mockZKVerification(
        bytes calldata zkProofData,
        uint256 benchmarkPrice
    ) internal pure returns (bool isValid) {
        // Mock implementation - always returns true for now
        // In production, this would call the actual ZK verifier
        return zkProofData.length > 0 && benchmarkPrice > 0;
    }

    /**
     * @dev Convert ETB amount to USD
     * @param etbAmount Amount in ETB
     * @return usdAmount Amount in USD
     */
    function convertETBToUSD(uint256 etbAmount) external view returns (uint256 usdAmount) {
        return (etbAmount * etbToUsdRate) / RATE_PRECISION;
    }

    /**
     * @dev Convert USD amount to ETB
     * @param usdAmount Amount in USD
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount) {
        return (usdAmount * RATE_PRECISION) / etbToUsdRate;
    }
}
