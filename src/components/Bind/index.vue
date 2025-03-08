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

const PayDialog = defineComponent({
  setup(props, { expose }) {
    const message = useMessage();
    const { t } = useI18n();
    const isBind = ref(false);
    const showModal = ref(false);
    const walletStore = useWallet();
    const inviteParent = ref(null);
    const { userInfo, wallet } = storeToRefs(walletStore);
    const loading = ref(false);
    const bind = async () => {
      let parent = inviteParent.value;
      const res = await get_user_info_by_code({
        userCode: parent,
      });
      const parentAddr = res.data.userInfo.userAddr;
      if (!Number(parentAddr)) return;
      loading.value = true;
      try {
        await join(parentAddr);
        showModal.value = false;
        message.success(t("bindSuccess"));
      } catch (e) {
        console.log(e);
        message.error(t("绑定失败"));
      }
      loading.value = false;
    };
    const init = () => {
      const match = window.location.href.match(/\?code=([^&]*)/);
      const parent_code = match ? match[1] : null;
      let parent = parent_code;
      if (parent) {
        inviteParent.value = parent;
      }
      get_inviter()
        .then((res) => {
          console.log("inviter:", res);
          if (res === ethers.constants.AddressZero) {
            isBind.value = false;
            showModal.value = !isBind.value;
          }
        })
        .catch(() => {
          setTimeout(init, 1500);
        });
    };
    // init();

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
            <NP style="color:#fff;">{t("tips")}</NP>
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
    const { t } = useI18n();
    const walletStore = useWallet();
    const userInfo = computed(() => walletStore.userInfo);
    const message = useMessage();
    const { toClipboard } = useClipboard();
    const inviteUrl = computed(() => {
      return userInfo.value?.selfhash > 0
        ? window.location.origin + "?code=" + userInfo.value?.userCode
        : "";
    });
    const copy = async () => {
      await toClipboard(inviteUrl.value);
      message.success(t("copied"));
    };
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
