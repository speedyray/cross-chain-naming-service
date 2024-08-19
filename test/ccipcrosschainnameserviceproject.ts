//import ethers and chai libraries for testing
import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CrossChainNameServiceRegister, CrossChainNameServiceReceiver, CrossChainNameServiceLookup, CCIPLocalSimulator } from "../typechain-types";

describe("CCIP Cross-Chain Name Service", function () {
  let ccipLocalSimulator: CCIPLocalSimulator;
  let alice: any;

  beforeEach(async function () {
    [alice] = await ethers.getSigners();
    const CCIPLocalSimulatorFactory = await ethers.getContractFactory("CCIPLocalSimulator");
    ccipLocalSimulator = await CCIPLocalSimulatorFactory.deploy();
    await ccipLocalSimulator.deployed();
  });

  it("Should get Router contract address from configuration", async function () {
    const config = await ccipLocalSimulator.configuration();
    const routerAddress = config.sourceRouter_;
    console.log("Router Contract Address:", routerAddress);
    expect(routerAddress).to.be.properAddress;
  });
});









// Creating Test suite for CCIP Cross Chain Name Service project
// describe("CrossChainNameService Testing", function () {
//     //Create an instance of CCIPLocalSimulator.sol smart contract
//     let ccipLocalSimulator: CCIPLocalSimulator;
//     //Create instances for contract services
//     let dest_ccnsLookup: CrossChainNameServiceLookup;
//     let ccnsRegister: CrossChainNameServiceRegister;
//     let ccnsReceiver: CrossChainNameServiceReceiver;
//     let ccnsLookup: CrossChainNameServiceLookup;

//      //initialize alice
//     let alice: any;

//     before(async function () {
//         //alice is used for this test
//         [alice] = await ethers.getSigners(); 

//         // Deploy SourceCCIPLocalSimulator
//         const SourceCCIPLocalSimulatorFactory = await ethers.getContractFactory("CCIPLocalSimulator");
//         ccipLocalSimulator = await SourceCCIPLocalSimulatorFactory.deploy();
//         await ccipLocalSimulator.deployed();

//         // Get configuration from CCIPLocalSimulator
//         const config = await ccipLocalSimulator.configuration();
//         console.log("CCIPLocalSimulator configuration:", config);

//         const {
//             chainSelector_,
//             sourceRouter_,
//             destinationRouter_,
//             wrappedNative_,
//             linkToken_,
//             ccipBnM_,
//             ccipLnM_
//         } = config;

//         console.log(`ℹ️  Attempting to deploy CrossChainNameServiceLookup`);

//         // Deploy CrossChainNameServiceLookup
//         const CCNSLookupFactory = await ethers.getContractFactory("CrossChainNameServiceLookup");
//         ccnsLookup = await CCNSLookupFactory.deploy();
//         await ccnsLookup.deployed();

//         console.log("Deployed CrossChainNameServiceLookup on :", ccnsLookup.address);

//         // Deploy CrossChainNameServiceRegister on Source with the deployed ccnsLookup.address
//         const CCNSRegisterFactory = await ethers.getContractFactory("CrossChainNameServiceRegister");
//         ccnsRegister = await CCNSRegisterFactory.deploy(sourceRouter_, ccnsLookup.address);
//         await ccnsRegister.deployed();

//         console.log("Deployed CrossChainNameServiceRegister on :", ccnsRegister.address);

//         // Update the CrossChainNameServiceLookup contract to use the correct CrossChainNameService address
//         await ccnsLookup.setCrossChainNameServiceAddress(ccnsRegister.address);

//         // Deploy CrossChainNameServiceLookup for destination
//         dest_ccnsLookup = await CCNSLookupFactory.deploy();
//         await dest_ccnsLookup.deployed();

//         console.log("Deployed CrossChainNameServiceLookup on :", dest_ccnsLookup.address);

//         // Deploy CrossChainNameServiceReceiver
//         const CCNSReceiverFactory = await ethers.getContractFactory("CrossChainNameServiceReceiver");
//         ccnsReceiver = await CCNSReceiverFactory.deploy(destinationRouter_, dest_ccnsLookup.address, chainSelector_);
//         await ccnsReceiver.deployed();

//         console.log("Deployed CrossChainNameServiceReceiver on :", ccnsReceiver.address);

//         console.log(`ℹ️  Attempting to call the setCrossChainNameServiceAddress function on the CrossChainNameServiceLookup smart contract`);
    
//         // Enable chains on source and destination
//         await ccnsRegister.enableChain(chainSelector_, ccnsReceiver.address, 1000000); // Provide a gas limit

//         // Update the CrossChainNameServiceLookup contract to use the correct CrossChainNameService address
//         await dest_ccnsLookup.setCrossChainNameServiceAddress(ccnsReceiver.address);

//         // Fund the contracts with LINK or ETH
//         await ccipLocalSimulator.requestLinkFromFaucet(ccnsRegister.address, ethers.utils.parseEther("3"));
//         await ccipLocalSimulator.requestLinkFromFaucet(ccnsReceiver.address, ethers.utils.parseEther("3"));
//     });

//     it("Should register and lookup a CCNS handle correctly", async function () {
//         // Register a new handle
//         try {
//             await ccnsRegister.register("alice.ccns");
//         } catch (error) {
//             console.error("Register error:", error);
//             throw error; // Re-throw the error after logging it
//         }

//         // Lookup the handle
//         const registeredAddress = await ccnsLookup.lookup("alice.ccns");

//         // Assertions
//         expect(registeredAddress).to.equal(alice.address, "The address registered for 'alice.ccns' should be Alice's address");
//     });
// });