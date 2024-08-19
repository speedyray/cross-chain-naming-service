//Import required libraries
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CCIPLocalSimulator, CrossChainNameServiceRegister, CrossChainNameServiceReceiver, CrossChainNameServiceLookup } from "../typechain-types";

// Test suite for the CCIP Cross-Chain Name Service (CCIP)
describe("Creating Tests for Cross-Chain Name Service (CCIP)", function () {
  let ccipSimulator: CCIPLocalSimulator;
  let ccnsRegister: CrossChainNameServiceRegister;
  let ccnsReceiver: CrossChainNameServiceReceiver;
  let sourceCcnsLookup: CrossChainNameServiceLookup;
  let destinationCcnsLookup: CrossChainNameServiceLookup;
  let alice: Signer;

  before(async function () {
    // Retrieve the list of available signers. Alice will be used as the primary test user.
    [, alice] = await ethers.getSigners();

    // Deploy the CCIPLocalSimulator contract which simulates cross-chain communication locally.
    ccipSimulator = await (await ethers.getContractFactory("CCIPLocalSimulator")).deploy();
    await ccipSimulator.deployed();

    // Fetch essential configuration data from the deployed simulator, such as the addresses of the source and destination routers and the chain selector ID.
    const { sourceRouter_, destinationRouter_, chainSelector_ } = await ccipSimulator.configuration();

    // Deploy the CrossChainNameServiceLookup contract for the source chain. This contract allows name lookups on the source chain.
    sourceCcnsLookup = await (await ethers.getContractFactory("CrossChainNameServiceLookup")).deploy();
    await sourceCcnsLookup.deployed();

    // Deploy the CrossChainNameServiceRegister contract, which will be responsible for managing domain name registrations on the source chain.
    ccnsRegister = await (await ethers.getContractFactory("CrossChainNameServiceRegister")).deploy(sourceRouter_, sourceCcnsLookup.address);
    await ccnsRegister.deployed();

    // Deploy the CrossChainNameServiceLookup contract for the destination chain. This allows name lookups on the destination chain.
    destinationCcnsLookup = await (await ethers.getContractFactory("CrossChainNameServiceLookup")).deploy();
    await destinationCcnsLookup.deployed();

    // Deploy the CrossChainNameServiceReceiver contract, which will handle the reception of cross-chain data on the destination chain.
    ccnsReceiver = await (await ethers.getContractFactory("CrossChainNameServiceReceiver")).deploy(destinationRouter_, destinationCcnsLookup.address, chainSelector_);
    await ccnsReceiver.deployed();

    // Enable cross-chain operations by setting up the destination chain in the CrossChainNameServiceRegister contract. This involves linking the destination chain's receiver contract and defining a gas limit for cross-chain transactions.
    await (await ccnsRegister.enableChain(chainSelector_, ccnsReceiver.address, 100_000n)).wait();

    // Configure the lookup contracts on both chains to recognize the addresses of their corresponding service contracts. This step ensures that name lookups on both the source and destination chains are correctly routed to the appropriate service contracts.
    await (await sourceCcnsLookup.setCrossChainNameServiceAddress(ccnsRegister.address)).wait();
    await (await destinationCcnsLookup.setCrossChainNameServiceAddress(ccnsReceiver.address)).wait();
  });

  // Test case to verify that a name can be registered on the source chain and correctly resolved on both the source and destination chains.
  it("should register and resolve a name across chains", async function () {
    const name = "alice.ccns";  // The domain name to be registered

    // Register the name on the source chain using Alice's account.
    await (await ccnsRegister.connect(alice).register(name)).wait();

    // Perform a lookup on the source chain to verify that the name resolves to Alice's address.
    const resolvedAddressSource = await sourceCcnsLookup.lookup(name);
    expect(resolvedAddressSource).to.equal(await alice.getAddress());

    // Perform a lookup on the destination chain to verify that the name also resolves to Alice's address there, confirming cross-chain resolution.
    const resolvedAddressDestination = await destinationCcnsLookup.lookup(name);
    expect(resolvedAddressDestination).to.equal(await alice.getAddress());
  });
});









