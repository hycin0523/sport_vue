import Home from "@/views/home.vue";

/**
 * 格式化菜单，将菜单转换为组件
 * @param menus 传入菜单信息
 */
export const formatMenus = (menus) => {
  /**
   * 迭代菜单，并对菜单进行改造，返回格式化后的菜单
   */
  const route = menus.filter(item => {
    item.component = (item.component === "home") ? Home : loadView(item.component);
    // item.icon = 'iconfont ' + item.icon
    item.meta = {
      title: item.title
    }
    //处理子菜单
    if (item.children && item.children.length > 0) {
      formatMenus(item.children);
    }
    return true;
  });
  //将格式化后的菜单返回
  return route;
};

/**
 * 路由懒加载
 * @param {string} view 组件路径
 * @returns {function(*): any} 路由组件
 */
const loadView = (view) => {
  return (resolve) => require([`@/views/${view}.vue`], resolve);
};