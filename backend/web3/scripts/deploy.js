const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SKKM = await ethers.getContractFactory("SKKM");
    const skkm = await SKKM.deploy();

    await skkm.deployed();

    console.log("Contract Address:", skkm.address);

    // Save the contract address to a file
    const addresses = {
        contractAddress: skkm.address,
    };

    const addressesPath = path.join(__dirname, '../contractaddress.json');
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

    console.log(`Contract address saved to ${addressesPath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
