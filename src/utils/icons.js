import Vue from "vue"
import eIconPiker from "e-icon-picker"
//基本彩色图标库
import "e-icon-picker/lib/symbol"
//基本样式，包含基本图标
import "e-icon-picker/lib/index.css"
//font-awesome图标库
import "font-awesome/css/font-awesome.min.css"
//element-ui图标库
import "element-ui/lib/theme-chalk/icon.css"

Vue.use(eIconPiker, {
  FontAwesome: true,
  ElementUI: true,
  eIcon: true,
  //是否开启彩色图标
  eIconSymbol: true
})

/**
 * 弃用
 */
// export default [
//   "icon-shiwu",
//   "icon-qialuli",
//   "icon-youyong",
//   "icon-xianxing-_youjian",
//   "icon-xianxing-_caidan-shousuo",
//   "icon-xianxing-_wenjian3",
//   "icon-xianxing-_duogeyonghu"
// ]