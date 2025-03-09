<template>
  <div class="layout">
    <div>
      <slot />
    </div>
  </div>
</template>
<script setup>
import { computed } from "@vue/runtime-core";
import { useWallet } from "@/store/wallet";
import { useUsdtStore } from "../store/wallet";
import { storeToRefs } from "pinia";
import { initWorkspace } from "@/useWorkspace";

const iAsideShow = ref(false);
const iParentAddress = ref(null);
const cMargin = computed(() => (iAsideShow.value ? "0" : "3px 0"));

const init = async () => {
  initWorkspace();
};
onMounted(() => {
  init();
  const match = window.location.href.match(/\?code=([^&]*)/);
  const parent_code = match ? match[1] : null;
  if (parent_code) {
    iParentAddress.value = parent_code;
  }
});
</script>

<style lang="less" scoped>
.layout {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #00feef 30%, #785ef0);
  background-size: 100% 100%;

  .header {
    height: 90px;

    span {
      color: @grey-color;
    }
  }

  .active {
    font-weight: bold !important;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .active::after {
    content: "";
    width: 50px;
    height: 10px;
    position: absolute;
    top: 20px;
    background-image: url("/assets/active.png");
    background-size: 100% 100%;
  }

  .connect-btn {
    background-image: url("/assets/connect.png");
    background-size: 100% 100%;
  }

  .menu {
    display: inline-flex;
    flex-direction: column;
    vertical-align: middle;
    position: relative;
    width: 30px;
    margin-left: 20px;

    span {
      line-height: 1;
      display: flex;
      flex-direction: column;
      margin: v-bind(cMargin);
      transition: transform 200ms ease-in-out;

      &::after {
        content: "";
        width: 30px;
        height: 4px;
        color: #000;
        background-color: #000;
      }
    }

    .menu-bottom {
      position: absolute;
      transform: rotate(45deg);
      transform-origin: center;
    }

    .menu-top {
      position: absolute;
      transform: rotate(-45deg);
      transform-origin: center;
    }
  }
}

.drawer-btn {
  background-image: url("/assets/connect.png");
  background-size: 100% 100%;
  width: 150px;
  height: 48px;
}

.drawer-btn-active {
  display: flex;
  flex-direction: column;
  position: relative;

  &::after {
    content: "";
    width: 50px;
    height: 10px;
    top: 20px;
    background-image: url("/assets/active.png");
    background-size: 100% 100%;
  }
}
</style>
