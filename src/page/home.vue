<template>
  <n-grid cols="24" item-responsive v-cloak>
    <NGi span="24 600:12 800:8" offset="0 600:6 800:8">
      <div class="home-container">
        <div class="header">
          <n-space justify="space-between" align="center" style="padding: 30px 20px 20px">
            <strong style="color: #fff; font-size: 18px">
              POPOY
            </strong>
            <div>
              <div class="flex gap-4 items-center">
                <!-- <button class="border rounded-full px-2">{{ $t('connectWallet') }}</button> -->
                <wallet-multi-button></wallet-multi-button>
                <div class="relative">
                  <img src="/assets/lang.png" width="20" alt="" @click="
                    () => {
                      langMode = !langMode;
                      menuMode = false;
                    }
                  " />
                  <div class="absolute z-10 top-8 flex flex-col gap-2" :style="{ display: langMode ? 'flex' : `none` }">
                    <img src="/assets/en.png" width="20" alt="" @click="changelang('en')" />
                    <img src="/assets/zh.png" width="20" alt="" @click="changelang('zh')" />
                  </div>
                </div>
              </div>
            </div>
          </n-space>
        </div>
        <n-card class="my--card" style="
            --n-color: transparent;
            --n-text-color: #000;
            --n-title-text-color: #000;
            --n-padding-bottom: 0;
          " :bordered="false">
          <NSpace vertical>
            <CountDown />
            <Step />
            <NSpace justify="space-between" align="center" style="gap: 0">
              <div style="
                  background: linear-gradient(
                    271deg,
                    #181d1c 0%,
                    #1a1e1c 7%,
                    #413612 22%,
                    #4d3e0f 46%,
                    #6a3a1d 75%,
                    #6a3126 100%
                  );
                  padding: 8px;
                  border-radius: 9999px;
                  width: 88vw;
                  margin-top: 16px;
                ">
                <NTag size="large" round style="
                    text-align: center;
                    --n-text-color: #000;
                    --n-height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    --n-border: 0;
                    background: #f6c72f;
                    border: 0;
                    font-weight: bold;
                  " @click="!isdone && popupRef.changeVisiabled(true)">
                  <NSpin :size="16" stroke="#fff" v-if="loading">
                    <template #icon>
                      <img src="/assets/loading.svg" alt="" width="16" />
                    </template>
                  </NSpin>
                  {{ isdone ? $t("done") : $t("join") }}
                </NTag>
              </div>
            </NSpace>
          </NSpace>
        </n-card>
      </div>

      <div class="home-body">
        <div style="color: #fff; font-size: 16px">{{ $t("myassets") }}</div>
        <n-card class="my--card assts-card glass-shadow" style="
            --n-color: #fff;
            --n-text-color: #000;
            --n-title-text-color: #000;
            --n-padding-bottom: 0;
          " :bordered="false">
          <Asset />
        </n-card>

        <div style="color: #fff; font-size: 16px">{{ $t("invitefrient") }}</div>
        <div class="my--card assts-card glass-shadow" style="padding: 12px; display: flex; flex-direction: column">
          <Bind />
          <div style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            " v-if="userInfo?.parentAddr">
            <div style="color: #bbb">{{ $t("parent") }}:</div>
            <div @click="copy(userInfo?.parentAddr)">
              <i style="color: #f6c72f; text-decoration: underline">{{
                userInfo?.parentAddr?.replace(/^(.{6}).*(.{4})$/, "$1...$2")
              }}</i>
            </div>
          </div>
        </div>

        <div style="position: relative; margin-bottom: 30px">
          <div class="btn-group">
            <div class="btn1" :class="[activeTab === 'order' ? 'btn-active' : '']" @click="activeTab = 'order'">
              {{ $t("orderList") }}
            </div>
            <div class="btn1" :class="[activeTab === 'team' ? 'btn-active' : '']" @click="activeTab = 'team'">
              {{ $t("myteam") }}
            </div>
          </div>
          <div class="glass-shadow rounded-2xl" style="height: 300px">
            <Orders v-if="activeTab === 'order'" />
            <Team v-else />
          </div>
        </div>
      </div>
    </NGi>
  </n-grid>
  <Popup ref="popupRef" />
  <PayPopup ref="payPopupRef" />
</template>
<script setup>
import { useWallet } from "@/store/wallet";
import { NAvatar, useMessage } from "naive-ui";
import { useI18n } from "vue-i18n";
import Asset from "@/components/Asset/index.vue";
import Orders from "@/components/Order/index.vue";
import Popup from "@/components/Popup/index.vue";
import PayPopup from "@/components/Popup/pay.vue";
import { computed, h, onMounted, provide } from "vue";
import Bind from "@/components/Bind/index.vue";
import Team from "@/components/Team/index.vue";
import useClipboard from "vue-clipboard3";
import { storeToRefs } from "pinia";
import { get_default_presale_config } from "@/apis/api";
import { useRouter } from "vue-router";
import { WalletMultiButton, useAnchorWallet } from "solana-wallets-vue";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import IDL from "@/idl.json";
import { useWorkspace, initWorkspace } from "../useWorkspace";
import { watch } from "vue";

const workSpaceStore = useWorkspace();
const { workspace } = storeToRefs(workSpaceStore);

const { t, locale } = useI18n();
const langMode = ref(false);
const AnchorWallet = useAnchorWallet();

const menuMode = ref(false);
const walletStore = useWallet();
const { connect, wallet, sign } = walletStore;
const { userInfo } = storeToRefs(walletStore);
const loading = ref(false);
const { toClipboard } = useClipboard();
const activeTab = ref("order");
const realease_orders = ref(300);
const message = useMessage();
const router = useRouter();

const menuOptinos = [
  {
    icon: "/assets/home.png",
    label: "home",
    click: () => {
      window.open("https://pluscr.com/");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/ido.png",
    label: "ido",
    click: () => {
      router.push("/");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/eno.png",
    label: "eno",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/notice.png",
    label: "notice",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/miner.png",
    label: "mint",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/team.png",
    label: "team",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/nft.png",
    label: "NFT",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
  {
    icon: "/assets/vote.png",
    label: "vote",
    click: () => {
      message.info("Coming soon...");
      menuMode.value = false;
    },
  },
];
const renderComponent = (_name, _url) =>
  h(
    "div",
    {
      style: "display:flex;align-items:center;justiry-content:center;",
    },
    [
      h("span", null, {
        default: () => _name,
      }),
      h(NAvatar, {
        round: true,
        style: "margin: 0 12px;",
        src: _url,
      }),
    ]
  );
let options = ref([
  {
    label: "CN",
    key: "zh",
    select: true,
    url: "/assets/zh.png",
    render: renderComponent.bind(null, "CN", "/assets/zh.png"),
  },
  {
    label: "EN",
    key: "en",
    select: false,
    url: "/assets/en.png",
    render: renderComponent.bind(null, "EN", "/assets/en.png"),
  },
]);

const copy = async (value) => {
  await toClipboard(value);
  message.success(t("ido.copied"));
};
const changelang = (lang) => {
  console.log(lang);
  locale.value = lang;
  langMode.value = false;
};
const handleSelect = (e) => {
  options.value = options.value.map((item) => {
    if (item.key === e) item.select = true;
    else item.select = false;
    return item;
  });
  locale.value = e;
};
const isdone = ref(false);
const popupRef = ref(null);
const payPopupRef = ref(null);

provide("payPopupRef", payPopupRef);

watch([() => workspace.value, () => AnchorWallet.value], async () => {

  if (workspace.value && workspace.value.program && AnchorWallet.value) {
    console.log('workspace', workspace);
    console.log('AnchorWallet', AnchorWallet.value)

    const { program } = workspace.value;
    console.log('program', program);
    const baseAccount = Keypair.generate();

    // 生成pda账户
    const seeds = [
      Buffer.from('bruh'),
      AnchorWallet.value.publicKey.toBuffer()
    ]
    const [pda, bump] = PublicKey.findProgramAddressSync(seeds, program.programId);
    // 调用读方法

    // program.account.userAccount.fetch(pda.toBase58()).then(res => {
    //   console.log('res', res)
    // }).catch(err => {
    //   console.log('err', err)
    // })
    const referrer = 'HKrPoMaCLRee7c9GYQtVGtKiajAyraVjjxVqGUSd1oa4';
    const referrerPk = new PublicKey(referrer);

    const seeds2 = [
      Buffer.from('bruh'),
      referrerPk.toBuffer()
    ]
    const [referrerPda, referrerBump] = PublicKey.findProgramAddressSync(seeds2, program.programId);
    // 调用读参数
    program.rpc.bindReferrer(referrerPk, {
      accounts: {
        user: AnchorWallet.value.publicKey,
        userAccount: pda,
        referrerAccount: referrerPda,
        systemProgram: SystemProgram.programId
      },
      signers:[AnchorWallet.value]
    }).then(res => {
      console.log('res', res);
    }).catch(err => {
      console.error('err', err)
    })
  }
})

onMounted(() => {
  initWorkspace();
})
</script>
<style lang="less" scoped>
.home-container {
  // background-image: url("/assets/home_h.png");
  background-size: 100% 100%;
  padding-bottom: 30px;
  border-radius: 30px;
}

.header {
  margin-bottom: 20px;


  ::v-deep(.swv-button) {
    font-size: 12px;
    font-weight: 500;
    height: auto;
    line-height: 30px;
    padding: 0 16px;
    border-radius: 8px;
  }
}

.home-body {
  padding: 16px;
}

.btn-group {
  display: flex;
  gap: 8px;
  margin: 24px 0 12px;
}

.btn1 {
  width: fit-content;
  padding: 5px 15px;
  color: #fff;
  border-radius: 9999px;
}

.btn-active {
  background: #f6c72f;
  color: #000;
}

.my--card {
  position: relative;

  ::v-deep(.n-card-header) {
    padding: 10px 15px;
  }

  .top-card {
    height: 40px;
    width: 45%;
    background-image: linear-gradient(to right,
        #ddf0e6,
        #bef79c,
        #b5f7d9,
        #cbf1ef);
    line-height: 40px;
    font-size: 18px;
    font-weight: bold;
    position: absolute;
    left: 0;
    border-radius: 20px 20px 20px 0;
    top: -20px;
    text-align: center;
  }

  .left-bar {
    position: absolute;
    width: 5px;
    height: 100px;
    background-image: linear-gradient(to top,
        #ddf0e6,
        #bef79c,
        #b5f7d9,
        #cbf1ef);
    left: 0;
    top: 100px;
  }
}

.card-after {
  width: 100%;
  height: 50px;
  position: relative;
  top: 10px;
  background-color: #bcf6e1;
  border-radius: 20px 20px 0 0;
}

.assts-card {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 30px 16px 16px;
  margin: 12px 0 20px;
  border-radius: 20px;
}

.card-title {
  position: absolute;
  background-image: linear-gradient(to right,
      #ddf0e6,
      #bef79c,
      #b5f7d9,
      #cbf1ef);
  width: 60%;
  height: 40px;
  line-height: 40px;
  border-radius: 15px;
  top: -20px;
  text-align: center;
  left: 20%;
  font-size: 18px;
  font-weight: bold;
}

.tag--round {
  ::v-deep(.n-tag__content) {
    display: flex;
    align-items: center;

    & span:first-of-type {
      margin-right: 10px;
    }
  }
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

.join-btn {
  background-color: #1a7f5b;
  background-size: 100% 100%;
  width: 120px;
  height: 48px;
}
</style>
