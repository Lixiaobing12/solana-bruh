<script lang="jsx">
import { useUsdtStore } from "@/store/wallet";
import { MinusSquareFilled } from "@vicons/antd";
import { Loader } from "@vicons/tabler";
import { NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePresale } from "../../store/presale";

const InputGroup = defineComponent({
  setup(props, { emit }) {
    const message = useMessage();
    const { t } = useI18n();
    const amount = ref(1);
    const minusColor = ref("#DADADA");
    const onChange = (e) => {
      if (isNaN(Number(e))) {
        message.warning(t("vilidInput"));
        return;
      }
      if (Number(e) < 0) {
        amount.value = 0;
      } else {
        if (e > 200) {
          amount.value = 200;
        } else {
          amount.value = parseInt(e);
        }
      }
      if (Number(amount.value) === 1) {
        minusColor.value = "#DADADA";
      } else {
        minusColor.value = "#F6E6CD";
      }
      emit("change", amount.value);
    };
    return () => (
      <NSpace align="center">
        <NIcon size={30} color={minusColor.value} class="group-middle">
          <MinusSquareFilled />
        </NIcon>
        <n-input
          type="number"
          readonly
          value={amount.value}
          style="width:70px;--n-height:25px;text-align:center;"
        />
        <img class="group-middle" src="/assets/add.png" width={25} />
      </NSpace>
    );
  },
});
export default {
  setup(prop, { expose }) {
    const presaleStore = usePresale();
    const { t } = useI18n();
    const usdtStore = useUsdtStore();
    const isVisiabled = ref(false);
    const message = useMessage();
    const amount = ref(1);
    const price = import.meta.env.VITE_BASE_IDOCASH;
    const loading = ref(false);
    const changeVisiabled = (bool) => {
      isVisiabled.value = bool;
    };
    watch(isVisiabled, (value) => {
      !value && (amount.value = 1);
    });
    let isOverBalanceOf = computed(
      () =>
        usdtStore.balance.div(1e18).lt(amount.value * price) ||
        !Number(amount.value)
    );
    const changeValue = (e) => {
      if (!isNaN(Number(e))) {
        amount.value = Number(e);
      }
    };
    const payabled = async () => {
      loading.value = true;
      let _price = (amount.value * price).toFixed(2);
      try {
        const tx = await presaleStore.purchased(_price);
        await tx.wait();
        message.success(t("succeeded"));
        setTimeout(() => {
          loading.value = false;
          changeVisiabled(false);
        }, 500);
      } catch (err) {
        message.error(t("failed"));
        loading.value = false;
        alert(err.message);
      }
    };
    expose({ changeVisiabled });

    return () => (
      <>
        <n-drawer
          trap-focus={false}
          v-model:show={isVisiabled.value}
          placement="bottom"
          style="border-radius:15px 15px 0 0;"
          default-height={500}
          mask-closable={false}
        >
          <n-drawer-content
            body-style={{
              "border-radius": "15px 15px 0 0",
              "background-image":
                "linear-gradient( 321deg, #181D1C 0%, #413612 22%, #4D3E0F 46%, #6A3A1D 75%, #6A3126 100%)",
              "border-top": "1px solid #978FF6",
            }}
          >
            <div
              class="absolute top-[-40px] left-[45%]"
              onClick={changeVisiabled.bind(null, false)}
            >
              <img src="/assets/close.png" width="25" />
            </div>
            <p class="text-white text-center text-xl">
              {t("confirmOrders")}
            </p>
            <NThing
              class="border"
              v-slots={{
                avatar: () => <n-image width="50" src="/assets/order.png" />,
                header: () => (
                  <NScrollbar style="max-height: 40px;color:#fff;">
                    <span>{t("joinGetReward")}</span>
                  </NScrollbar>
                ),
                description: () => (
                  <span style="color:#F6C72F;font-size:16px;font-weight:bold;">
                    {price}USDT{t("least")}
                  </span>
                ),
              }}
            />
            <NSpace justify="space-between" align="center" class="border">
              <div class="amount">{t("quantity")}</div>
              <InputGroup onChange={changeValue} />
            </NSpace>
            <NSpace justify="space-between" align="center" class="border">
              <div class="amount">{t("totalPrice")}</div>
              <NP style="color:#F6C72F;--n-font-size:20px;">
                {(amount.value * price).toFixed(2)} USDT
              </NP>
            </NSpace>
            <NSpace justify="space-between" align="center" class="text">
              <span>{t("walletBalanceOf")}</span>
              <span>{usdtStore.balance.div(1e18).toFixed(2)} USDT</span>
            </NSpace>

            <button
              class="btn btn-block mt-10 bg-themeBtn rounded-full text-[#000] pointer-events-auto border-0"
              onClick={() => {
                !isOverBalanceOf.value && !loading.value && payabled();
              }}
            >
              {loading.value && (
                <NSpin
                  size={25}
                  stroke="#fff"
                  v-slots={{
                    icon: () => <Loader />,
                  }}
                ></NSpin>
              )}
              {t("payOrders")}
            </button>
          </n-drawer-content>
        </n-drawer>
      </>
    );
  },
};
</script>
<style lang="less" scoped>
.title {
  font-size: 1.4em;
  font-weight: bold;
}

.border {
  padding: 20px 10px;
  border-radius: 12px;
  margin: 20px 0;
  background-color: #393838;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  box-shadow: inset 0px 5px 20px 1px rgba(255, 255, 255, 0.16);
  border: 1px solid #8c7b3b;
}

.amount {
  color: #fff;
}

.text {
  color: #fff;
}

::v-deep(.group-middle) {
  vertical-align: middle;
}

.static {
  border-top: 0.5px solid #dbd8d8;
  padding-top: 20px;
}

.tag--round-btn {
  ::v-deep(.n-tag__content) {
    display: flex;
    align-items: center;

    & span:first-of-type {
      margin-right: 10px;
    }
  }
}
</style>
