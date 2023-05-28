import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constant.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!!"
    }
    else {
        connectButton.innerHTML = "Please install meta mask!!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`eth amount funded ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        //ethers is compact library for interacting with etherium block chain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // getting the wallet address of meta-mask
        const signer = provider.getSigner()
        //Now we have to get the contract through ABI 
        // copy paste ABI to new file constants.js and import it
        // copy the contract address from prev file run yarn hardhat node 
        const Contract = new ethers.Contract(contractAddress, abi, signer)
        // make new network in metamask
        //also we have no money in our local network so we need to import one of our accounts to meta mask from prev file
        try {
            const transactionResponse = await Contract.fund({ value: ethers.utils.parseEther(ethAmount) })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        }

        catch (error) {
            console.log(error)
        }

    }
    function listenForTransactionMine(transactionResponse, provider) {
        console.log(`Mining ${transactionResponse.hash}`)
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    console.log(
                        `Completed with ${transactionReceipt.confirmations} confirmations. `
                    )
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    }

}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))

    }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            // await transactionResponse.wait(1)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask"
    }

    function listenForTransactionMine(transactionResponse, provider) {
        console.log(`Mining ${transactionResponse.hash}`)
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    console.log(
                        `Completed with ${transactionReceipt.confirmations} confirmations. `
                    )
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}