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
          <el-button style="margin-left: 10px" @click="insert" v-has-permission="['PER_ROLE_INSERT']" type="primary">
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
        <el-table-column prop="label" label="角色标签" />
        <el-table-column prop="code" label="角色标签值" />
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch
              v-has-permission="['PER_ROLE_UPDATE']"
              @change="updateStatus(scope.row)"
              v-model="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" @click="update(scope.row)" v-has-permission="['PER_ROLE_UPDATE']" size="small"
                       icon="el-icon-edit" circle />
            <el-button type="danger" @click="deleteById(scope.row.id)" v-has-permission="['PER_ROLE_DELETE']"
                       size="small" icon="el-icon-delete" circle />
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
    <el-dialog :title="title" class="dialog" :visible.sync="open" width="40%" @close="dialogClose">
      <el-form :model="form" ref="form" :rules="rules">
        <el-row>
          <el-col :span="11">
            <el-form-item label="角色标签" prop="label">
              <el-input v-model="form.label" />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="角色标签值" prop="code">
              <el-input v-model="form.code" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="23">
            <el-card>
              <div slot="header" class="clearfix">
                <span>菜单列表</span>
              </div>
              <el-tree
                ref="tree"
                check-strictly
                highlight-current
                :data="menuList"
                show-checkbox
                node-key="id"
                :props="{ label:'title', children: 'children' }"
                @check-change="treeChange" />
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="23">
            <el-card>
              <div slot="header" class="clearfix">
                <span>权限列表</span>
              </div>
              <el-checkbox-group v-model="checkPermissions">
                <el-checkbox
                  border
                  size="small"
                  v-for="(item, index) in permissions"
                  :disabled="!item.status"
                  :label="item.label"
                  :key="index"
                  @change="checked => permissionChange(item, checked)" />
              </el-checkbox-group>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否启用" prop="status">
              <el-radio-group v-model="form.status" class="status-class">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
          { required: true, message: "请输入角色标签", trigger: "blur" },
          { min: 1, max: 50, message: "角色标签长度在 1 到 50 个字符", trigger: "blur" }
        ],
        code: [
          { required: true, message: "请输入角色标签值", trigger: "blur" },
          { min: 1, max: 20, message: "角色标签值长度在 1 到 20 个字符", trigger: "blur" }
        ]
      },
      //菜单列表
      menuList: [],
      //选中的菜单信息
      checkMenus: [],
      //权限列表
      permissions: [],
      //选中的权限
      checkPermissions: [],
      //这里是实际提交给后端的权限数据
      submitPermissions: []
    };
  },

  methods: {
    insert() {
      this.title = "新增角色";
      this.open = true;
      this.form = {
        status: true
      };
    },
    update(row) {
      this.checkMenus = [];
      this.checkPermissions = [];
      this.form = row;
      this.title = "修改角色";
      row.menus.forEach(item => {
        this.checkMenus.push(item);
        if (item.children && item.children.length > 0) {
          item.children.forEach(i => {
            this.checkMenus.push(i);
          });
        }
      });
      row.permissions.forEach(item => {
        this.checkPermissions.push(item.label);
        this.submitPermissions.push(item);
      });
      //添加异步方法
      this.$nextTick(() => {
        this.$refs.tree.setCheckedNodes(this.checkMenus);
      });
      this.open = true;
    },
    /**
     * 查询所有菜单信息和权限信息
     */
    findMenusAndPermissions() {
      this.$ajax.get("/menu/findParent").then((res) => {
        this.menuList = res.data.data;
        //为菜单列表增加disabled属性，实现禁用效果
        this.menuList.filter(item => {
          item.disabled = !item.status;
          if (item.children && item.children.length > 0) {
            item.children.filter(i => {
              i.disabled = !i.status;
            });
          }
          return true;
        });
      });
      this.$ajax.get("/permission/findAll").then((res) => {
        this.permissions = res.data.data;
      });
    },
    /**
     * 分页查询
     */
    findPage() {
      this.loading = true;
      this.$ajax.post("/role/findPage", this.queryInfo).then((res) => {
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
        //调后端删除用户的接口
        this.$ajax.delete(`/role/delete/${id}`).then((res) => {
          if (res.data.flag) {
            this.$message.success(res.data.message);
          }
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
      this.checkPermissions = [];
      this.submitPermissions = [];
      this.checkMenus = [];
      this.$refs.tree.setCheckedKeys([]);
      this.$refs.form.resetFields();
      this.findPage();
    },
    /**
     * 点击确定
     */
    clickOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return this.$message.error("表单校验未通过，请检查后提交！");
        this.form.menus = this.checkMenus;
        this.form.permissions = this.submitPermissions;
        if (this.form.id === undefined || this.form.id === null) {
          this.$ajax.post("/role/insert", this.form).then((res) => {
            this.$message.success(res.data.message);
            this.open = false;
            this.findPage();
          });
        } else {
          this.$ajax.put("/role/update", this.form).then((res) => {
            this.$message.success(res.data.message);
            this.open = false;
            this.findPage();
          });
        }
      });
      this.submitPermissions = [];
    },
    /**
     * 点击取消
     */
    clickCancel() {
      this.checkPermissions = [];
      this.submitPermissions = [];
      this.checkMenus = [];
      this.$refs.tree.setCheckedKeys([]);
      this.form = {};
      this.open = false;
      this.findPage();
    },
    /**
     * 改变角色数据的状态
     */
    updateStatus(row) {
      this.$ajax.put("/role/update", row).then((res) => {
        this.$message.success("状态更新成功！");
      }).catch(() => {
      });
    },
    /**
     * 菜单树形控件 节点值被选中
     */
    treeChange() {
      this.checkMenus = [];
      const checks = this.$refs.tree.getCheckedNodes(false, true);
      checks.forEach(item => {
        if (!this.$refs.tree.getNode(item.id).parent.checked) {
          this.$refs.tree.setChecked(this.$refs.tree.getNode(item.id).parent, true, false);
        }
        this.checkMenus.push(item);
      });
    },
    /**
     * 勾选权限的事件
     */
    permissionChange(item, checked) {
      if (checked) {
        this.submitPermissions.push(item);
      } else {
        this.submitPermissions = [];
        this.checkPermissions.forEach(i => {
          this.permissions.forEach(p => {
            if (p.label === i) {
              this.submitPermissions.push(p);
            }
          });
        });
      }
    }
  },

  created() {
    this.findPage();
    this.findMenusAndPermissions();
  }
};
</script>

<style scoped>
.el-col {
  margin-right: 20px;
}

.el-checkbox {
  margin-right: 10px;
  margin-bottom: 10px;
}

.dialog {
  text-align: left;
}
</style>

