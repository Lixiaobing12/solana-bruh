<script lang="jsx">
import { NEmpty, NSpace, NList, NListItem, NDivider } from "naive-ui";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useWallet } from "../../store/wallet";
import { get_presale_list } from "../../apis/api";
import moment from "moment";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const walletStore = useWallet();
    const account = computed(() => walletStore.wallet.account);
    const list = ref([]);
    const fetch = () => {
      get_presale_list({
        userAddr: account.value,
        page: 1,
        pageSize: 99,
      }).then((res) => {
        list.value = res.data.list.map((item) => ({
          amount: item.amount,
          time: moment(item.CreatedAt).format("YYYY-MM-DD HH:mm:ss"),
          status: Number(item.status),
        }));
      });
    };
    // watch(
    //   account,
    //   () => {
    //     fetch();
    //     setInterval(fetch, 6000);
    //   },
    //   {
    //     immediate: true,
    //   }
    // );
    return () => (
      <div class="w-full p-4">
        {list.value.length ? (
          <n-scrollbar style="max-height: 300px;padding-bottom:30px;">
            <NSpace vertical class="item-width">
              <NList style="--n-merged-color:transparent;" show-divider={false}>
                {list.value.map((item) => (
                  <NListItem class="list-item" style="border-radius:10px">
                    <div class="header">
                      <span class="text-white">数量(USDT)</span>
                      <span style="color:#fff">{item.amount}</span>
                    </div>
                    <div class="header">
                      <span class="text-[#bbb]">订单状态</span>
                      {item.status === -1 ? (
                        <span style="color:#FF5252">购买失败</span>
                      ) : item.status === 0 ? (
                        <span style="color:#bbb">交易确认中</span>
                      ) : item.status === 1 ? (
                        <span style="color:#F6C72F">购买成功</span>
                      ) : (
                        <span style="color:#F6C72F">购买成功</span>
                      )}
                    </div>
                    <NDivider style="margin:0;--n-color:#434343;width:95%;margin:5px auto;" />
                    <div class="item">
                      <span class="text-[#bbb]">创建时间:</span>
                      <span class="text-[#bbb]">{item.time}</span>
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
