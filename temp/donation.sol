// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donations {
    // Mapping of donors to their total donations
    mapping (address => uint) public donors;

    // Event emitted when a donation is made
    event Donation(address indexed donor, address recipient, uint amount);

    // Function to deposit ethers to a specific user address
    function depositToUser(address _recipient) public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        donors[_recipient] += msg.value;
        emit Donation(msg.sender, _recipient, msg.value);
    }

    // Function to get a donor's total donations
    function getDonorTotal(address _donor) public view returns (uint) {
        return donors[_donor];
    }
}