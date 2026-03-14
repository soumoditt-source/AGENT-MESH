const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AgentRegistry with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  console.log("\nDeploying to Avalanche Fuji Testnet…");
  const registry = await Registry.deploy();

  await registry.waitForDeployment();
  const addr = await registry.getAddress();

  console.log("\n✅ AgentRegistry deployed to:", addr);
  console.log("\n📋 Next steps:");
  console.log("  1. Add to .env:  REGISTRY_ADDRESS=" + addr);
  console.log("  2. Verify:       npx hardhat verify --network fuji " + addr);
  console.log("  3. Snowtrace:    https://testnet.snowtrace.io/address/" + addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
