import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/login.vue";
import Home from "@/views/home.vue";
import store from "@/store";
import ajax from "@/utils/ajax";
import { formatMenus } from "@/utils/initMenu";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    component: Login
  },
  {
    path: "/",
    component: Home
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

/**
 * 路由导航
 * to：将要去到哪个页面
 * from：从哪个页面过来
 * next：放行到哪个页面
 */
router.beforeEach((to, from, next) => {
  // console.log(router)
  //判断用户是否登录
  const token = sessionStorage.getItem("token");
  if (!token) {
    if (to.path === "/login") {
      next();
    } else {
      next(`/login?direct=${to.fullPath}`);
    }
  } else {
    //向后端发送请求，获取用户的基本信息
    ajax.get("/user/getInfo").then((res) => {
      //得到用户信息
      // console.log("用户信息",res)
      const user = res.data.data;
      store.commit("setName", user.name);
      store.commit("setAvatar", user.avatar);
      if (user.roles.length > 0) {
        //添加角色、菜单、权限等信息
        store.commit("setRoles", user.roles);
        //格式化菜单
        const menuList = formatMenus(user.menus);
        router.addRoutes(menuList);
        store.commit("setMenus", menuList);
        store.commit("setPermissions", user.permissions);
      }
    });
    //已经登录
    if (to.path === "/login") {
      next("/");
    } else {
      next();
    }
  }
});

export default router;
