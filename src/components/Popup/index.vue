<script lang="jsx">
import { useUsdtStore } from "@/store/wallet";
import { MinusSquareFilled } from "@vicons/antd";
import { Loader } from "@vicons/tabler";
import { NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePresale } from "../../store/presale";
import { useAnchorWallet } from "solana-wallets-vue";
import { useWorkspace, initWorkspace } from "@/useWorkspace";
import { storeToRefs } from "pinia";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN, web3 } from "@coral-xyz/anchor";

const InputGroup = defineComponent({
  props: ["maxCount"],
  setup(props, { emit }) {
    console.log("props", props);
    const message = useMessage();
    const { t } = useI18n();
    const amount = ref(1);
    const minusColor = ref("#DADADA");
    const onChange = (e) => {
      if (isNaN(Number(e))) {
        message.warning(t("vilidInput"));
        return;
      }
      if (Number(e) < 1) {
        amount.value = 1;
      } else {
        if (e > props.maxCount) {
          amount.value = props.maxCount;
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
        <NIcon
          size={30}
          color={minusColor.value}
          class="group-middle"
          onClick={onChange.bind(null, amount.value - 1)}
        >
          <MinusSquareFilled />
        </NIcon>
        <n-input
          type="number"
          readonly
          value={amount.value}
          style="width:70px;--n-height:25px;text-align:center;"
          onChange={onChange}
        />
        <img
          class="group-middle"
          src="/assets/add.png"
          width={25}
          onClick={onChange.bind(null, amount.value + 1)}
        />
      </NSpace>
    );
  },
});
export default {
  setup(prop, { expose }) {
    const presaleStore = usePresale();
    const { t } = useI18n();
    const AnchorWallet = useAnchorWallet();
    const workSpaceStore = useWorkspace();
    const { workspace } = storeToRefs(workSpaceStore);
    const info = ref({
      maxPurchasesPerUser: 1,
      payment: 0.01,
      usePurchaseCount: 0,
    });
    const price = computed(() => info.value.payment);
    const usdtStore = useUsdtStore();
    const isVisiabled = ref(false);
    const message = useMessage();
    const amount = ref(1);
    const loading = ref(false);
    const changeVisiabled = (bool) => {
      isVisiabled.value = bool;
    };

    const releasePurchaseCount = computed(
      () => info.value.maxPurchasesPerUser - info.value.usePurchaseCount
    );

    const solBalance = ref(0);
    watch(AnchorWallet, async (value) => {
      if (value) {
        const { program, connection } = workspace.value;
        console.log("program", program);
        if (program) {
          try {
            const [pda, bump] = PublicKey.findProgramAddressSync(
              [Buffer.from("config")],
              program.programId
            );

            const [pda2, bump2] = PublicKey.findProgramAddressSync(
              [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
              program.programId
            );
            const res = await program.account.config.fetch(pda);
            console.log("config", res);
            info.value.maxPurchasesPerUser = res.maxPurchasesPerUser;
            info.value.payment = BigNumber(res.payment.toString())
              .div(LAMPORTS_PER_SOL)
              .toFixed(2);
            const userRes = await program.account.userAccount.fetch(pda2);
            info.value.usePurchaseCount = userRes.purchaseCount;

            console.log("info", info);
          } catch (err) {
            console.log("err", err);
          }
        }

        if (connection) {
          try {
            const balance = await connection.getBalance(
              AnchorWallet.value.publicKey
            );
            console.log("balance", balance.toString());
            solBalance.value = BigNumber(balance.toString())
              .div(LAMPORTS_PER_SOL)
              .toFixed(2);
          } catch (err) {
            console.log("err", err);
          }
        }
      }
    });
    watch(isVisiabled, (value) => {
      !value && (amount.value = 1);
    });

    let isOverBalanceOf = computed(
      () =>
        BigNumber(solBalance.value).lt(amount.value * price.value) ||
        !Number(amount.value)
    );
    const changeValue = (e) => {
      if (!isNaN(Number(e))) {
        amount.value = Number(e);
      }
    };
    const payabled = async () => {
      loading.value = true;
      let _price = amount.value * price.value;
      try {
        const { program, connection } = workspace.value;

        const [pda, bump] = PublicKey.findProgramAddressSync(
          [Buffer.from("config")],
          program.programId
        );
        const { admin, projectWallet, defaultReferrer, mintToken } =
          await program.account.config.fetch(pda);
        /** 用户pda */
        const [pda1, bump1] = PublicKey.findProgramAddressSync(
          [Buffer.from("bruh"), AnchorWallet.value.publicKey.toBuffer()],
          program.programId
        );
        /** config pda */
        const [pda2, bump2] = PublicKey.findProgramAddressSync(
          [Buffer.from("config")],
          program.programId
        );

        /** authority */
        const [pda3, bump3] = PublicKey.findProgramAddressSync(
          [Buffer.from("authority")],
          program.programId
        );

        let referrers = [];
        while (referrers.length < 3) {
          const [pda, bump] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("bruh"),
              referrers.length
                ? new PublicKey(referrers[referrers.length - 1]).toBuffer()
                : AnchorWallet.value.publicKey.toBuffer(),
            ],
            program.programId
          );
          const referrer = await program.account.userAccount
            .fetch(pda)
            .then(({ referrer }) => referrer.toBase58())
            .catch(() => projectWallet.toBase58());

          console.log(referrer, PublicKey.default.toBase58());
          if (referrer === PublicKey.default.toBase58()) {
            let _arrs = Array.from({ length: 3 }).map(
              (_, i) => referrers[i] || projectWallet.toBase58()
            );
            referrers = _arrs;
            break;
          } else {
            referrers.push(referrer);
          }
        }

        const userAta = getAssociatedTokenAddressSync(
          mintToken,
          AnchorWallet.value.publicKey
        );
        console.log("userAta", userAta.toBase58());
        const userAtaInfo = await connection.getAccountInfo(userAta);

        const transition = new web3.Transaction();

        console.log("userAta", userAtaInfo);
        if (!userAtaInfo) {
          /** 创建ATA */
          transition.add(
            createAssociatedTokenAccountInstruction(
              AnchorWallet.value.publicKey,
              userAta,
              AnchorWallet.value.publicKey,
              mintToken
            )
          );
        }

        const projectAta = getAssociatedTokenAddressSync(mintToken, admin);
        const projectAtaInfo = await connection.getAccountInfo(projectAta);

        if (!projectAtaInfo) {
          message.error("Something went wrong");
          loading.value = false;
          return;
        }

        console.log(
          "totalAmount",
          _price,
          BigNumber(_price).times(LAMPORTS_PER_SOL).toFixed(0)
        );
        console.log({
          user: AnchorWallet.value.publicKey.toBase58(),
          userAccount: pda1.toBase58(),
          config: pda2.toBase58(),
          projectWallet: projectWallet.toBase58(),
          referrer1: referrers[0],
          referrer2: referrers[1],
          referrer3: referrers[2],
          authorizer: pda3.toBase58(),
          userTokenAccount: userAta.toBase58(),
          projectTokenAccount: projectAta.toBase58(),
          tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
          systemProgram: SystemProgram.programId.toBase58(),
        });
        let bn = new BN(BigNumber(_price).times(LAMPORTS_PER_SOL).toString());
        const privateSaleTx = await program.methods
          .privateSale(bn)
          .accounts({
            user: AnchorWallet.value.publicKey,
            userAccount: pda1,
            config: pda2,
            projectWallet: projectWallet.toBase58(),
            referrer1: referrers[0],
            referrer2: referrers[1],
            referrer3: referrers[2],
            authorizer: pda3,
            userTokenAccount: userAta,
            projectTokenAccount: projectAta,
            tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        transition.add(privateSaleTx);

        const { blockhash } = await connection.getRecentBlockhash();
        transition.recentBlockhash = blockhash;
        transition.feePayer = AnchorWallet.value.publicKey;
        const signedTransaction = await program.provider.wallet.signTransaction(
          transition
        );
        const tx = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        setTimeout(async () => {
          await connection.confirmTransaction(tx);
          await fetch("/web/privateSale/createBruhPrivateSale", {
            method: "POST",
            body: JSON.stringify({
              txId: tx,
            }),
          }).then((res) => res.json());
          message.success(t("succeeded"));
          loading.value = false;
        });
      } catch (err) {
        console.log("err", err);
        message.error(t("failed"));
        loading.value = false;
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
            <p class="text-white text-center text-xl">{t("confirmOrders")}</p>
            <NThing
              class="border"
              v-slots={{
                avatar: () => (
                  <n-image
                    width="50"
                    src="/assets/logo.jpg"
                    class="rounded-full"
                  />
                ),
                header: () => (
                  <NScrollbar style="max-height: 40px;color:#fff;">
                    <span>{t("joinGetReward")}</span>
                  </NScrollbar>
                ),
                description: () => (
                  <span style="color:#F6C72F;font-size:16px;font-weight:bold;">
                    {price.value} SOL{t("least")}
                  </span>
                ),
              }}
            />
            <NSpace justify="space-between" align="center" class="border">
              <div class="amount">{t("quantity")}</div>
              <InputGroup
                onChange={changeValue}
                maxCount={releasePurchaseCount.value}
              />
            </NSpace>
            <NSpace justify="space-between" align="center" class="border">
              <div class="amount">{t("totalPrice")}</div>
              <NP style="color:#F6C72F;--n-font-size:20px;">
                {(amount.value * price.value).toFixed(4)} SOL
              </NP>
            </NSpace>
            <NSpace justify="space-between" align="center" class="text">
              <span>{t("walletBalanceOf")}</span>
              <span>{solBalance.value} SOL</span>
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
