import { ethers } from "ethers"
import INVITERABI from '@/utils/abi/invite.json'
import PRESALEABI from '@/utils/abi/presale.json'
import ERC20ABI from '@/utils/abi/erc20.json'
import BigNumber from "bignumber.js";
import { get_account_by_permission, get_client_by_ethers, get_signer_by_ethers } from "../utils/ethereum";
import { useWallet } from "../store/wallet";


export const get_inviter = async () => {
    const { wallet } = useWallet();
    if (!wallet.isConnect) return Promise.reject("get_inviter:Wallet not connected");
    const provider = get_client_by_ethers();
    const account = wallet.account;
    const invite = new ethers.Contract(import.meta.env.VITE_BASE_INVITE, INVITERABI, provider);
    return await invite.getInviter(account);
}

export const get_team_size = async () => {
    const { wallet } = useWallet();
    if (!wallet.isConnect) return Promise.reject("Wallet not connected");
    const provider = get_client_by_ethers();
    const account = wallet.account;
    const invite = new ethers.Contract(import.meta.env.VITE_BASE_INVITE, INVITERABI, provider);
    return await invite.getInviterSunSize(account)
}

export const join = async (parent) => {
    const { wallet } = useWallet();
    if (!wallet.isConnect) return Promise.reject("Wallet not connected");
    const signer = get_signer_by_ethers();
    const invite = new ethers.Contract(import.meta.env.VITE_BASE_INVITE, INVITERABI, signer);
    const { wait } = await invite.invite(parent)
    return await wait()
}

export const presale = async (amount) => {
    const { wallet } = useWallet();
    if (!wallet.isConnect) return;
    const signer = get_signer_by_ethers();
    const account = wallet.account;
    const presale = new ethers.Contract(import.meta.env.VITE_BASE_PRESALE, PRESALEABI, signer);
    const usdt = new ethers.Contract(import.meta.env.VITE_BASE_USDT, ERC20ABI, signer);
    const allowance = await usdt.allowance(account, presale.address);
    if (BigNumber(allowance.toString()).lt(BigNumber(amount).times(1e18))) {
        const { wait } = await usdt.approve(presale.address, BigNumber(amount).times(1e18).toFixed(0));
        await wait();
    };

    const { wait } = await presale.purchased(BigNumber(amount).times(1e18).toFixed(0));
    return await wait();
}