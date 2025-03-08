import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router'
import { create } from 'naive-ui'
import { createPinia } from 'pinia'
import './layout/index.less';
import './layout/index.css';
import i18n from './locale';
import SolanaWallets from "solana-wallets-vue";
// You can either import the default styles or create your own.
import "solana-wallets-vue/styles.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

let network = import.meta.env.VITE_SOLANA_NETWORK === 'devnet' ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
const walletOptions = {
    wallets: [
        new PhantomWalletAdapter(network),
    ],
    autoConnect: true,
};
const naive = create({})
const app = createApp(App)
app.use(router).use(createPinia()).use(i18n).use(SolanaWallets, walletOptions).use(naive).mount('#app');