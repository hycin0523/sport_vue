<template>
  <div>
    <el-card class="main-card">
      <div v-show="!open">
        <el-row>
          <el-col :span="8">
            <el-input placeholder="请输入内容" clearable v-model="queryInfo.queryString" @clear="findPage">
              <el-button slot="append" icon="el-icon-search" @click="findPage" />
            </el-input>
          </el-col>
          <el-col :span="2">
            <el-button style="margin-left: 10px" @click="insert" v-has-permission="['USER_INSERT']" type="primary">
              添加信息
            </el-button>
          </el-col>
        </el-row>
        <el-table
          :data="tableList"
          stripe
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading">
          <el-table-column type="index" label="序号" />
          <el-table-column prop="name" label="用户名" />
          <el-table-column prop="sex" label="性别" :formatter="formatSex" />
          <el-table-column label="头像">
            <template slot-scope="scope">
              <el-image
                style="width: 100px; height: 100px"
                :src="scope.row.avatar.startsWith('https') ? scope.row.avatar : $qiniu + scope.row.avatar"
                :preview-src-list="preview(scope.row.avatar)">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="角色标签值">
            <template slot-scope="scope">
              <el-tag size="mini" v-for="(item, index) in scope.row.roles" :key="index">{{ item.label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phoneNumber" label="电话号码" />
          <el-table-column prop="address" label="地址" show-overflow-tooltip />
          <el-table-column fixed="right" label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="primary" @click="update(scope.row)" v-has-permission="['USER_UPDATE']" size="small"
                         icon="el-icon-edit" circle />
              <el-button type="danger" @click="deleteById(scope.row)" v-has-permission="['USER_DELETE']" size="small"
                         icon="el-icon-delete" circle />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="total > 0"
          @size-change="handlePageSize"
          @current-change="handlePageNumber"
          :current-page="queryInfo.pageNumber"
          :page-sizes="[7, 15, 50, 100]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" />
      </div>
      <handle v-show="open" :title="title" :form=" form" @cancel="cancel" />
    </el-card>
  </div>
</template>

<script>
import handle from "@/views/system/user/handle.vue";

export default {
  components: {
    handle
  },

  data() {
    return {
      //分页查询条件
      queryInfo: {
        //页码
        pageNumber: 1,
        //页数据条数
        pageSize: 7,
        //关键字
        queryString: null
      },
      //表格数据
      tableList: [],
      //总记录数
      total: 0,
      //表单标题
      title: null,
      //是否打开对话框
      open: false,
      //表格加载
      loading: false,
      //表单数据
      form: {},
      //表单校验
      rules: {},
      //角色列表
      roles: []
    };
  },

  methods: {
    insert() {
      this.title = "新增用户";
      this.open = true;
      this.form = {};
    },
    update(row) {
      this.form = row;
      this.title = "修改用户";
      this.open = true;
    },
    /**
     * 分页查询
     */
    findPage() {
      this.loading = true;
      this.$ajax.post("/user/findPage", this.queryInfo).then((res) => {
        this.loading = false;
        this.tableList = res.data.rows;
        this.total = res.data.total;
      });
    },
    /**
     * 页码改变事件
     */
    handlePageNumber(newPageNumber) {
      this.queryInfo.pageNumber = newPageNumber;
      this.findPage();
    },
    /**
     * 页数据条数改变事件
     */
    handlePageSize(newPageSize) {
      this.queryInfo.pageSize = newPageSize;
      this.findPage();
    },
    deleteById(row) {
      if (row.admin) {
        return this.$message.warning("对管理员用户不能执行此操作！");
      }
      let id = row.id;
      this.$confirm("您的操作将永久删除编号为{" + id + "}的数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        //调后端删除用户的接口
        this.$ajax.delete(`/user/delete/${id}`).then((res) => {
          if (res.data.flag) {
            this.$message.success(res.data.message);
          }
          this.queryInfo.pageNumber = 1;
          this.findPage();
        });
      });
    },
    /**
     * 头像预览
     */
    preview(src) {
      let arr = [];
      arr.push(src.startsWith("https") ? src : this.$qiniu + src);
      return arr;
    },
    /**
     * 性别格式化
     */
    formatSex(row) {
      if (row.sex === 0) {
        return "男";
      } else if (row.sex === 1) {
        return "女";
      } else {
        return "未知";
      }
    },
    /**
     * 用户点击取消
     */
    cancel() {
      this.open = false;
      this.findPage();
      this.form = {};
    }
  },

  created() {
    this.findPage();
  }
};
</script>

<style scoped>

</style>

