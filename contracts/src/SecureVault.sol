// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureVault is ReentrancyGuard {
    event UserDeposited(address user, uint256 amount);
    event UserRequestedWithdrawal(
        address user,
        uint256 amount,
        uint256 requestTime
    );
    event UserWithdrawn(address user, uint256 amount);
    event UserModifiedPendingWithdrawal(
        address user,
        uint256 previousAmount,
        uint256 newAmount
    );
    event UserCancelledPendingWithdrawal(address user);

    mapping(address => uint256) public pendingWithdrawals;

    mapping(address => uint256) public withdrawalRequestTime;

    mapping(address => uint256) public balances;

    mapping(address => uint256) public lastWithdrawalCancelTime;

    uint256 public withdrawalCancelDelay = 2 hours;

    uint256 public constant withdrawalLockedPeriod = 1 days;

    // bool private locked;

    // modifier nonReentrant() {
    //     require(!locked, "Reentrancy Guard: reentrant call");
    //     locked = true;
    //     _;
    //     locked = false;
    // }

    function deposit() external payable {
        require(msg.value > 0, "Amount to be deposited must be greater than 0");

        balances[msg.sender] += msg.value;

        emit UserDeposited(msg.sender, msg.value);
    }

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

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}
