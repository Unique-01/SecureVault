// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title SecureVault
/// @author Saheed Abdulazeez
/// @notice A vault that enforces a 24 hour lock on all withdrawals to enhance security
/// @dev This contract inherits from OpenZeppelin's ReentrancyGuard for CEI pattern safety.
contract SecureVault is ReentrancyGuard {
    // ----- Events ---------

    /// @notice Emitted when a user deposits funds into the vault.
    /// @param user The address of the depositor.
    /// @param amount The amount of ETH deposited.
    event UserDeposited(address indexed user, uint256 amount);

    /// @notice Emitted when a withdrawal request is initiated.
    /// @param user The address of user making the withdrawal request
    /// @param amount The amount o ETH requested for withdrawal
    /// @param requestTime The time the withdrawal was requested
    event UserRequestedWithdrawal(
        address indexed user,
        uint256 amount,
        uint256 requestTime
    );

    /// @notice Emitted when a user successfully claims their funds after the lock period.
    /// @param user The address of the user that made the withdrawal
    /// @param amount The amount of ETH withdrawn
    event UserWithdrawn(address indexed user, uint256 amount);

    /// @notice Emitted when an existing withdrawal request is updated
    /// @param user The address of the user that made changes to the requested withdrawal
    /// @param previousAmount The previous amount requested to be withdraw
    /// @param newAmount The new amount requested to be withdraw
    event UserModifiedPendingWithdrawal(
        address indexed user,
        uint256 previousAmount,
        uint256 newAmount
    );

    /// @notice Emitted when a pending withdrawal has been cancelled and funds returned to balance
    /// @param user The address of the user cancelling the request
    event UserCancelledPendingWithdrawal(address indexed user);

    // ------- State Variables ---------

    /// @notice Returns the amount currently locked in a withdrawal request
    mapping(address => uint256) public pendingWithdrawals;

    /// @notice Returns the timestamp when the user current withdrawal request was made
    mapping(address => uint256) public withdrawalRequestTime;

    /// @notice Returns the available balance for a user excluding the pending withdrawals
    mapping(address => uint256) public balances;

    /// @notice Returns the last time a user cancelled a withdrawal request to prevent spam
    mapping(address => uint256) public lastWithdrawalCancelTime;

    /// @notice The cool-down period between two withdrawal cancellations
    uint256 public withdrawalCancelDelay = 2 hours;

    /// @notice The duration funds must remain locked after withdrawal request before they can be claimed
    uint256 public constant withdrawalLockedPeriod = 1 days;

    /// @notice Deposit ETH into the Vault
    /// @dev Updates the balances mapping and emits UserDeposited
    function deposit() external payable {
        require(msg.value > 0, "Amount to be deposited must be greater than 0");

        balances[msg.sender] += msg.value;

        emit UserDeposited(msg.sender, msg.value);
    }

    /// @notice Initiates a withdrawal request, locking the funds for 24 hours before they can be claimed
    /// @param _amount Th amount requested for withdrawal
    function requestWithdrawal(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount to be withdraw must be greater than 0");
        require(
            balances[msg.sender] >= _amount,
            "Insufficient balance to withdraw from"
        );
        require(
            pendingWithdrawals[msg.sender] == 0,
            "You must complete a pending withdrawal before requesting another"
        );

        balances[msg.sender] -= _amount;

        withdrawalRequestTime[msg.sender] = block.timestamp;

        pendingWithdrawals[msg.sender] = _amount;

        emit UserRequestedWithdrawal(
            msg.sender,
            _amount,
            withdrawalRequestTime[msg.sender]
        );
    }

    /// @notice Claims funds from a completed withdrawal request
    /// @dev This function uses the Checks-Effects-Interaction pattern
    function claimPendingWithdrawal() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];

        require(amount > 0, "You have no pending withdrawals");

        require(
            block.timestamp >=
                withdrawalRequestTime[msg.sender] + withdrawalLockedPeriod,
            "Withdrawal delay is yet to elapsed"
        );

        pendingWithdrawals[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdrawal failed");

        delete withdrawalRequestTime[msg.sender];

        emit UserWithdrawn(msg.sender, amount);
    }

    /// @notice Updates the amount of an existing withdrawal request
    /// @dev Resets the 24 hour lock period upon modification
    /// @param _newAmount The new amount to e pending for withdrawal
    function modifyPendingWithdrawal(uint256 _newAmount) external nonReentrant {
        uint256 previousAmount = pendingWithdrawals[msg.sender];

        require(previousAmount > 0, "You don't have any pending withdrawals");

        require(
            _newAmount <= balances[msg.sender] + previousAmount,
            "Insufficient balance for new withdrawal request"
        );

        require(
            _newAmount > 0,
            "New Amount cannot be zero, use cancelPendingWithdrawal to cancel instead"
        );

        require(
            _newAmount != previousAmount,
            "New amount cannot be the same the previous one"
        );

        pendingWithdrawals[msg.sender] = 0;

        balances[msg.sender] += previousAmount;

        balances[msg.sender] -= _newAmount;

        withdrawalRequestTime[msg.sender] = block.timestamp;

        pendingWithdrawals[msg.sender] = _newAmount;

        emit UserModifiedPendingWithdrawal(
            msg.sender,
            previousAmount,
            _newAmount
        );
    }

    /// @notice Cancels a pending withdrawal and returns funds to the available balance
    /// @dev Enforces a 2-hour cool-down period between cancellations
    function cancelPendingWithdrawal() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "You don't have a pending withdrawal");

        uint256 lastCancel = lastWithdrawalCancelTime[msg.sender];
        if (lastCancel > 0) {
            require(
                block.timestamp >= lastCancel + withdrawalCancelDelay,
                "You must wait 2 hours before cancelling again!"
            );
        }

        pendingWithdrawals[msg.sender] = 0;

        balances[msg.sender] += amount;

        lastWithdrawalCancelTime[msg.sender] = block.timestamp;

        delete withdrawalRequestTime[msg.sender];

        emit UserCancelledPendingWithdrawal(msg.sender);
    }

    /// @notice Returns details regarding a user's pending withdrawal.
    /// @return amount Total ETH pending for withdrawal.
    /// @return requestTime Timestamp of when the request was made.
    /// @return unlockTime Timestamp of when the withdrawal request is claimable.
    /// @return timeLeft Time remaining until unlock.
    function getPendingWithdrawal()
        external
        view
        returns (
            uint256 amount,
            uint256 requestTime,
            uint256 unlockTime,
            uint256 timeLeft
        )
    {
        amount = pendingWithdrawals[msg.sender];
        requestTime = withdrawalRequestTime[msg.sender];
        unlockTime = requestTime + withdrawalLockedPeriod;
        timeLeft = (block.timestamp >= unlockTime)
            ? 0
            : unlockTime - block.timestamp;

        return (amount, requestTime, unlockTime, timeLeft);
    }

    /// @notice Returns the available balance of the caller.
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}
