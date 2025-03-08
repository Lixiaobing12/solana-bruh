<script lang="jsx">
import { defineComponent, onActivated, onUpdated, watch } from "vue";
import { NSpace, NP } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useWallet } from "../../store/wallet";
import axios from "axios";
import { get_user_presale_count } from "../../apis/api";
import { get_team_size } from "../../apis/contract";
import BigNumber from "bignumber.js";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const reward = ref(0);
    const teamSums = ref(0);
    const walletStore = useWallet();
    const account = computed(() => walletStore.wallet.account);
    const fetch = () => {
      get_user_presale_count().then((res) => {
        reward.value = res.data;
      });
      get_team_size().then((res) => {
        teamSums.value = BigNumber(res?.toString()).toFixed(0);
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
      <NSpace align="center" justify="space-around" style="width:80vw;">
        <NSpace vertical align="center">
          <NP class="asset">{reward.value}</NP>
          <div class="tip"> {t("totalReward")} </div>
        </NSpace>
        <NSpace vertical align="center">
          <NP class="asset">{teamSums.value}</NP>
          <div class="tip"> {t("myteam")} </div>
        </NSpace>
      </NSpace>
    );
  },
});
</script>
<style lang="less" scoped>
.asset {
  font-size: 1.8em;
  font-weight: bold;
  color: #fff;
}

.tip {
  color: #bbb;
}
</style>
