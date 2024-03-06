import Vue from "vue";
import store from "@/store";

/**
 * 自定义角色指令(参数1：指令, 参数2：实现方法)
 */
Vue.directive("hasRole", {
  inserted(el, binding) {
    //获取指令传递过来的数据
    const { value } = binding;
    //获取vuex中的角色信息
    const roles = store.state.roles;
    //定义超级管理员可以查看所有
    const admin = "SUPER_ADMIN";
    if (value && value instanceof Array && value.length > 0) {
      const hasRole = roles.some(item => {
        return item.code === admin || value.includes(item.code);
      });
      //如果没有该角色
      if (!hasRole) {
        //移除对应元素
        el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(`请设置${value}对应角色标签`);
    }
  }
});

/**
 * 自定义权限指令
 */
Vue.directive("hasPermission", {
  inserted(el, binding) {
    const { value } = binding;
    const permissions = store.state.permissions;
    const roles = store.state.roles;
    const admin = "SUPER_ADMIN";
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = permissions.some(item => {
        return value.includes(item.code);
      });
      const hasRole = roles.some(item => {
        return item.code === admin;
      });
      if(!hasPermission && !hasRole) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置${value}对应权限标签`);
    }
  }
});
