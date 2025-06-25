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

    error TokenVesting__CategoryAlreadyInitialized_initializeCategory(); //
    error TokenVesting__AllocationValueIsZero_initializeCategory(); //
    error TokenVesting__VestingAlreadyExists_createVestingSchedule(); //
    error TokenVesting__ZeroAddress_createVestingSchedule(); //
    error TokenVesting__InsufficientCategoryBalance_createVestingSchedule(); //
    error TokenVesting__CliffNotReached_releaseTokens(); //
    error TokenVesting__VestingRevoked_releaseTokens(); //
    error TokenVesting__NoTokensToRelease_releaseTokens(); //
    error TokenVesting__UnauthorisedCaller_releaseTokens(); //
    error TokenVesting__ShouldBeNonVestingCategory_distributeTokens(); //
    error TokenVesting__InsufficientCategoryBalance_distributeTokens(); //
    error TokenVesting__ZeroAddress_distributeTokens(); //
    error TokenVesting__AmountIsZero_distributeTokens(); //
    error TokenVesting__ZeroAddress_revokeVesting(); //
    error TokenVesting__VestingAlreadyRevoked_revokeVesting(); //
    error TokenVesting__ShouldOnlyBeVestingCategory_createVestingSchedule(); //
    error TokenVesting__CategoryDoesntExists_createVestingSchedule(); //
    error TokenVesting__ZeroAddress_releaseTokens(); //
    error TokenVesting__AllocationValueIsZero_createVestingSchedule(); //
    error TokenVesting__CliffDurationOutofRange_createVestingSchedule(); //
    error TokenVesting__VestingDurationOutofRange_createVestingSchedule(); //
    error TokenVesting__TransferFailed_releaseTokens(); //
    error TokenVesting__TransferFailed_revokeVesting(); //

    /*Type Declarations*/
    /**
     * @dev Represents a vesting schedule for a beneficiary.
     * @param category The category associated with the vesting schedule.
     * @param beneficiaryAllocation Total tokens allocated for the beneficiary.
     * @param released Tokens already released to the beneficiary.
     * @param start Start time of the vesting schedule. vesting schedule = start(block.timestamp) + cliffDuration + vestingDuration
     * @param cliff Cliff duration in seconds (tokens are locked until this time).
     * @param duration duration of the vesting schedule = start + cliffDuration + vestingDuration
     * @param revoked Whether the vesting schedule has been revoked.
     */
    struct VestingSchedule {
        Category category; // Category.community or Category.devTeam or Category.devFund
        uint256 beneficiaryAllocation;
        uint256 released;
        uint256 start;
        uint256 cliff; // start + cliffDuration
        uint256 duration; // = start + cliffDuration + vesting duration
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

    // Owner of the contract
    address private immutable i_contractOwner;
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
    event CategoryInitialized(
        Category indexed category,
        uint256 totalAllocation,
        uint256 remainingBalance
    );
    event balanceUpdated(Category indexed category, uint256 remainingBalance);

    /**
     * @dev Constructor to initialize the contract with the WagaToken address.
     * @param _token The address of the WagaToken contract.
     */
    constructor(IERC20Mintable _token) Ownable(msg.sender) {
        i_token = _token;
        i_contractOwner = msg.sender;
    }

    /**
     * @dev Initializes a category with a specified allocation.
     * @param category The name of the category.
     * @param allocation The total allocation for the category.
     */
    function initializeCategory(
        Category category, //Category.devFund
        uint256 allocation
    ) external onlyOwner {
        // check if the category is already initialized
        if (s_categories[category].totalAllocation != 0) {
            revert TokenVesting__CategoryAlreadyInitialized_initializeCategory();
        }
        if (_isValueZero(allocation)) {
            revert TokenVesting__AllocationValueIsZero_initializeCategory();
        }

        s_categories[category] = CategoryBalance({
            totalAllocation: allocation,
            remainingBalance: allocation
        });
        // emit event
        emit CategoryInitialized(
            category,
            allocation,
            s_categories[category].remainingBalance
        );
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
        uint256 start, // 90 days
        uint256 cliffDuration, // 1440 seconds * 365 days = 525600 seconds = 1 year
        uint256 vestingDuration
    ) external onlyOwner {
        // check for zero address
        if (_addressIsZero(beneficiary)) {
            revert TokenVesting__ZeroAddress_createVestingSchedule();
        }
        // Check if beneficiaryAllocation is greater than 0
        if (_isValueZero(beneficiaryAllocation)) {
            revert TokenVesting__AllocationValueIsZero_createVestingSchedule();
        }
        // Check if the category is a vesting category
        if (!_isVestingCategory(category)) {
            revert TokenVesting__ShouldOnlyBeVestingCategory_createVestingSchedule();
        }
        // Check if the cliff duration is valid
        if (!_isValidDuration(cliffDuration)) {
            revert TokenVesting__CliffDurationOutofRange_createVestingSchedule();
        }
        // Check if the vesting duration is valid
        if (!_isValidDuration(vestingDuration)) {
            revert TokenVesting__VestingDurationOutofRange_createVestingSchedule();
        }
        // check if the vesting schedule already exists for the beneficiary
        if (s_vestingSchedules[beneficiary].beneficiaryAllocation != 0) {
            revert TokenVesting__VestingAlreadyExists_createVestingSchedule();
        }
        // check that the category exists
        if (s_categories[category].totalAllocation == 0) {
            revert TokenVesting__CategoryDoesntExists_createVestingSchedule();
        }
        // Check if the category has enough remaining balance
        if (s_categories[category].remainingBalance < beneficiaryAllocation) {
            revert TokenVesting__InsufficientCategoryBalance_createVestingSchedule();
        }

        s_categories[category].remainingBalance -= beneficiaryAllocation;
        start += block.timestamp; 
        
        // Create the vesting schedule
        s_vestingSchedules[beneficiary] = VestingSchedule({
            category: category,
            beneficiaryAllocation: beneficiaryAllocation, //
            released: 0,
            start: start,
            cliff: start + cliffDuration, // Calculate cliff as start + cliffDuration
            duration: start + cliffDuration + vestingDuration,
            revoked: false
        });
        // emit Schedule Created  Event

        emit VestingScheduleCreated(
            beneficiary,
            category,
            beneficiaryAllocation,
            start,
            cliffDuration,
            vestingDuration
        );
        // Mint tokens to the contract for vesting
        i_token.mint(address(this), beneficiaryAllocation);
    }

    /**
     * @dev Releases vested tokens to the beneficiary.
     * @param beneficiary The address of the beneficiary.
     */
    function releaseTokens(address beneficiary) external {
        // check for zero address
        if (_addressIsZero(beneficiary)) {
            revert TokenVesting__ZeroAddress_releaseTokens();
        }
        // check if the beneficiary is the caller
        if (msg.sender != beneficiary && msg.sender != owner()) {
            revert TokenVesting__UnauthorisedCaller_releaseTokens();
        }
        // retrieve the vesting schedule for the beneficiary
        VestingSchedule storage schedule = s_vestingSchedules[beneficiary];
        // Check if the cliff period has been reached
        if (block.timestamp < schedule.cliff) {
            revert TokenVesting__CliffNotReached_releaseTokens();
        }
        // Check if the vesting schedule has been revoked
        if (schedule.revoked) {
            revert TokenVesting__VestingRevoked_releaseTokens();
        }
        // Retrieve the amount of tokens to be vested
        uint256 vestedAmount = _vestedAmount(schedule);
        uint256 releasable = vestedAmount - schedule.released;

        if (releasable <= 0) {
            revert TokenVesting__NoTokensToRelease_releaseTokens();
        }
        schedule.released += releasable;
        emit TokensReleased(beneficiary, releasable);
        bool success = i_token.transfer(beneficiary, releasable); // if ETh, we use (bool success,) = beneficiary.call{value: releasable}("");
        if (!success) {
            revert TokenVesting__TransferFailed_releaseTokens();
        }
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
        // Check if the beneficiary is a zero address
        if (_addressIsZero(beneficiary)) {
            revert TokenVesting__ZeroAddress_distributeTokens();
        }
        // Check if the amount is greater than 0
        if (amount <= 0) {
            revert TokenVesting__AmountIsZero_distributeTokens();
        }
        // Check if the category is a nonVesting category
        if (_isVestingCategory(category)) {
            revert TokenVesting__ShouldBeNonVestingCategory_distributeTokens();
        }
        // Check the category's remaining balance
        if (s_categories[category].remainingBalance < amount) {
            revert TokenVesting__InsufficientCategoryBalance_distributeTokens();
        }
        // Deduct the amount from the category's remaining balance
        s_categories[category].remainingBalance -= amount;
        // Emit the TokensDistributed event
        emit TokensDistributed(category, beneficiary, amount);
        // Transfer tokens to the beneficiary
        i_token.mint(beneficiary, amount);
    }

    /**
     * @dev Revokes a vesting schedule and returns unreleased tokens to the category.
     * @param beneficiary The address of the beneficiary.
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        // Check if the beneficiary is a zero address
        if (_addressIsZero(beneficiary)) {
            revert TokenVesting__ZeroAddress_revokeVesting();
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
        // emit remaining balance event
        emit balanceUpdated(
            schedule.category,
            s_categories[schedule.category].remainingBalance
        );
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
        if (block.timestamp < schedule.cliff) {
            return 0;
        } else if (block.timestamp > schedule.duration) {
            return schedule.beneficiaryAllocation;
        } else {
            uint256 timeElapsed = block.timestamp - schedule.cliff;
            // uint256 vestingDuration = schedule.duration -
            //     (schedule.cliff - schedule.start);
            uint256 vestingDuration = schedule.duration - schedule.cliff;

            return
                (schedule.beneficiaryAllocation * timeElapsed) /
                vestingDuration;
        }
    }

    /**
     * @dev Checks if the given category is a vesting category.
     * @param _category The category to check.
     * @return True if the category is a vesting category, false otherwise.
     */

    function _isVestingCategory(
        Category _category
    ) internal pure returns (bool) {
        return
            _category == Category.privateSale ||
            _category == Category.foundingTeam ||
            _category == Category.devTeam;
    }

    /**
     * @dev Checks if the given duration is valid.
     * @param _duration The duration to check.
     * @return True if the duration is valid, false otherwise.
     */

    function _isValidDuration(uint256 _duration) internal pure returns (bool) {
        return (_duration > 0 && _duration < 1460 days);
    }

    /**
     * @dev Checks if the provided address is zero.
     * @param _address The category to check.
     * @return True if the address is zero, false otherwise.
     */

    function _addressIsZero(address _address) internal pure returns (bool) {
        return (_address == address(0));
    }

    /**
     * @dev Checks if the value provided is zero.
     * @param _value The category to check.
     * @return True if the address is zero, false otherwise.
     */

    function _isValueZero(uint256 _value) internal pure returns (bool) {
        return (_value <= 0);
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

    function getOwner() external view returns (address) {
        return i_contractOwner;
    }
}

// vesting schedule = start + cliffDuration + vestingDuration
// vesting schedule = cliff + vestingDuration
// cliff = start + cliffDuration

// (100_000_000 ether * 250 0000) / 500 0000 => 100 000 000 ether * (250 0000 / 500 0000) => 50_000_000 ether

