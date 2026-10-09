// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockERC20} from "./MockERC20.sol";

interface IFlashLoanReceiver {
    function executeOperation(address token, uint256 amount, uint256 fee, bytes calldata params) external returns (bool);
}

contract MockFlashLoanPool {
    error FlashLoanFailed();

    function flashLoan(address receiver, address token, uint256 amount, bytes calldata params) external {
        uint256 balanceBefore = MockERC20(token).balanceOf(address(this));
        uint256 fee = (amount * 9) / 10000;

        MockERC20(token).transfer(receiver, amount);

        require(
            IFlashLoanReceiver(receiver).executeOperation(token, amount, fee, params),
            "Flash loan execution failed"
        );

        uint256 balanceAfter = MockERC20(token).balanceOf(address(this));
        if (balanceAfter < balanceBefore + fee) revert FlashLoanFailed();
    }
}
