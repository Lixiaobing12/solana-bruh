<script lang="jsx">
import { defineComponent, onMounted, ref, watch } from "vue";
import { NProgress, NSlider, NP } from "naive-ui";
import axios from "axios";
import {
  get_default_presale_config,
  create_presale_order,
  get_user_presale_count,
} from "@/apis/api";
export default defineComponent({
  setup() {
    const percentage = ref(0.0);
    const fetch = () => {
      get_default_presale_config().then((res) => {
        const { presale, totalPresale } = res.data;
        percentage.value = ((presale / totalPresale) * 100).toFixed(2);
      });
    };

    return () => (
      <div class="index">
        <NSlider
          style={{
            "--n-rail-height": "10px",
            "--n-rail-color": "#F6C72F",
            "--n-dot-border-active": "#B5F7D9",
            "--n-fill-color-hover": "#B5F7D9",
            "--n-rail-color-hover": "#F6C72F",
          }}
          value={percentage.value}
          step={0.01}
          tooltip={false}
          v-slots={{
            thumb: () => <div class="fill" />,
          }}
        ></NSlider>
        <NP style="--n-margin:0;color:#fff;">{percentage.value}%</NP>
      </div>
    );
  },
});
</script>
<style lang="less" scoped>
.index {
  margin: 16px 0 0;
  display: flex;
  align-items: center;

  ::v-deep(.n-slider-rail__fill){
    background-image: linear-gradient( 162deg, #F6C72F 0%, #F6E5D6 100%);
  }
  .n-p {
    flex-basis: 4em;
    text-align: center;
    color: #000;
    font-weight: bold;
  }

  .n-slider {
    width: auto;
    flex: 1;
  }

  .n-slider-rail {
    box-shadow: 0px 9px 12px -4px @grey-color;
  }
  ::v-deep(.n-slider-rail__fill) {
    transition: width 500ms ease-in-out;
  }
  ::v-deep(.n-slider-handle-wrapper) {
    transition: left 500ms ease-in-out;
  }
  .fill {
    display: flex;
  }

  .fill::after {
    content: "";
    width: 10px;
    height: 20px;
    background: linear-gradient( 180deg, #F6C72F 0%, #F6E5D6 100%);
    border-radius: 10px;
    border: 2px solid #fff;
  }
}
</style>
