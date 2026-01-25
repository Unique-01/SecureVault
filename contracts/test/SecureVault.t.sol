// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/SecureVault.sol";

contract SecureVaultTest is Test {
    SecureVault vault;

    address user1;
    address user2;

    uint256 constant INITIAL_BALANCE = 10 ether;
    uint256 constant DEPOSIT_AMOUNT = 10 ether;
    uint256 constant WITHDRAWAL_AMOUNT = 1 ether;

    function setUp() public {
        user1 = address(1);
        user2 = address(2);

        vault = new SecureVault();

        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
    }

    function testDepositIncreasesBalance() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        assertEq(vault.getBalance(), DEPOSIT_AMOUNT);
        assertEq(address(vault).balance, DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testDepositRevertsIfZero() public {
        vm.prank(user1);

        vm.expectRevert();

        vault.deposit{value: 0}();
    }

    function testRequestWithdrawalLockFunds() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        assertEq(vault.pendingWithdrawals(user1), WITHDRAWAL_AMOUNT);

        vm.stopPrank();
    }

    function testRequestWithdrawalRevertsIfZero() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vm.expectRevert();

        vault.requestWithdrawal(0);

        vm.stopPrank();
    }

    function testRequestWithdrawalRevertsIfInsufficientBalance() public {
        vm.startPrank(user1);
        vault.deposit{value: 0.1 ether}();

        vm.expectRevert();

        vault.requestWithdrawal(0.2 ether);

        vm.stopPrank();
    }

    function testWithdrawalRevertsIfPendingRequestExists() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();

        vault.requestWithdrawal(0.3 ether);

        vm.stopPrank();
    }

    function testRequestWithdrawalDecreaseUserVaultBalance() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.stopPrank();

        assertEq(vault.balances(user1), DEPOSIT_AMOUNT - WITHDRAWAL_AMOUNT);
    }

    function testClaimPendingWithdrawalTransferFunds() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.warp(block.timestamp + 1 days);

        uint256 userBalanceBefore = user1.balance;

        vault.claimPendingWithdrawal();

        vm.stopPrank();

        assertEq(address(vault).balance, DEPOSIT_AMOUNT - WITHDRAWAL_AMOUNT);
        assertEq(user1.balance, userBalanceBefore + WITHDRAWAL_AMOUNT);
    }

    function testClaimWithdrawalRevertsIfNone() public {
        vm.prank(user1);

        vm.expectRevert();

        vault.claimPendingWithdrawal();
    }

    function testClaimPendingWithdrawalRevertsBeforeLockExpires() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();
        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();
        vault.claimPendingWithdrawal();

        vm.stopPrank();
    }

    function testClaimPendingWithdrawalResetsPendingWithdrawal() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.warp(block.timestamp + 1 days);

        vault.claimPendingWithdrawal();

        assertTrue(vault.pendingWithdrawals(user1) == 0);

        vm.stopPrank();
    }

    function testModifyPendingWithdrawalUpdatesAmountAndResetsLock() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.warp(block.timestamp + 1 hours);

        vault.modifyPendingWithdrawal(5 ether);

        assertEq(vault.pendingWithdrawals(user1), 5 ether);
        assertEq(vault.withdrawalRequestTime(user1), block.timestamp);

        vm.stopPrank();
    }

    function testModifyPendingWithdrawalRevertsIfNoPendingWithdrawal() public {
        vm.prank(user1);

        vm.expectRevert();

        vault.modifyPendingWithdrawal(2 ether);
    }

    function testModifyPendingWithdrawalRevertsIfZero() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();

        vault.modifyPendingWithdrawal(0);

        vm.stopPrank();
    }

    function testModifyPendingWithdrawalRevertsIfSameAmount() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();
        vault.modifyPendingWithdrawal(WITHDRAWAL_AMOUNT);

        vm.stopPrank();
    }

    function testModifyPendingWithdrawalRevertsIfExceedsBalance() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();
        vault.modifyPendingWithdrawal(DEPOSIT_AMOUNT + 10 ether);

        vm.stopPrank();
    }

    function testModifyPendingWithdrawalUpdatesUserVaultBalance() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vault.modifyPendingWithdrawal(3 ether);

        assertEq(vault.balances(user1), DEPOSIT_AMOUNT - 3 ether);

        vm.stopPrank();
    }

    function testCancelPendingWithdrawalReturnsFunds() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vault.cancelPendingWithdrawal();

        assertEq(vault.balances(user1), DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testCancelPendingWithdrawalRevertsIfNoPendingWithdrawal() public {
        vm.prank(user1);

        vm.expectRevert();
        vault.cancelPendingWithdrawal();
    }

    function testCancelPendingWithdrawalRevertsIfTooSoon() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vault.cancelPendingWithdrawal();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vm.expectRevert();
        vault.cancelPendingWithdrawal();

        vm.stopPrank();
    }

    function testCancelPendingWithdrawalResetsPendingWithdrawal() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vault.cancelPendingWithdrawal();

        assertEq(vault.pendingWithdrawals(user1), 0);

        vm.stopPrank();
    }

    function testCancelPendingWithdrawalUpdatesLastCancelTime() public {
        vm.startPrank(user1);

        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);

        vault.cancelPendingWithdrawal();

        assertEq(vault.lastWithdrawalCancelTime(user1), block.timestamp);

        vm.stopPrank();
    }

    function testGetPendingWithdrawalReturnsCorrectValues() public {
        vm.startPrank(user1);
        vault.deposit{value: DEPOSIT_AMOUNT}();

        vault.requestWithdrawal(WITHDRAWAL_AMOUNT);
        uint256 expectedRequestTime = block.timestamp;

        (
            uint256 amount,
            uint256 requestTime,
            uint256 unlockTime,
            uint256 timeLeft
        ) = vault.getPendingWithdrawal();

        assertEq(amount, WITHDRAWAL_AMOUNT);
        assertEq(requestTime, expectedRequestTime);
        assertEq(unlockTime, block.timestamp + vault.withdrawalLockedPeriod());
        assertEq(timeLeft, vault.withdrawalLockedPeriod());

        vm.warp(block.timestamp + 10 days);

        (, , , timeLeft) = vault.getPendingWithdrawal();

        assertEq(timeLeft, 0);

        vm.stopPrank();
    }

    function testGetBalanceReturnsCorrectAmount() public {
        vm.prank(user1);
        vault.deposit{value: DEPOSIT_AMOUNT}();

        vm.prank(user1);
        assertEq(vault.getBalance(), DEPOSIT_AMOUNT);

        vm.prank(user2);
        assertEq(vault.getBalance(), 0);
    }
}
