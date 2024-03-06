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
          <el-button style="margin-left: 10px" v-has-permission="['MENU_INSERT']" @click="insert" type="primary">
            添加信息
          </el-button>
        </el-col>
      </el-row>
      <!-- tree-props 渲染嵌套数据的配置选项 -->
      <el-table :data="tableList"
                stripe
                :tree-props="{children: 'children', hasChildren:'hasChildren'}"
                row-key="id"
                v-loading="loading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading">
        <el-table-column prop="path" label="前端路由" />
        <el-table-column prop="icon" label="图标" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="component" label="前端组件" />
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch
              v-has-permission="['MENU_UPDATE']"
              @change="updateStatus(scope.row)"
              v-model="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" @click="update(scope.row)" v-has-permission="['MENU_UPDATE']" size="small"
                       icon="el-icon-edit" circle />
            <el-button type="danger" @click="deleteById(scope.row.id)" v-has-permission="['MENU_DELETE']" size="small"
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
    <el-dialog :title="title" :visible.sync="open" width="40%" @close="dialogClose">
      <el-form :model="form" ref="form" :rules="rules" label-position="right" label-width="120px">
        <el-form-item label="是否是子级菜单" v-if="isChildrenMenu">
          <el-checkbox style="margin-left: -90%" v-model="isChildrenMenu" :disabled="disMenuSelect" />
        </el-form-item>
        <el-form-item label="父级菜单" prop="parentId" v-if="isChildrenMenu">
          <el-select v-model="form.parentId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="(item, index) in parentList"
              :key="index"
              :label="item.title"
              :value="item.id"
              :disabled="!item.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="前端路径" prop="path">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <e-icon-picker v-model="form.icon" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="前端组件" prop="component">
          <el-input v-model="form.component" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="form.status" class="status-class">
            <el-radio :disabled="disStatusRadio" :label="true">是</el-radio>
            <el-radio :disabled="disStatusRadio" :label="false">否</el-radio>
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
      form: {
        status: true
      },
      //表单校验
      rules: {
        parentId: [
          { required: true, message: "请选择父级菜单", trigger: "change" }
        ],
        path: [
          { required: true, message: "请输入菜单路径", trigger: "blur" },
          { min: 1, max: 100, message: "菜单路径的长度在 1 到 100 个字符", trigger: "change" }
        ],
        icon: [
          { required: true, message: "请选择菜单图标", trigger: "change" }
        ],
        title: [
          { required: true, message: "请输入菜单标题", trigger: "blur" },
          { min: 1, max: 50, message: "菜单标题的长度在 1 到 50 个字符", trigger: "blur" }
        ],
        component: [
          { required: true, message: "请输入菜单组件路径", trigger: "blur" },
          { min: 1, max: 50, message: "菜单路径的长度在 1 到 50 个字符", trigger: "blur" }
        ],
        status: [
          { required: true, message: "请选择是否启用", trigger: "change" }
        ]
      },
      //父级菜单列表
      parentList: [],
      //是否是子级菜单
      isChildrenMenu: true,
      //是否禁用checkbox
      disMenuSelect: false,
      //是否禁用Radio
      disStatusRadio: false
    };
  },

  methods: {
    findParent() {
      this.$ajax.get("/menu/findParent").then((res) => {
        this.parentList = res.data.data;
      });
    },
    insert() {
      this.disStatusRadio = false;
      this.title = "新增菜单";
      this.open = true;
      this.form = {};
    },
    update(row) {
      this.form = row;
      this.disStatusRadio = false;
      if (row.parentId !== null) {
        this.$ajax.put("/menu/findMenuById", row).then((res) => {
          this.disStatusRadio = !res.data.data.status;
        });
      }
      this.title = "修改菜单";
      if (row.parentId === null) {
        this.isChildrenMenu = false;
      } else {
        this.disMenuSelect = true;
      }
      this.open = true;
    },
    /**
     * 分页查询
     */
    findPage() {
      this.loading = true;
      this.$ajax.post("/menu/findPage", this.queryInfo).then((res) => {
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
    /**
     * 改变菜单数据的状态
     */
    updateStatus(row) {
      //启用菜单
      if (row.status === true) {
        //如果有父级
        if (row.parentId !== null) {
          this.$ajax.put("/menu/findMenuById", row).then((res) => {
            //检查父菜单是否处于禁用状态
            if (!res.data.data.status) {
              this.$message.error("请先启用父级菜单！");
            } else {
              this.$ajax.put("/menu/update", row).then((res) => {
                this.$message.success("状态更新成功！");
                this.findPage();
              });
            }
          });
        } else {
          this.$ajax.put("/menu/update", row).then((res) => {
            this.$message.success("状态更新成功！");
          });
        }
      }
      //禁用菜单
      if (row.status === false) {
        this.$ajax.put("/menu/updateMenuStatus", row).then((res) => {
          this.$message.success("状态更新成功！");
          this.findPage();
        });
      }
      this.findPage();
      window.location.reload();
    },
    deleteById(id) {
      this.$confirm("您的操作将永久删除编号为{" + id + "}的数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        //调后端删除权限的接口
        this.$ajax.delete(`/menu/delete/${id}`).then((res) => {
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
      this.isChildrenMenu = true;
      this.disMenuSelect = false;
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
          this.$ajax.post("/menu/insert", this.form).then((res) => {
            this.$message.success(res.data.message);
            this.open = false;
            this.findPage();
          });
        } else {
          //启用菜单
          if (this.form.status === true) {
            this.$ajax.put("/menu/update", this.form).then((res) => {
              this.$message.success(res.data.message);
              this.open = false;
              this.findPage();
            });
          }
          //禁用菜单
          if (this.form.status === false) {
            this.$ajax.put("/menu/updateMenuStatus", this.form).then((res) => {
              this.$message.success(res.data.message);
              this.open = false;
              this.findPage();
            });
          }
        }
      });
    },
    /**
     * 点击取消
     */
    clickCancel() {
      this.form = {};
      this.open = false;
      this.isChildrenMenu = true;
      this.disMenuSelect = false;
      this.findPage();
    }
  },

  created() {
    this.findPage();
    this.findParent();
  }
};
</script>

<style scoped>
.status-class {
  margin-left: -75%;
}
</style>

