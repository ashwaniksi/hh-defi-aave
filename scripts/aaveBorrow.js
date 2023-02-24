//* 11. Repaying to AAVE

//* This is 'aaveBorrow.js' file.

//* So now we'll create a function 'repay' to repay some of the DAI tokens back to AAVE.

const { getWeth, AMOUNT } = require('../scripts/getWeth.js');
const { getNamedAccounts } = require('hardhat');

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();
    const lendingPool = await getLendingPool(deployer);
    console.log(`Lending pool address is : ${lendingPool.address}`);

    const wethTokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log('Depositing WETH...');

    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log('Desposited!');

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );

    const daiPrice = await getDaiPrice();

    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());

    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    );

    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);
    const daiTokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';

    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );

    await getBorrowUserData(lendingPool, deployer);

    //* calling 'repay' function to repay the loan.
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);

    await getBorrowUserData(lendingPool, deployer); // Printing the final amount.
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        'ILendingPoolAddressesProvider',
        '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
        account
    );

    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        'ILendingPool',
        lendingPoolAddress,
        account
    );

    return lendingPool;
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        'IERC20',
        erc20Address,
        account
    );

    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log('Approved!');
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);

    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);

    return { availableBorrowsETH, totalDebtETH };
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        'AggregatorV3Interface',
        '0x773616E4d11A78F511299002da57A0a94577F1f4' // daiEthPriceFeed address
    );

    const price = (await daiEthPriceFeed.latestRoundData())[1];

    console.log(`The DAI/ETH price is ${price.toString()}`);

    return price;
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        1,
        0,
        account
    );

    await borrowTx.wait(1);

    console.log("You've borrowed!");
}

//* to repay some of the DAI tokens back to AAVE
async function repay(amount, daiAddress, lendingPool, account) {
    // Before we rapay, we have to approve again so that AAVE can take tokens from our account.
    await approveErc20(daiAddress, lendingPool.address, amount, account); // approving

    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account); // repaying by calling the 'rapay' function on 'lending pool'.

    await repayTx.wait(1);

    console.log('Repaid!'); // logging

    //* Now we'll call it in our main function.
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/*
yarn hardhat run scripts/aaveBorrow.js

* OUTPUT:
Got 20000000000000000 WETH
Lending pool address is : 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Approved!
Depositing WETH...
Desposited!
You have 20000000000000000 worth of ETH deposited.
You have 0 worth of ETH borrowed.
You can borrow 16500000000000000 worth of ETH.
The DAI/ETH price is 686484598873080
You can borrow 22.833724202599416 DAI
You've borrowed!
You have 20000000340408297 worth of ETH deposited.
You have 15674999999999998 worth of ETH borrowed.
You can borrow 825000280836847 worth of ETH.     
Approved!
Repaid!
You have 20000000583557081 worth of ETH deposited. //* Repaid the principal amount.
You have 836228977 worth of ETH borrowed.  //* This is accrued interest.
You can borrow 16499999645205615 worth of ETH.
Done in 52.17s.

*/
