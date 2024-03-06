import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/utils/ajax";
import "@/utils/elementui";
import "@/assets/global.css";
import "@/utils/permission";
import "@/utils/icons";

Vue.prototype.$qiniu = "http://s9nu8lrju.hb-bkt.clouddn.com/";

Vue.config.productionTip = false;
Vue.config.devtools = false;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount("#app");
