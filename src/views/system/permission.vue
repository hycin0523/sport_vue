<template>
  <div>
    <el-card class="main-card">
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.queryString" @clear="findPage">
            <el-button slot="append" icon="el-icon-search" @click="findPage" />
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button style="margin-left: 10px" @click="insert" v-has-permission="['PER_INSERT']" type="primary">
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
        <el-table-column prop="label" label="权限标签" />
        <el-table-column prop="code" label="权限标签值" />
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch
              v-has-permission="['PER_UPDATE']"
              @change="updateStatus(scope.row)"
              v-model="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" @click="update(scope.row)" v-has-permission="['PER_UPDATE']" size="small"
                       icon="el-icon-edit" circle />
            <el-button type="danger" @click="deleteById(scope.row.id)" v-has-permission="['PER_DELETE']" size="small"
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
    </el-card>
    <!-- 表单添加/修改 -->
    <el-dialog :title="title" :visible.sync="open" width="30%" @close="dialogClose">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="权限标签" prop="label">
          <el-input v-model="form.label" />
        </el-form-item>
        <el-form-item label="权限标签值" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="form.status" class="status-class">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clickCancel">取 消</el-button>
        <el-button type="primary" @click="clickOk">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
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
      rules: {
        label: [
          { required: true, message: "请输入权限标签", trigger: "blur" },
          { min: 1, max: 50, message: "权限标签长度在 1 到 50 个字符", trigger: "blur" }
        ],
        code: [
          { required: true, message: "请输入权限标签值", trigger: "blur" },
          { min: 1, max: 20, message: "权限标签值长度在 1 到 20 个字符", trigger: "blur" }
        ],
        status: [
          { required: true, message: "请选择状态", trigger: "blur" }
        ]
      }
    };
  },

  methods: {
    insert() {
      this.title = "新增权限";
      this.open = true;
      this.form = {};
    },
    update(row) {
      this.form = row;
      this.title = "修改权限";
      this.open = true;
    },
    /**
     * 分页查询
     */
    findPage() {
      this.loading = true;
      this.$ajax.post("/permission/findPage", this.queryInfo).then((res) => {
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
    deleteById(id) {
      this.$confirm("您的操作将永久删除编号为{" + id + "}的数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        //调后端删除权限的接口
        this.$ajax.delete(`/permission/delete/${id}`).then((res) => {
          this.$message.success(res.data.message);
          this.queryInfo.pageNumber = 1;
          this.findPage();
        });
      }).catch(() => {
      });
    },
    /**
     * 关闭对话框事件
     */
    dialogClose() {
      this.$refs.form.resetFields();
      this.findPage();
    },
    /**
     * 点击确定
     */
    clickOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return this.$message.error("表单校验未通过，请检查后提交！");
        if (this.form.id === undefined || this.form.id === null) {
          this.$ajax.post("/permission/insert", this.form).then((res) => {
            this.$message.success(res.data.message);
            this.open = false;
            this.findPage();
          });
        } else {
          this.$ajax.put("/permission/update", this.form).then((res) => {
            this.$message.success(res.data.message);
            this.open = false;
            this.findPage();
          });
        }
      });
    },
    /**
     * 点击取消
     */
    clickCancel() {
      this.form = {};
      this.open = false;
      this.findPage();
    },
    /**
     * 改变权限数据的状态
     */
    updateStatus(row) {
      this.$ajax.put("/permission/update", row).then((res) => {
        this.$message.success("状态更新成功！");
      });
    }
  },

  created() {
    this.findPage();
  }
};
</script>

<style scoped>
.status-class {
  margin-left: -50%;
}
</style>

