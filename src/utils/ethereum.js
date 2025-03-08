import { ethers } from "ethers";

/** 切链 */
export const switch_chain_ethereum = async (chain_id = "0x38") => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chain_id,
        },
      ],
    });
    return true;
  } catch (err) {
    console.log("switch_chain_ethereum error:", err);
    return false;
  }
};

/** 获取授权 */
export const get_permission_ethereum = async () => {
  try {
    await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    });
    return true;
  } catch (err) {
    console.log("get_permission_ethereum error:", err);
    return false;
  }
};

/** 获取授权账户 */
export const get_account_by_permission = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    });
    return accounts[0];
  } catch (err) {
    console.log("get_account_by_permission error:", err);
    return false;
  }
};

/** 签名
 * @param message 要签名的消息
 * @param account 签名账户
 * @returns 签名哈希
 */
export const sign_message_personal = async (message, account) => {
  try {
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [account, message],
    });
    return signature;
  } catch (err) {
    console.log("sign_message_personal error:", err);
    return false;
  }
};

export const get_client_by_ethers = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider;
};

export const get_signer_by_ethers = (address) => {
  const provider = get_client_by_ethers();
  return provider.getSigner();
};
