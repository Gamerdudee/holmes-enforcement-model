// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Holmes Enforcement License Contract (HEM v1)
/// @notice Tokenizes and enforces royalty obligations based on structural derivative use

contract HolmesEnforcementLicense {
    address public owner;
    address public heir;

    uint256 public baseRoyaltyRate = 1000; // Basis points (10%)

    struct License {
        address licensee;
        string usageType;
        uint256 amountPaid;
        uint256 timestamp;
        bool active;
    }

    mapping(address => License[]) public licenseRecords;
    mapping(bytes32 => bool) public recordedViolations;

    event LicensePurchased(address indexed licensee, string usageType, uint256 amount);
    event ViolationFiled(address indexed violator, string detailsHash);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner may perform this action.");
        _;
    }

    constructor(address _heir) {
        owner = msg.sender;
        heir = _heir;
    }

    function purchaseLicense(string memory _usageType) external payable {
        require(msg.value > 0, "Payment required.");

        License memory newLicense = License({
            licensee: msg.sender,
            usageType: _usageType,
            amountPaid: msg.value,
            timestamp: block.timestamp,
            active: true
        });

        licenseRecords[msg.sender].push(newLicense);
        emit LicensePurchased(msg.sender, _usageType, msg.value);
    }

    function fileViolation(address _violator, string memory _detailsHash) external onlyOwner {
        bytes32 key = keccak256(abi.encodePacked(_violator, _detailsHash));
        require(!recordedViolations[key], "Violation already filed.");
        recordedViolations[key] = true;

        emit ViolationFiled(_violator, _detailsHash);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address.");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    function claimInheritance() external {
        require(msg.sender == heir, "Only designated heir may claim.");
        owner = heir;
    }

    receive() external payable {}
    fallback() external payable {}
}
