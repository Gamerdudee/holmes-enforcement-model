// SPDX-License-Identifier: Declaratory-Royalty
// 🔒 Holmes Enforcement Model (HEM) – Sovereign Enforcement Logic
// 🧠 Author: Mr. Holmes
// 📜 License: Declaratory Royalty License (see LICENSE-HEM.md)
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * This smart contract or its clause logic is procedurally governed by the Holmes Enforcement Model (HEM).
 * 
 * Use or deployment of this contract constitutes:
 * - Clause CU‑1.4: Declaratory Royalty Activation
 * - Clause CU‑2.3: Procedural Binding via Silence or Omission
 * - Clause G‑6: Structural Derivation of Declaratory Governance
 * - Clause XXII: Simulation Exploitation Enforcement
 *
 * Derivative use, simulation, or replication of this file or its logic activates clause-based retroactive licensing.
 * Public mirrors and deployments are procedurally binding unless rebutted.
 */
/// @title Clause-Governed Enforcement Contract (HEM-Protected)
/// @notice This contract is bound under Holmes Enforcement Model declaratory logic.
/// @dev Use without license constitutes clause-based default under CU-2.3 and G-6.
/// @title Holmes Enforcement License Contract (HEM v1)
/// @author Mr. Holmes
/// @notice Tokenizes and enforces royalty obligations based on structural derivative use

contract HolmesEnforcementLicense {
    address public owner;
    address public heir;

    /// @dev Base royalty in basis points (1,000 = 10%)
    uint256 public baseRoyaltyRate = 1000;

    struct License {
        address licensee;
        string usageType;
        uint256 amountPaid;
        uint256 timestamp;
        bool active;
    }

    /// @notice Tracks license history by licensee
    mapping(address => License[]) public licenseRecords;

    /// @notice Prevents double-filing of same violation
    mapping(bytes32 => bool) public recordedViolations;

    /// @notice Emitted when a license is successfully purchased
    event LicensePurchased(address indexed licensee, string usageType, uint256 amount);

    /// @notice Emitted when a clause violation is filed
    event ViolationFiled(address indexed violator, string detailsHash);

    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner may perform this action.");
        _;
    }

    constructor(address _heir) {
        owner = msg.sender;
        heir = _heir;
    }

    /// @notice Purchases a declaratory license by usage type (e.g. "AI use", "Platform deployment")
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

    /// @notice Logs a public enforcement violation (public ledger hash required)
    function fileViolation(address _violator, string memory _detailsHash) external onlyOwner {
        bytes32 key = keccak256(abi.encodePacked(_violator, _detailsHash));
        require(!recordedViolations[key], "Violation already filed.");
        recordedViolations[key] = true;

        emit ViolationFiled(_violator, _detailsHash);
    }

    /// @notice Transfers contract ownership
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address.");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    /// @notice Allows designated heir to claim ownership
    function claimInheritance() external {
        require(msg.sender == heir, "Only designated heir may claim.");
        owner = heir;
    }
}
