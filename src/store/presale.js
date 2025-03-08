import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import erc20Abi from '../utils/abi/erc20.json';
import presaleAbi from '../utils/abi/presale.json';

export const usePresale = defineStore('presale', () => {
    const startData = ref(0);
    const endData = ref(0);
    const userPurchased = ref(0);
    const totalPurchased = ref(0);

    const purchased = async (amount) => {
        if (window.ethereum) {
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(import.meta.env.VITE_BASE_PRESALE, presaleAbi, signer);
            const usdt = new ethers.Contract(import.meta.env.VITE_BASE_USDT, erc20Abi, signer);
            const approveAmount = await usdt.allowance(account, import.meta.env.VITE_BASE_PRESALE);
            if (BigNumber(approveAmount.toString()).lt(BigNumber(amount).times(1e18))) {
                const { wait } = await usdt.approve(import.meta.env.VITE_BASE_PRESALE, BigNumber(amount).times(1e18).toFixed(0));
                await wait();
            }
            return await contract.purchased(BigNumber(amount).times(1e18).toFixed(0))
        }
        return false;
    }
    const initStatice = async () => {
        setTimeout(() => {
            initStatice();
        }, 5000)
        if (window.ethereum) {
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(import.meta.env.VITE_BASE_PRESALE, presaleAbi, signer);
            contract.startAt().then(data => {
                startData.value = data.toNumber();
            })
            contract.endAt().then(data => {
                endData.value = data.toNumber();
            })
            contract.userPurchased(account).then(data => {
                userPurchased.value = BigNumber(data.toString()).div(1e18).toFixed(2)
            })
            contract.totalPurchased().then(data => {
                totalPurchased.value = BigNumber(data.toString()).div(1e18).toFixed(2)
            })
        }
    }

    return {
        startData,
        endData,
        userPurchased,
        totalPurchased,
        purchased,
        initStatice
    }
})