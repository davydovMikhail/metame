// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Metame is ERC20, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    mapping(address => bool) public whitelist;
    mapping(address => bool) public blocklist;

    constructor() ERC20("Metame token", "MTM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender); 
        _setRoleAdmin(PAUSER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(BURNER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CONTROLLER_ROLE, ADMIN_ROLE);
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address to, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(to, amount);
    }

    function changeWhitelist(address user, bool status) public onlyRole(CONTROLLER_ROLE) {
        whitelist[user] = status;
    }

    function changeBlocklist(address user, bool status) public onlyRole(CONTROLLER_ROLE) {
        blocklist[user] = status;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!blocklist[from] && !blocklist[to], "You are blocklisted.");
        if (paused()) {
            require(whitelist[msg.sender], "You are not whitelisted.");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
