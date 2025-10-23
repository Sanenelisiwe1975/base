import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Deploying IncidentRegistry contract...");

  // Get the contract factory
  const IncidentRegistry = await ethers.getContractFactory("IncidentRegistry");

  // Deploy the contract
  const incidentRegistry = await IncidentRegistry.deploy();

  // Wait for deployment to complete
  await incidentRegistry.waitForDeployment();

  const contractAddress = await incidentRegistry.getAddress();
  
  console.log("IncidentRegistry deployed to:", contractAddress);

  // Verify the contract on Basescan (if on mainnet/testnet)
  if (process.env.ETHERSCAN_API_KEY && process.env.HARDHAT_NETWORK !== "localhost") {
    console.log("Waiting for block confirmations...");
    await incidentRegistry.deploymentTransaction()?.wait(5);

    console.log("Verifying contract on Basescan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: process.env.HARDHAT_NETWORK || "localhost",
    deployedAt: new Date().toISOString(),
    deployer: (await ethers.getSigners())[0].address,
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentPath = join(__dirname, "../deployments.json");
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment info saved to:", deploymentPath);
  console.log("\nTo use this contract, update your .env file with:");
  console.log(`NEXT_PUBLIC_INCIDENT_REGISTRY_ADDRESS=${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});