<script lang="jsx">
import { NEmpty, NSpace, NList, NListItem, NDivider } from "naive-ui";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useWallet } from "../../store/wallet";
import { get_subordinate, get_team_list } from "../../apis/api";
import moment from "moment";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const walletStore = useWallet();
    const account = computed(() => walletStore.wallet.account);
    const list = ref([]);
    const fetch = () => {
      get_team_list({ parentAddr: account.value }).then((res) => {
        list.value = res.data.list || [];
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
      <div class="p-4">
        {list.value.length ? (
          <n-scrollbar style="max-height: 300px;padding-bottom:30px;">
            {list.value.length ? (
              <n-grid x-gap="10" y-gap="24" cols="4">
                {list.value.map((item) => (
                  <>
                    <n-gi>
                      <div style="display:flex;flex-direction:column;align-items:start;">
                        <span style="color:#aaa;font-size:12px;">
                          {t("address")}
                        </span>
                        <span style="color:#F6C72F;font-size:12px;">
                          {item.userAddr.replace(/(.{3}).*(.{4})$/, "$1...$2")}
                        </span>
                      </div>
                    </n-gi>
                    <n-gi>
                      <div style="display:flex;flex-direction:column;align-items:center;">
                        <span style="color:#aaa;font-size:12px;">
                          {t("subordinates")}
                        </span>
                        <span style="color:#F6C72F">
                          {item.maxTeamUsersCount}
                        </span>
                      </div>
                    </n-gi>
                    <n-gi>
                      <div style="display:flex;flex-direction:column;align-items:center;">
                        <span style="color:#aaa;font-size:12px;">{t("selfHash")}</span>
                        <span style="color:#F6C72F">
                          {Number(item.selfhash).toFixed(2)}
                        </span>
                      </div>
                    </n-gi>
                    <n-gi>
                      <div style="display:flex;flex-direction:column;align-items:center;">
                        <span style="color:#aaa;font-size:12px;">{t("teamHash")}</span>
                        <span style="color:#F6C72F">
                          {Number(item.teamhash).toFixed(2)}
                        </span>
                      </div>
                    </n-gi>
                  </>
                ))}
              </n-grid>
            ) : (
              <NEmpty />
            )}
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
.item-width {
  width: calc(100vw - 80px);
}

.list-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 !important;

  ::v-deep(.n-list-item__main) {
    width: 100%;
    padding: 12px 0;
  }
}

.list-item::after {
  width: 100%;
  height: 20px;
  background-color: #fff;
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
