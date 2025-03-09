<script lang="jsx">
import { defineComponent, onActivated, onUpdated, watch } from "vue";
import { NSpace, NP } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useWallet } from "../../store/wallet";
import axios from "axios";
import { get_user_presale_count } from "../../apis/api";
import { get_team_size } from "../../apis/contract";
import BigNumber from "bignumber.js";
import { useAnchorWallet } from "solana-wallets-vue";
import { useWorkspace } from "@/useWorkspace";
import { storeToRefs } from "pinia";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const reward = ref(0);
    const teamSums = ref(0);
    const AnchorWallet = useAnchorWallet();
    const workspaceStore = useWorkspace();
    const { workspace } = storeToRefs(workspaceStore);
    const isActive = ref(false);
    const getSubCount = async () => {
      const res = await fetch("/web/appUser/getAllSubordinates", {
        method: "POST",
        body: JSON.stringify({
          page: 1,
          pageSize: 1,
          referrer: AnchorWallet.value.publicKey.toBase58(),
        }),
      }).then((res) => res.json());
      console.log(res.data.total);
      teamSums.value = res.data.total;
    };
    const init = async () => {
      try {
        const { program } = workspace.value;
        const [pda, bump] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
          program.programId
        );
        const userAccount =
          await workspace.value.program.account.userAccount.fetch(pda);
        console.log("userAccount", userAccount);

        const [pda1, bump1] = PublicKey.findProgramAddressSync(
          [Buffer.from("config")],
          program.programId
        );
        const { payment } = await program.account.config.fetch(pda1);
        console.log(payment.toString(), userAccount.purchaseCount);
        reward.value = BigNumber(payment.toString())
          .div(LAMPORTS_PER_SOL)
          .times(userAccount.purchaseCount)
          .toFixed(2);
      } catch (e) {
        console.log(e);
      }

      setTimeout(init, 6000);
    };
    watch(AnchorWallet, () => {
      if (AnchorWallet.value) {
        init();
        getSubCount();
      }
    });
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
  color: #4a4a4a;
}
</style>
