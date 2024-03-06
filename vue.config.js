const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  //vue代理后端接口的配置
  devServer: {
    //设置端口信息
    port: 8888,
    //设置是否启动时打开浏览器
    open: true,
    //设置代理
    proxy: {
      //代理的根路径
      [process.env.VUE_APP_BASE_URL]: {
        //代理的后端路径
        target: "http://localhost:8080",
        //是否开启根路径转换
        changeOrigin: true,
        //代理路径更改
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_URL]: "/"
        }
      }
    },
    //关闭"Uncaught error"的全屏提示
    client: {
      overlay: false
    }
  },

  //vue打包配置

  //配置公共路径
  publicPath: "./",
  //打包文件夹
  outputDir: "dist",
  //将静态资源打包
  assetsDir: "static",
  //去除打包后的js的map文件
  productionSourceMap: false,
  configureWebpack: {
    //关闭警告
    performance: {
      hints: "warning",
      //入口起点的最大体积
      maxEntrypointSize: 500000000,
      //生成文件的最大体积
      maxAssetSize: 3000000,
    }
  }
});
