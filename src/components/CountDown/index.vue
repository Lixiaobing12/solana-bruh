<script lang="jsx">
import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { NCountdown, NGrid, NGi, NSpace } from "naive-ui";
import moment from "moment";
import {
  get_default_presale_config,
  create_presale_order,
  get_user_presale_count,
} from "@/apis/api";

export default defineComponent({
  setup: () => {
    const { t } = useI18n();
    const endTime = ref("2023-07-22 23:59:59");
    const diff = computed(() => {
      const duration = moment(endTime.value, "YYYY-MM-DD HH:mm:ss").valueOf();
      const now = moment().valueOf();
      return duration - now;
    });
    const formatter = ({ hours, minutes, seconds }) => {
      let days = parseInt(hours / 24)
        .toString()
        .padStart(2, "0");
      hours = String(hours % 24).padStart(2, "0");
      let arr = [
        days,
        hours,
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ];
      let nameArr = ["ido.day", "ido.hour", "ido.minute", "ido.seconds"];
      return (
        <>
          <NGrid cols={4} class="content">
            {arr.map((item, index) => (
              <>
                <NGi>
                  <div class="item">
                    <div class="iborder">
                      <img src="/assets/countdownbg.png" width="60" alt="" />
                      <span class="bg-font">{item}</span>
                    </div>
                    <span style="color:#fff;margin-left:5px">
                      {t(nameArr[index])}
                    </span>
                  </div>
                </NGi>
              </>
            ))}
          </NGrid>
        </>
      );
    };
    fetch("/web/privateConfig/defaultPrivateConfig", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        console.log("res", res);
      });
    return () => (
      <>
        <NCountdown duration={diff.value} render={formatter} />
      </>
    );
  },
});
</script>
<style lang="less">
.content {
  .item {
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      color: #000;
    }
  }

  .iborder {
    color: #000;
    font-weight: bold;
    text-align: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bg-font {
    position: absolute;
    font-size: 25px;
    top: 12px;
  }
}
</style>
