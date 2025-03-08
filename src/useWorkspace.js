import { computed, ref, watchEffect } from "vue";
import { useAnchorWallet } from "solana-wallets-vue";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import idl from "@/idl.json";
import { defineStore } from "pinia";

import { Program, Provider, web3 } from '@project-serum/anchor';

const preflightCommitment = "processed";
const commitment = "confirmed";

const programID = new PublicKey(idl.metadata.address);

export const useWorkspace = defineStore('workspace', () => {
    const workspace = ref({
        wallet: null,
        connection: null,
        provider: null,
        program: null,
    });

    const setWorkSpace = (newWorkspace) => {
        workspace.value = newWorkspace;
    }

    return { workspace, setWorkSpace };
})

export const initWorkspace = () => {
    const { workspace, setWorkSpace } = useWorkspace();
    const wallet = useAnchorWallet();
    const connection = new Connection(clusterApiUrl(import.meta.env.VITE_SOLANA_NETWORK), commitment);

    watchEffect(() => {
        const currentWallet = wallet.value;
        if (currentWallet && currentWallet) {
            console.log('currentWallet', currentWallet)
            const provider = new Provider(
                connection, currentWallet, "processed",
            );

            const program = new Program(idl, programID, provider);

            setWorkSpace({
                wallet: currentWallet,
                connection,
                provider,
                program,
            })
        } else {
            setWorkSpace({
                wallet: null,
                connection,
                provider: null,
                program: null,
            });
        }
    });
};