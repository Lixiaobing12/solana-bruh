<script lang="jsx">
import {
  NIcon,
  NSpace,
  useMessage,
  NTag,
  NSpin,
  NP,
  NImage,
  NButton,
} from "naive-ui";
import CloseCircleOutlined from "@vicons/antd/CloseCircleOutlined";
import { useI18n } from "vue-i18n";
import { useUsdtStore } from "@/store/wallet";
import BigNumber from "bignumber.js";
import { defineComponent } from "vue";
import { useWallet } from "../../store/wallet";
import axios from "axios";
import {
  get_default_presale_config,
  create_presale_order,
  get_user_presale_count,
} from "@/apis/api";
import { presale } from "../../apis/contract";

const Dialog = defineComponent({
  props: ["close"],
  setup(props, { expose }) {
    const { t } = useI18n();
    const close = () => {
      props.close();
      showModal.value = false;
    };
    const showModal = ref(false);

    expose({
      open: () => {
        showModal.value = true;
      },
    });
    return () => (
      <n-modal
        v-model={[showModal.value, "show"]}
        mask-closable={false}
        transform-origin="center"
        class="pay--modal"
      >
        <n-card
          style="width: 80vw;--n-padding-left:0;--n-padding-bottom:0;"
          bordered={false}
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <NP class="waive">{t("waive")}</NP>
          <div class="but-group">
            <div class="cancel" onClick={close}>
              {t("giveUp")}
            </div>
            <div
              class="continue"
              onClick={() => {
                showModal.value = false;
              }}
            >
              {t("continuePay")}
            </div>
          </div>
        </n-card>
      </n-modal>
    );
  },
});

const PayDialog = defineComponent({
  setup(props, { expose }) {
    const { t } = useI18n();
    const showModal = ref(false);
    const type = ref("success");
    expose({
      open: (_type = "success") => {
        type.value = _type;
        showModal.value = true;
      },
      close: () => {
        showModal.value = false;
      },
    });
    return () => (
      <n-modal
        v-model={[showModal.value, "show"]}
        mask-closable
        transform-origin="center"
        class="pay--modal"
        trap-focus={false}
      >
        <n-card
          style="width: 90vw;--n-padding-left:0;--n-padding-bottom:0;height:250px;background-image:linear-gradient(to bottom, #B5F7D9, #CBF1EF 0%,#fff);"
          bordered={false}
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <NSpace align="center" justify="center" class="tip" vertical>
            <NP class="title">{t("tips")}</NP>
            <NSpace align="center" justify="center" vertical class="context">
              {type.value === "success" ? (
                <>
                  <NImage src="/assets/success.png" width="50"></NImage>
                  <Np style="font-weight:bold;font-size:1.2em;">
                    {t("succeeded")}
                  </Np>
                  <NButton
                    onClick={() => {
                      showModal.value = false;
                    }}
                  >
                    {t("backHome")}
                  </NButton>
                </>
              ) : (
                <>
                  <NImage src="/assets/error.png" width="50"></NImage>
                  <Np style="font-weight:bold;font-size:1.2em;text-align:center;">
                    {t("failed")}
                  </Np>
                </>
              )}
            </NSpace>
          </NSpace>
        </n-card>
      </n-modal>
    );
  },
});

export default {
  setup(props, { expose }) {
    const { t } = useI18n();
    const price = ref(0);
    const isCheck = ref(false);
    const usdtStore = useUsdtStore();
    const { wallet } = useWallet();
    const isVisiabled = ref(false);
    const loading = ref(false);
    const dialogRef = ref(null);
    const payDialogRef = ref(null);
    const changeVisiabled = (bool) => {
      isVisiabled.value = bool;
    };
    const changePrice = (_price) => {
      price.value = _price;
    };
    const close = () => {
      dialogRef.value.open();
    };
    const onchecked = (e) => {
      isCheck.value = e;
    };
    const payabled = () => {
      loading.value = true;
      presale(price.value)
        .then((res) => {
          payDialogRef.value.open();
          setTimeout(() => {
            loading.value = false;
            changeVisiabled(false);
          }, 500);
        })
        .catch((err) => {
          console.error("支付失败", err);
          payDialogRef.value.open("error");
          setTimeout(() => {
            payDialogRef.value.close();
          }, 1500);
          loading.value = false;
        });
    };
    expose({ changeVisiabled, changePrice });

    return () => (
      <div class="context">
        <n-drawer
          close-on-esc={false}
          mask-closable={false}
          v-model:show={isVisiabled.value}
          placement="bottom"
          style="border-radius:15px 15px 0 0"
          default-height={380}
        >
          <n-drawer-content
            body-style={{
              "border-radius": "15px 15px 0 0",
              position: "relative",
            }}
          >
            <NSpace
              justify="space-between"
              align="center"
              style="margin-bottom:16px;"
            >
              <NP class="title">选择支付</NP>
              <NIcon color="#333" size={25} onClick={close}>
                <CloseCircleOutlined />
              </NIcon>
            </NSpace>
            <NSpace vertical align="center">
              <NP class="grey">需支付</NP>
              <NP class="bold">{price.value} USDT</NP>
            </NSpace>
            <NSpace justify="space-between" align="center" class="border">
              <div class="grey">{t("walletpayment")}</div>
              <n-checkbox size="large" on-update:checked={onchecked} style="--n-color-checked:#F6C72F;--n-border-focus:#F6C72F"/>
            </NSpace>
            <NSpace align="center" style="color:#F6C72F;">
              <span>{t("balance")}: </span>
              <span>{usdtStore.balance.div(1e18).toFixed(2)} USDT</span>
            </NSpace>
            <NSpace justify="center" align="center" class="static">
              <NTag
                class="tag--round-btn"
                round
                style={{
                  "--n-border": 0,
                  "--n-text-color": "#fff",
                  "--n-height": "40px",
                  "--n-color": isCheck.value ? "#F6C72F" : "#bbb",
                }}
                onClick={() => isCheck.value && !loading.value && payabled()}
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
                  ></NSpin>
                )}
                {t("ConfirmPayment")}
              </NTag>
            </NSpace>
          </n-drawer-content>
        </n-drawer>
        <Dialog ref={dialogRef} close={changeVisiabled.bind(null, false)} />
        <PayDialog ref={payDialogRef} />
      </div>
    );
  },
};
</script>
<style lang="less">
.pay--modal {
  .tip {
    padding: 16px;

    .context {
      width: 70vw;
      background-color: #fff;
      padding: 16px;
      text-align: center;
    }
  }
  .title {
    font-size: 1.5em;
  }
  .waive {
    margin: 0;
    padding: 28px 0;
    border-bottom: 0.5px solid #dbd8d8;
    font-size: 1.4em;
    font-weight: bold;
    text-align: center;
  }
  .but-group {
    display: flex;
    text-align: center;

    .cancel {
      color: @grey-color;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      flex: 1;
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;

      &::after {
        position: absolute;
        right: 0;
        content: "";
        width: 0.5px;
        height: 40px;
        background-color: #dbd8d8;
      }
    }
    .continue {
      color: #1c815c;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      flex: 1;
    }
  }
}
</style>
<style lang="less" scoped>
.title {
  font-size: 1.4em;
  font-weight: bold;
}
.bold {
  font-weight: bold;
  color: #000;
  font-size: 1.5em;
  margin-bottom: 20px;
}
.amount {
  color: @grey-color;
}
.border {
  border: 0.5px solid #dbd8d8;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
}

.text {
  color: #2d8e69;
}

::v-deep(.group-middle) {
  vertical-align: middle;
}

.static {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  padding-top: 10px;
}

.tag--round-btn {
  width: 90vw;
  text-align: center;
  margin-bottom: 16px;
  justify-content: center;
  ::v-deep(.n-tag__content) {
    display: flex;
    align-items: center;

    & span:first-of-type {
      margin-right: 10px;
    }
  }
}
</style>
