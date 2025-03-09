<script lang="jsx">
import { useWallet } from "@/store/wallet";
import { computed, onMounted, watch } from "vue";
import {
  NSpace,
  NCard,
  NP,
  NImage,
  NButton,
  NModal,
  NInput,
  useMessage,
  NTag,
  NSpin,
} from "naive-ui";
import axios from "axios";
import { useI18n } from "vue-i18n";
import useClipboard from "vue-clipboard3";
import { get_user_info_by_code } from "../../apis/api";
import { storeToRefs } from "pinia";
import { get_inviter, join } from "../../apis/contract";
import { ethers } from "ethers";
import { useWorkspace } from "@/useWorkspace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorWallet } from "solana-wallets-vue";

const PayDialog = defineComponent({
  setup(props, { expose }) {
    const workSpaceStore = useWorkspace();
    const { workspace } = storeToRefs(workSpaceStore);
    const AnchorWallet = useAnchorWallet();
    const message = useMessage();
    const { t } = useI18n();
    const isBind = ref(false);
    const showModal = ref(false);
    const walletStore = useWallet();
    const inviteParent = ref(null);
    const { userInfo, wallet } = storeToRefs(walletStore);
    const loading = ref(false);
    const bind = async () => {
      const { program } = workspace.value;
      try {
        loading.value = true;
        let parent = inviteParent.value;
        let referrerPk = new PublicKey(parent);
        let [pak1, bump1] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
          program.programId
        );
        let [pak2, bump2] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), referrerPk.toBuffer()],
          program.programId
        );
        const tx = await program.methods
          .bindReferrer(referrerPk)
          .accounts({
            user: AnchorWallet.value.publicKey,
            userAccount: pak1,
            referrerAccount: pak2,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        await fetch("/web/bind/createBruhBind", {
          method: "POST",
          body: JSON.stringify({ txId: tx }),
        }).then((res) => res.json());

        message.success(t("bindSuccess"));
        loading.value = false;
        showModal.value = false;
      } catch (e) {
        console.log(e);
        loading.value = false;
        message.error(t("bindError"));
      }
    };

    const init = async () => {
      const match = window.location.href.match(/\?code=([^&]*)/);
      const parent_code = match ? match[1] : null;
      let parent = parent_code;
      if (parent) {
        inviteParent.value = parent;
      }
      try {
        const [pda, bump] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
          workspace.value.program.programId
        );
        const res = await workspace.value.program.account.userAccount.fetch(
          pda
        );
        isBind.value = true;
        showModal.value = false;
      } catch (e) {
        console.log(e);
        isBind.value = false;
        showModal.value = true;
      }
    };
    watch(AnchorWallet, () => {
      if (AnchorWallet.value) {
        init();
      }
    });

    expose({
      open: () => {
        showModal.value = true;
      },
    });
    return () => (
      <NModal
        v-model={[showModal.value, "show"]}
        mask-closable={false}
        transform-origin="center"
        class="pay--modal"
        trap-focus={false}
      >
        <NCard
          style="width: 90vw;
          --n-padding-left:0;
          --n-padding-bottom:0;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          border-radius: 15px;"
          bordered={false}
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <NSpace align="center" justify="center" class="tip" vertical>
            <NP style="color:#fff;font-weight:medium;font-size:18px;">
              {t("tips")}
            </NP>
            <NSpace
              align="center"
              justify="center"
              vertical
              style="height:128px;bgckground:transparent;"
            >
              <NInput
                placeholder={t("placeUse")}
                readonly
                v-model:value={inviteParent.value}
                style="width:80vw;"
                size="large"
              />
              <NTag
                style="margin-top:16px;--n-padding:0 30px;border-radius:999px;--n-color:#F6C72F;--n-text-color:#fff;--n-border:0;"
                size="large"
                onClick={!loading.value && bind}
              >
                {loading.value && (
                  <NSpin
                    size={16}
                    stroke="#fff"
                    v-slots={{
                      icon: () => (
                        <img src="/assets/loading.svg" alt="" width="16" />
                      ),
                    }}
                  />
                )}
                {t("confirm")}
              </NTag>
            </NSpace>
          </NSpace>
        </NCard>
      </NModal>
    );
  },
});

export default {
  setup() {
    const AnchorWallet = useAnchorWallet();
    const { t } = useI18n();
    const message = useMessage();
    const workSpaceStore = useWorkspace();
    const { workspace } = storeToRefs(workSpaceStore);
    const { toClipboard } = useClipboard();
    const isActive = ref(false);
    const inviteUrl = computed(() => {
      if (!isActive.value) {
        return "";
      }
      return AnchorWallet.value
        ? window.location.origin +
            "?code=" +
            AnchorWallet.value.publicKey.toBase58()
        : "";
    });
    const copy = async () => {
      if (isActive.value) {
        await toClipboard(inviteUrl.value);
        message.success(t("copied"));
      }
    };
    const init = async () => {
      try {
        const { program } = workspace.value;
        const [pda, bump] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
          program.programId
        );
        const { purchaseCount } =
          await workspace.value.program.account.userAccount.fetch(pda);
        console.log("purchaseCount", purchaseCount);
        if (purchaseCount > 0) {
          isActive.value = true;
        }
      } catch (e) {}

      setTimeout(init, 5000);
    };
    watch([() => AnchorWallet.value, workspace.value], async () => {
      if (AnchorWallet.value) {
        init();
      }
    });
    return () => (
      <div class="bind--container">
        <n-input
          placeholder={t("placeInvest")}
          type="text"
          size="large"
          value={inviteUrl.value}
          style="flex:1;margin:16px 0;--n-text-color-disabled:#fff;background:transparent;border:none;--n-border-disabled:0;"
          disabled
        />
        <NTag
          onClick={copy}
          round
          style="text-align:center;--n-color:#F6C72F;--n-text-color:#000;--n-height:30px;--n-border:0;"
        >
          {t("copyLink")}
        </NTag>
        <PayDialog />
      </div>
    );
  },
};
</script>
<style lang="less" scoped>
::v-deep(.n-tag__content) {
  width: 100%;
}

.bind--container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
