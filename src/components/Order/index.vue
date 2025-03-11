<script lang="jsx">
import { NEmpty, NSpace, NList, NListItem, NDivider } from "naive-ui";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useWallet } from "../../store/wallet";
import { get_presale_list } from "../../apis/api";
import moment from "moment";
import { useAnchorWallet } from "solana-wallets-vue";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const walletStore = useWallet();
    const anchorWallet = useAnchorWallet();
    const account = computed(() => anchorWallet.value?.publicKey?.toBase58());
    const list = ref([]);
    const getData = () => {
      fetch("/web/privateSale/getBruhPrivateSaleList", {
        method: "POST",
        body: JSON.stringify({
          user: account.value,
          page: 1,
          pageSize: 99,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("res", res);
          list.value = res.data.list;
        });
    };

    watch(
      account,
      () => {
        account.value && getData();
      },
      {
        immediate: true,
      }
    );
    return () => (
      <div class="w-full p-4">
        {list.value.length ? (
          <n-scrollbar
            style="max-height: 300px;padding-bottom:30px;"
            class="overflow-hidden"
          >
            <NSpace vertical class="item-width">
              <NList style="--n-merged-color:transparent;" show-divider={false}>
                {list.value.map((item) => (
                  <NListItem class="list-item" style="border-radius:10px">
                    <div class="header">
                      <span class="text-white">{t("quantity")}</span>
                      <span style="color:#fff">{item.paymentAmount}</span>
                    </div>
                    <div class="header">
                      <span class="text-[#bbb]">{t("OrderStatus")}</span>
                      {item.status === -1 ? (
                        <span style="color:#FF5252">购买失败</span>
                      ) : item.status === 0 ? (
                        <span style="color:#F6C72F">{t("status_success")}</span>
                      ) : item.status === 1 ? (
                        <span style="color:#F6C72F">{t("status_success")}</span>
                      ) : (
                        <span style="color:#F6C72F">{t("status_success")}</span>
                      )}
                    </div>
                    <NDivider style="margin:0;--n-color:#434343;width:95%;margin:5px auto;" />
                    <div class="item">
                      <span class="text-[#bbb]">{t("createTime")}:</span>
                      <span class="text-[#bbb]">
                        {moment(item.UpdatedAt).format("YYYY-MM-DD HH:mm:ss")}
                      </span>
                    </div>
                  </NListItem>
                ))}
              </NList>
            </NSpace>
          </n-scrollbar>
        ) : (
          <NEmpty />
        )}
      </div>
    );
  },
});
</script>
<style lang="less" scoped>
.list-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 !important;

  ::v-deep(.n-list-item__main) {
    width: 100%;
    padding: 12px 0;
    border-radius: 10px;
  }
}

.list-item::after {
  width: 100%;
  content: "";
}

.flex {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header:extend(.flex) {
  color: #000;
}

.item:extend(.flex) {
  color: @grey-color;
}
</style>
