# Metame token

Contract functions and their description:

1. pause() - the function that puts the contract on pause, during the pause, users can transfer tokens only from the whitelist. The function can only be called by the owner of the PAUSER_ROLE role.

2. unpause() - the function that removes the contract from pause. The function can only be called by the owner of the PAUSER_ROLE role.

3. mint(address to, uint256 amount) - minting of new tokens. The function can only be called by the owner of the MINTER_ROLE role.

4. burn(address to, uint256 amount) - burning existing tokens. The function can only be called by the owner of the BURNER_ROLE role.

5. changeWhitelist(address user, bool status) - function for adding/removing users to whitelist. The function can only be called by the owner of the ADMIN_ROLE role.

6. changeBlocklist(address user, bool status) - function for adding/removing users to blocklist. Users added to the blocklist can never transfer tokens at all. The function can only be called by the owner of the ADMIN_ROLE role.

# The order of deployment in the Ethereum network:

1. Fill in the file .env following the example from .env-example

2. Call the deploy script.ts with the following command:

```shell
npx hardhat run scripts/deploy.ts --network mainnet
```
