// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the IERC20 interface for interacting with the WagaToken contract
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Extend IERC20 to include the mint function, specific to WagaToken
interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

// Import OpenZeppelin utilities for ownership and cryptographic operations
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenVesting
 * @dev This contract handles token vesting schedules and category-based allocations.
 * It interacts with the WagaToken contract to mint and transfer tokens.
 */
contract TokenVesting is Ownable {
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
        Category category;
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
    IERC20Mintable public immutable token;

    // Mapping to track categories (both vesting and non-vesting)
    mapping(Category => CategoryBalance) public categories;

    // Mapping to track vesting schedules for each beneficiary
    mapping(address => VestingSchedule) public vestingSchedules; // vestingSchedules[beneficiary] = ....

    // Events for logging key actions
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 refund);
    event TokensDistributed(Category category, address indexed beneficiary, uint256 amount);

    /**
     * @dev Constructor to initialize the contract with the WagaToken address.
     * @param _token The address of the WagaToken contract.
     */
    constructor(IERC20Mintable _token) Ownable(msg.sender) {
        token = _token;
    }

    /**
     * @dev Initializes a category with a specified allocation.
     * @param category The name of the category.
     * @param allocation The total allocation for the category.
     */
    function initializeCategory(Category category, uint256 allocation) external onlyOwner {
        require(categories[category].totalAllocation == 0, "Category already initialized");
        categories[category] = CategoryBalance({
            totalAllocation: allocation,
            remainingBalance: allocation
            // categories[Category.community].remainingBalance = allocation
            // initialiseCategory(Category(0), allocation)
        });
    }

    // function initializeCategory(Category category, uint256 allocation) external onlyOwner {
    //     require(categories[Category.community].totalAllocation == 0, "Category already initialized");

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
        Category category, //Category.community
        uint256 beneficiaryAllocation,
        uint256 start,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        require(vestingSchedules[beneficiary].beneficiaryAllocation == 0, "Vesting already exists");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(categories[category].remainingBalance >= beneficiaryAllocation, "Insufficient category balance");
        require(cliffDuration <= vestingDuration, "Cliff exceeds duration");

        // Deduct the allocation from the category's remaining balance
        categories[category].remainingBalance -= beneficiaryAllocation;

        // Mint tokens to the contract for vesting
        token.mint(address(this), beneficiaryAllocation);

        // Create the vesting schedule
        // @audit: This should come before the minting of tokens
        vestingSchedules[beneficiary] = VestingSchedule({
            category: category,
            beneficiaryAllocation: beneficiaryAllocation,
            released: 0,
            start: start,
            cliff: start + cliffDuration,
            duration: vestingDuration,
            revoked: false
        });
    }

    /**
     * @dev Releases vested tokens to the beneficiary.
     * @param beneficiary The address of the beneficiary.
     */
    function releaseTokens(address beneficiary) external {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(block.timestamp >= schedule.cliff, "Cliff not reached");
        require(!schedule.revoked, "Vesting revoked");

        uint256 vestedAmount = _vestedAmount(schedule);
        uint256 releasable = vestedAmount - schedule.released;
        require(releasable > 0, "No tokens to release");

        schedule.released += releasable;
        token.transfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable);
    }

    /**
     * @dev Distributes tokens for non-vesting categories.
     * @param category The category from which tokens are distributed.
     * @param beneficiary The address of the beneficiary.
     * @param amount The amount of tokens to distribute.
     */
    function distributeTokens(Category category, address beneficiary, uint256 amount) external onlyOwner {
        require(categories[category].remainingBalance >= amount, "Insufficient category balance");

        // Deduct the amount from the category's remaining balance
        categories[category].remainingBalance -= amount;

        // Transfer tokens to the beneficiary
        token.mint(beneficiary, amount);

        emit TokensDistributed(category, beneficiary, amount);
    }

    /**
     * @dev Revokes a vesting schedule and returns unreleased tokens to the category.
     * @param beneficiary The address of the beneficiary.
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(!schedule.revoked, "Already revoked");

        uint256 unreleased = schedule.beneficiaryAllocation - schedule.released;
        schedule.revoked = true;

        // Return the unreleased tokens to the category's remaining balance
        categories[schedule.category].remainingBalance += unreleased;

        token.transfer(address(token), unreleased);

        emit VestingRevoked(beneficiary, unreleased);
    }

    /**
     * @dev Calculates the vested amount for a given schedule.
     * @param schedule The vesting schedule.
     * @return The amount of tokens vested.
     */
    function _vestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.cliff) {
            return 0;
        } else if (block.timestamp >= schedule.start + schedule.duration || schedule.revoked) {
            return schedule.beneficiaryAllocation;
        } else {
            uint256 timeElapsed = block.timestamp - schedule.start;
            return (schedule.beneficiaryAllocation * timeElapsed) / schedule.duration;
        }
    }
}

