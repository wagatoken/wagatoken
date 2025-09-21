// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TestHelperUtilities
 * @dev Comprehensive test utilities for WAGA MVP testing
 * @notice Provides helper functions for SWIFT codes, seller IDs, and multi-stage transfer testing
 */
library TestHelperUtilities {
    /* -------------------------------------------------------------------------- */
    /*                              SWIFT Code Utilities                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generate valid SWIFT codes for testing
     */
    function getValidSwiftCodes() internal pure returns (bytes11[] memory) {
        bytes11[] memory codes = new bytes11[](4);
        codes[0] = bytes11("CBETETAAXXX"); // Commercial Bank of Ethiopia
        codes[1] = bytes11("DASHETAAXXX"); // Dashen Bank
        codes[2] = bytes11("AWINETAAXXX"); // Awash International Bank
        codes[3] = bytes11("LIONETAAXXX"); // Lion International Bank
        return codes;
    }

    /**
     * @dev Generate invalid SWIFT codes for negative testing
     */
    function getInvalidSwiftCodes() internal pure returns (bytes11[] memory) {
        bytes11[] memory codes = new bytes11[](3);
        codes[0] = bytes11("INVALIDXXXX"); // Too short
        codes[1] = bytes11("TOOLONGXXXX"); // Too long
        codes[2] = bytes11("INVALID1234"); // Invalid characters
        return codes;
    }

    /**
     * @dev Generate a valid SWIFT code for Ethiopian banks
     */
    function generateValidEthiopianSwift() internal pure returns (bytes11) {
        return bytes11("TESTETAAXXX");
    }

    /**
     * @dev Generate a valid SWIFT code for offramp partners
     */
    function generateValidOfframpSwift() internal pure returns (bytes11) {
        return bytes11("OFFRAMPXXXX");
    }

    /* -------------------------------------------------------------------------- */
    /*                              Seller ID Utilities                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generate sequential seller IDs for testing
     */
    function generateSellerIds(uint256 count, uint256 startId) internal pure returns (uint64[] memory) {
        uint64[] memory ids = new uint64[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = uint64(startId + i);
        }
        return ids;
    }

    /**
     * @dev Generate seller profile data for testing
     */
    struct SellerProfileData {
        uint64 sellerId;
        string sellerType;
        string sellerName;
        string businessRegistration;
        string contactEmail;
        string contactPhone;
        address walletAddress;
    }

    /**
     * @dev Generate sample seller profiles for testing
     */
    function generateSampleSellerProfiles() internal pure returns (SellerProfileData[] memory) {
        SellerProfileData[] memory profiles = new SellerProfileData[](3);

        profiles[0] = SellerProfileData({
            sellerId: 1,
            sellerType: "COOPERATIVE",
            sellerName: "Yirgacheffe Cooperative",
            businessRegistration: "COOP001",
            contactEmail: "contact@yirgacheffe.com",
            contactPhone: "+251911123456",
            walletAddress: address(0x1001)
        });

        profiles[1] = SellerProfileData({
            sellerId: 2,
            sellerType: "PROCESSOR",
            sellerName: "Sidamo Premium Processor",
            businessRegistration: "PROC001",
            contactEmail: "contact@sidamo.com",
            contactPhone: "+251922654321",
            walletAddress: address(0x1002)
        });

        profiles[2] = SellerProfileData({
            sellerId: 3,
            sellerType: "ROASTER",
            sellerName: "Addis Ababa Roastery",
            businessRegistration: "ROAST001",
            contactEmail: "contact@addisroast.com",
            contactPhone: "+251933987654",
            walletAddress: address(0x1003)
        });

        return profiles;
    }

    /* -------------------------------------------------------------------------- */
    /*                         Multi-Stage Transfer Utilities                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Transfer stage enumeration for testing
     */
    enum TestTransferStage {
        NONE,
        USDC_SENT_TO_OFFRAMP,
        OFFRAMP_TO_RECEIVING_BANK,
        RECEIVING_BANK_TO_SELLER,
        SELLER_PAYMENT_CONFIRMED
    }

    /**
     * @dev Generate transfer stage data for testing
     */
    struct TransferStageData {
        uint256 batchId;
        uint64 sellerId;
        address buyer;
        bytes11 offrampSwift;
        bytes11 receivingSwift;
        uint256 usdAmount;
        TestTransferStage currentStage;
        string[] transactionIds;
        uint256[] timestamps;
    }

    /**
     * @dev Generate sample transfer stage data
     */
    function generateSampleTransferStages(uint256 batchId, uint64 sellerId)
        internal
        pure
        returns (TransferStageData memory)
    {
        string[] memory txIds = new string[](4);
        txIds[0] = "TX_OFFRAMP_001";
        txIds[1] = "TX_BANK_001";
        txIds[2] = "TX_SELLER_001";
        txIds[3] = "TX_CONFIRM_001";

        uint256[] memory timestamps = new uint256[](4);
        timestamps[0] = block.timestamp;
        timestamps[1] = block.timestamp + 1 hours;
        timestamps[2] = block.timestamp + 2 hours;
        timestamps[3] = block.timestamp + 3 hours;

        return TransferStageData({
            batchId: batchId,
            sellerId: sellerId,
            buyer: address(0x2001),
            offrampSwift: generateValidOfframpSwift(),
            receivingSwift: generateValidEthiopianSwift(),
            usdAmount: 10000 * 1e6, // 10,000 USDC
            currentStage: TestTransferStage.SELLER_PAYMENT_CONFIRMED,
            transactionIds: txIds,
            timestamps: timestamps
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                           EUDR Compliance Utilities                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev EUDR compliance test data
     */
    struct EUDRTestData {
        string certificateId;
        string complianceLevel;
        string deforestationStatus;
        string geolocationData;
        uint256 certificateExpiry;
        uint256 plotSize;
        string verificationMethod;
    }

    /**
     * @dev Generate sample EUDR compliance data for testing
     */
    function generateSampleEUDRData() internal view returns (EUDRTestData memory) {
        return EUDRTestData({
            certificateId: "EUDR-CERT-TEST-001",
            complianceLevel: "High",
            deforestationStatus: "Deforestation-Free",
            geolocationData: "8.5476N, 39.2695E",
            certificateExpiry: block.timestamp + 365 days,
            plotSize: 5000, // 50 hectares in square meters
            verificationMethod: "Satellite + GPS"
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                         Ethiopian Compliance Utilities                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Ethiopian compliance test data
     */
    struct EthiopianComplianceTestData {
        string ectaPermitNumber;
        string qualityCertificateNumber;
        string originDocumentHash;
        string boeRegistrationNumber;
        uint256 exportValue;
        uint256 moistureContent;
        uint256 screenSize;
    }

    /**
     * @dev Generate sample Ethiopian compliance data
     */
    function generateSampleEthiopianComplianceData() internal pure returns (EthiopianComplianceTestData memory) {
        return EthiopianComplianceTestData({
            ectaPermitNumber: "ECTA-TEST-001",
            qualityCertificateNumber: "QUAL-TEST-001",
            originDocumentHash: "ORIGIN-HASH-TEST",
            boeRegistrationNumber: "BOE-TEST-001",
            exportValue: 10000 * 1e18, // 10,000 USD
            moistureContent: 11, // 11% moisture (acceptable)
            screenSize: 15 // Screen size 15 (acceptable)
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                             ZK Proof Utilities                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generate mock ZK proof data for testing
     */
    function generateMockZKProof() internal pure returns (bytes memory) {
        return abi.encodePacked(
            uint256(0x123456789abcdef),
            uint256(0xfedcba987654321),
            uint256(0xdeadbeefcafe),
            uint256(0xfeedface)
        );
    }

    /**
     * @dev Generate mock public signals for testing
     */
    function generateMockPublicSignals() internal pure returns (uint256[] memory) {
        uint256[] memory signals = new uint256[](5);
        signals[0] = uint256(0x1111111111111111);
        signals[1] = uint256(0x2222222222222222);
        signals[2] = uint256(0x3333333333333333);
        signals[3] = uint256(0x4444444444444444);
        signals[4] = uint256(0x5555555555555555);
        return signals;
    }

    /**
     * @dev Generate invalid ZK proof data for negative testing
     */
    function generateInvalidZKProof() internal pure returns (bytes memory) {
        return "invalid_proof";
    }

    /* -------------------------------------------------------------------------- */
    /*                             Gas Optimization Utilities                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Calculate expected gas savings for SWIFT codes vs addresses
     * @param numTransactions Number of transactions
     * @return savings Expected gas savings in wei
     */
    function calculateSwiftGasSavings(uint256 numTransactions) internal pure returns (uint256 savings) {
        // Address storage: 20 bytes
        // bytes11 storage: 11 bytes (rounded up to 32 bytes slot)
        // Approximate gas savings per transaction
        uint256 gasPerByte = 20; // Rough estimate
        uint256 bytesSaved = 20 - 11;
        return numTransactions * bytesSaved * gasPerByte;
    }

    /**
     * @dev Calculate expected gas savings for seller IDs vs addresses
     * @param numTransactions Number of transactions
     * @return savings Expected gas savings in wei
     */
    function calculateSellerIdGasSavings(uint256 numTransactions) internal pure returns (uint256 savings) {
        // Address storage: 20 bytes
        // uint64 storage: 8 bytes (rounded up to 32 bytes slot)
        // Approximate gas savings per transaction
        uint256 gasPerByte = 20; // Rough estimate
        uint256 bytesSaved = 20 - 8;
        return numTransactions * bytesSaved * gasPerByte;
    }

    /* -------------------------------------------------------------------------- */
    /*                             Time Utilities                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generate future timestamps for testing expiry
     */
    function generateFutureTimestamp(uint256 daysAhead) internal view returns (uint256) {
        return block.timestamp + (daysAhead * 1 days);
    }

    /**
     * @dev Generate past timestamps for testing expiry
     */
    function generatePastTimestamp(uint256 daysAgo) internal view returns (uint256) {
        return block.timestamp - (daysAgo * 1 days);
    }
}
