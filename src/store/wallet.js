import config from "../../setting.json";
import erc20Abi from "@/utils/abi/erc20.json";
import routerAbi from "@/utils/abi/ROUTER_PANCAKE.json";
import swapAbi from "@/utils/abi/SWAP_CONTRACT.json";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import moment from "moment";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { login as loginApi } from "@/apis/api";
import { get_user_info } from "../apis/api";
import { get_inviter } from "../apis/contract";
import {
  get_account_by_permission,
  get_client_by_ethers,
  sign_message_personal,
  switch_chain_ethereum,
} from "../utils/ethereum";

let signing = false;
let ethereum = window.ethereum;

export const useWallet = defineStore("mywallet", () => {
  const wallet = ref({
    account: "0x0000000000000000000000000000000000000000",
    isConnect: false,
    logined: false
  });
  const userInfo = ref(null);
  /** 是否绑定上级 */
  const binded = ref(false);

  const login = async () => {
    console.log('login...')
    const message = "Login to our awesome app";
    const account = await get_account_by_permission();
    if (!account) {
      return console.log("not connect account");
    }
    const signature = await sign_message_personal(message, account);
    if (!signature) {
      return console.log("sign failed");
    }
    await loginApi({
      address: account,
      message: message,
      signature: signature,
    }).then((res) => {
      const token = res.data.token;
      localStorage.setItem("x-token", token);
      userInfo.value = res.data.user;
      wallet.value.logined = true;
    });
    get_inviter().then((res) => {
      binded.value = !!Number(res);
    });
    setInterval(() => {
      get_user_info().then((res) => {
        userInfo.value = res.data.userInfo;
        wallet.value.logined = true;
      });
    }, 10000);
  };

  const connect = async () => {
    if (ethereum) {
      await switch_chain_ethereum();
      const account = await get_account_by_permission();
      if (!account) {
        return console.log("not connect account");
      }
      wallet.value.account = account;
      wallet.value.isConnect = true;
    } else {
      console.log("请安装metamask插件");
      return false;
    }
  };
  return { wallet, connect, login, userInfo, binded };
});

export const useUsdtStore = defineStore("usdt", () => {
  const balance = ref(BigNumber(0));

  const transfer = async (amount) => {
    const { connect } = useWallet();
    const [provider, singer, account] = await connect();
    const contract = new ethers.Contract(
      import.meta.env.VITE_BASE_USDT,
      erc20Abi,
      singer
    );
    return contract.transfer(import.meta.env.VITE_BASE_OWNER, amount);
  };
  let timer;
  const initStatice = async () => {
    const provider = get_client_by_ethers();
    const account = await get_account_by_permission();
    const contract = new ethers.Contract(
      import.meta.env.VITE_BASE_USDT,
      erc20Abi,
      provider
    );
    const _balance = await contract.balanceOf(account);
    balance.value = BigNumber(_balance.toString());
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(async () => {
      const _balance = await contract.balanceOf(account);
      balance.value = BigNumber(_balance.toString());
    }, 3000);
  };
  return { balance, initStatice, transfer };
});
