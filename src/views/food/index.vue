<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="分类管理">
        <type :active="0" />
      </el-tab-pane>
      <el-tab-pane label="食物管理">
        <food :active="1" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import type from "@/views/food/type.vue";
import food from "@/views/food/food.vue";

export default {
  components: {
    type,
    food
  },

  data() {
    return {
      active: 0
    };
  }
};
</script>

<style scoped>

</style>

