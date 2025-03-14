import CryptoJS from 'crypto-js';
const key = '@#$W&S*!^&A)^%S^';
const iv = '@#$W&S*!^&A)^%S^';
// 加密
export const encrypt = (data) => {
  if (typeof data === 'object') {
    // 如果传入的data是json对象，先转义为json字符串
    try {
      data = JSON.stringify(data);
    } catch (error) {
      console.log('error:', error);
    }
  }
  // 统一将传入的字符串转成UTF8编码
  const dataHex = CryptoJS.enc.Utf8.parse(data); // 需要加密的数据
  const keyHex = CryptoJS.enc.Utf8.parse(key); // 秘钥
  const ivHex = CryptoJS.enc.Utf8.parse(iv); // 偏移量
  const encrypted = CryptoJS.AES.encrypt(dataHex, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC, // 加密模式
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedVal = encrypted.ciphertext.toString();
  return encryptedVal; //  返回加密后的值
};