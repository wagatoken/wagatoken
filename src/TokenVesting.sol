// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the IERC20 interface for interacting with the WagaToken contract
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Import OpenZeppelin utilities for ownership and cryptographic operations
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Extend IERC20 to include the mint function, specific to WagaToken
interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title TokenVesting
 * @dev This contract handles token vesting schedules and category-based allocations.
 * It interacts with the WagaToken contract to mint and transfer tokens.
 */
contract TokenVesting is Ownable {
    /* Errors */

    error TokenVesting__CategoryAlreadyInitialized_initializeCategory();
    error TokenVesting__AllocationValueIsZero_initializeCategory();
    error TokenVesting__VestingAlreadyExists_createVestingSchedule();
    error TokenVesting__InvalidBeneficiary_createVestingSchedule();
    error TokenVesting__BeneficiaryAlreadyExists_createVestingSchedule();
    error TokenVesting__InsufficientCategoryBalance_createVestingSchedule();
    error TokenVesting__CliffExceedsDuration_createVestingSchedule();
    error TokenVesting__CliffNotReached_releaseTokens();
    error TokenVesting__VestingRevoked_releaseTokens();
    error TokenVesting__NoTokensToRelease_releaseTokens();
    error TokenVesting__InvalidBeneficiaryAddress_releaseTokens();
    error TokenVesting__ShouldBeNonVestingCategory_distributeTokens();
    error TokenVesting__InsufficientCategoryBalance_distributeTokens();
    error TokenVesting__InvalidBeneficiary_revokeVesting();
    error TokenVesting__VestingAlreadyRevoked_revokeVesting();
    




    /*Type Declarations*/
    /**
     * @dev Represents a vesting schedule for a beneficiary.
     * @param category The category associated with the vesting schedule.
     * @param beneficiaryAllocation Total tokens allocated for the beneficiary.
     * @param released Tokens already released to the beneficiary.
     * @param start Start time of the vesting schedule.
     * @param cliff Cliff duration in seconds (tokens are locked until this time).
     * @param duration Total duration of the vesting schedule in seconds.
     * @param revoked Whether the vesting schedule has been revoked.
     */
    struct VestingSchedule {
        Category category; // Category.community or Category.devTeam or Category.devFund
        uint256 beneficiaryAllocation;
        uint256 released;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        bool revoked;
    }

    /**
     * @dev Represents a category for token allocation.
     * @param totalAllocation Total tokens allocated to the category.
     * @param remainingBalance Remaining tokens available in the category.
     */
    struct CategoryBalance {
        uint256 totalAllocation;
        uint256 remainingBalance;
    }

    enum Category {
        community,
        privateSale, // vesting schedule
        foundingTeam, // vesting schedule
        devTeam, // vesting schedule
        devFund,
        communityFund
    }

    // The WagaToken contract, which supports minting
    IERC20Mintable public immutable i_token;

    // Mapping to track categories (both vesting and non-vesting)
    mapping(Category => CategoryBalance) private s_categories;

    // Mapping to track vesting schedules for each beneficiary
    mapping(address => VestingSchedule) private s_vestingSchedules; // vestingSchedules[beneficiary] = ....

    // Events for logging key actions
    event VestingScheduleCreated(
        address indexed beneficiary,
        Category category,
        uint256 beneficiaryAllocation,
        uint256 start,
        uint256 cliffDuration,
        uint256 vestingDuration
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 refund);
    event TokensDistributed(
        Category category,
        address indexed beneficiary,
        uint256 amount
    );

    /**
     * @dev Constructor to initialize the contract with the WagaToken address.
     * @param _token The address of the WagaToken contract.
     */
    constructor(IERC20Mintable _token) Ownable(msg.sender) {
        i_token = _token;
    }

    /**
     * @dev Initializes a category with a specified allocation.
     * @param category The name of the category.
     * @param allocation The total allocation for the category.
     */
    // tokenVesting.initializeCategory(Category.devFund, 100_000_000 ether);
    function initializeCategory(
        Category category, //Category.devFund
        uint256 allocation 
    ) external onlyOwner {
        if (s_categories[category].totalAllocation != 0) {
            revert TokenVesting__CategoryAlreadyInitialized_initializeCategory();
        }
        if (allocation == 0) { // 100_000_000 ether and not 0 or nothing
            revert TokenVesting__AllocationValueIsZero_initializeCategory();
        }
        s_categories[category] = CategoryBalance({
            totalAllocation: allocation,
            remainingBalance: allocation
          
        });
    }

  
    /**
     * @dev Creates a vesting schedule for a beneficiary.
     * @param beneficiary The address of the beneficiary.
     * @param category The category associated with the vesting schedule.
     * @param beneficiaryAllocation The total tokens allocated for the beneficiary.
     * @param start The start time of the vesting schedule.
     * @param cliffDuration The cliff duration in seconds.
     * @param vestingDuration The total duration of the vesting schedule in seconds.
     */
    function createVestingSchedule(
        address beneficiary,
        Category category, //Category.devTeam
        uint256 beneficiaryAllocation, // 5_000_000 ether
        uint256 start,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        if (s_vestingSchedules[beneficiary].beneficiaryAllocation != 0) {
            revert TokenVesting__VestingAlreadyExists_createVestingSchedule();
        }
        if (beneficiary == address(0)) {
            revert TokenVesting__InvalidBeneficiary_createVestingSchedule();
        }
                                             
        if (s_categories[category].remainingBalance < beneficiaryAllocation) {
            revert TokenVesting__InsufficientCategoryBalance_createVestingSchedule();
        }
        if (cliffDuration > vestingDuration) {
            revert TokenVesting__CliffExceedsDuration_createVestingSchedule();
        }
        // require(vestingSchedules[beneficiary].beneficiaryAllocation == 0, "Vesting already exists");
        // require(beneficiary != address(0), "Invalid beneficiary");
        // require(categories[category].remainingBalance >= beneficiaryAllocation, "Insufficient category balance");
        // require(cliffDuration <= vestingDuration, "Cliff exceeds duration");
        // Deduct the allocation from the category's remaining balance

        s_categories[category].remainingBalance -= beneficiaryAllocation;

        // Create the vesting schedule
        // @audit: This should come before the minting of tokens
        s_vestingSchedules[beneficiary] = VestingSchedule({
            category: category,
            beneficiaryAllocation: beneficiaryAllocation,
            released: 0,
            start: start,
            cliff: start + cliffDuration,
            duration: vestingDuration,
            revoked: false
        });

         // Mint tokens to the contract for vesting
        i_token.mint(address(this), beneficiaryAllocation);
        emit VestingScheduleCreated(
            beneficiary,
            category,
            beneficiaryAllocation,
            start,
            cliffDuration,
            vestingDuration
        );
        
    }

    /**
     * @dev Releases vested tokens to the beneficiary.
     * @param beneficiary The address of the beneficiary.
     */
    function releaseTokens(address beneficiary) external {
        // check for zero address
        if (beneficiary == address(0)) {
            revert TokenVesting__InvalidBeneficiary_createVestingSchedule();
        }
        // retrieve the vesting schedule for the beneficiary
        VestingSchedule storage schedule = s_vestingSchedules[beneficiary];
        // Check if the cliff period has been reached
        if (block.timestamp < schedule.cliff) {
            revert TokenVesting__CliffNotReached_releaseTokens();
        }
        // Check if the vesting schedule has been revoked
        //require(!schedule.revoked, "Vesting revoked"); //schedule.revoked = true; ==> !schedule.revoked = false => require should fail beacause schedule is revoked
        if (schedule.revoked) {
            revert TokenVesting__VestingRevoked_releaseTokens();
        }
        // Retrieve the amount of tokens to be vested
        uint256 vestedAmount = _vestedAmount(schedule);
        uint256 releasable = vestedAmount - schedule.released;
        // Total Allocation = 120
        // June: VestedAmount = 60
        // Schedule Released = 30
        // June: Releasable = 60 - 30 = 30
        // Balance = 120 - 30 - 30 = 60

        if (releasable <= 0) {
            revert TokenVesting__NoTokensToRelease_releaseTokens();
        }
        //require(releasable > 0, "No tokens to release");

        schedule.released += releasable;
        i_token.transfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable);
    }

    /**
     * @dev Distributes tokens for non-vesting categories.
     * @param category The category from which tokens are distributed.
     * @param beneficiary The address of the beneficiary.
     * @param amount The amount of tokens to distribute.
     */
    function distributeTokens(
        Category category,
        address beneficiary,
        uint256 amount
    ) external onlyOwner {
        // Check if the category is a vesting category
        if (
            category == Category.privateSale ||
            category == Category.foundingTeam ||
            category == Category.devTeam
        ) {
            revert TokenVesting__ShouldBeNonVestingCategory_distributeTokens();
        }
        // Check the category's remaining balance
        if (s_categories[category].remainingBalance < amount) {
            revert TokenVesting__InsufficientCategoryBalance_distributeTokens();
        }
        // require(
        //     s_categories[category].remainingBalance >= amount,
        //     "Insufficient category balance"
        // );

        // Deduct the amount from the category's remaining balance
        s_categories[category].remainingBalance -= amount;

        // Transfer tokens to the beneficiary
        i_token.mint(beneficiary, amount);

        emit TokensDistributed(category, beneficiary, amount);
    }

    /**
     * @dev Revokes a vesting schedule and returns unreleased tokens to the category.
     * @param beneficiary The address of the beneficiary.
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        // Check if the beneficiary is a zero address
        if (beneficiary == address(0)) {
            revert TokenVesting__InvalidBeneficiary_createVestingSchedule();
        }
        VestingSchedule storage schedule = s_vestingSchedules[beneficiary];
        // Check if the vesting schedule has been revoked
        if (schedule.revoked) {
            revert TokenVesting__VestingAlreadyRevoked_revokeVesting();
        }

        uint256 unreleased = schedule.beneficiaryAllocation - schedule.released;
        schedule.revoked = true;

        // Return the unreleased tokens to the category's remaining balance
        s_categories[schedule.category].remainingBalance += unreleased;

        i_token.transfer(address(i_token), unreleased);

        emit VestingRevoked(beneficiary, unreleased);
    }

    /**
     * @dev Calculates the vested amount for a given schedule.
     * @param schedule The vesting schedule.
     * @return The amount of tokens vested.
     */
    function _vestedAmount(
        VestingSchedule memory schedule
    ) internal view returns (uint256) {
        // Check if the cliff period has been reached
        if (block.timestamp < schedule.cliff) {
            return 0;
        // Check for full vesting
        } else if (block.timestamp >= schedule.start + schedule.duration) {
            return schedule.beneficiaryAllocation;
        // check for partial vesting
        } else {
            uint256 timeElapsed = block.timestamp - schedule.start;
            return
                (schedule.beneficiaryAllocation * timeElapsed) /
                schedule.duration;
        }
    }

    /* Getters */

    function getCategoryAllocation(
        Category category //Category.community
    ) external view returns (uint256) {
        return s_categories[category].totalAllocation;
        // return categories[Category.community].totalAllocation;
    }

    function getCategoryBalance(
        Category category
    ) external view returns (uint256) {
        return s_categories[category].remainingBalance;
    }

    function getVestingSchedule(
        address beneficiary
    ) external view returns (VestingSchedule memory) {
        return s_vestingSchedules[beneficiary];
    }
}


  
        // } else if (
        //     block.timestamp >= schedule.start + schedule.duration ||
        //     schedule.revoked
        // ) {
        //     return schedule.beneficiaryAllocation;