//* Deploying Raffle contract -2

// This is 'hardhat.config.js' file

require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('hardhat-contract-sizer');
require('dotenv').config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL; //adding
const PRIVATE_KEY = process.env.PRIVATE_KEY; //adding
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; //adding
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; //adding
const MAINNET_RPC_URL =
   process.env.MAINNET_RPC_URL || process.env.ALCHEMY_MAINNET_RPC_URL || "";

module.exports = {
    defaultNetwork: 'hardhat', //adding
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        }, //adding
        localhost: {
            chainId: 31337,
        }, //adding
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            accounts: [PRIVATE_KEY],
            url: GOERLI_RPC_URL,
        }, //adding 
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey:ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        currency: 'USD',
        outputFile: 'gas-report.txt',
        noColors: true,
        //coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    solidity: {
        compilers: [
            { version: '0.8.7' },
            { version: '0.4.19' },
            { version: '0.6.12' },
        ],
    },
    namedAccounts: {
        //adding
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 300000, // 300 seconds
    },
};
/*
yarn hardhat run scripts/aaveBorrow.js 
yarn run v1.22.19
warning package.json: No license field
warning ../../package.json: No license field
Got 20000000000000000 WETH
Lending pool address is : 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Approved!
Depositing WETH...
Desposited!
You have 20000000000000000 worth of ETH deposited.
You have 0 worth of ETH borrowed.
You can borrow 16500000000000000 worth of ETH.
The DAI/ETH price is 604675178709778
You can borrow 25.92300883500202 DAI
You've borrowed!
You have 20000000152100664 worth of ETH deposited.
You have 15675000000000000 worth of ETH borrowed.
You can borrow 825000125483048 worth of ETH.
Approved!
Repaid!
You have 20000000261951143 worth of ETH deposited.
You have 739435668 worth of ETH borrowed.
You can borrow 16499999476674025 worth of ETH.
Done in 42.44s.
*/
