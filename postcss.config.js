module.exports = {
    plugins: {
      'postcss-import': {},
      tailwindcss: {},
      autoprefixer: {},
      // "postcss-pxtorem": {
      //   rootValue: 37.5, // 设计稿宽度的1/ 10 例如设计稿按照 1920设计 此处就为192
      //   propList: ["*", "!border"], // 除 border 外所有px 转 rem
      //   selectorBlackList: [], // 过滤掉.el-开头的class，不进行rem转换
      // },
    }
  }
  