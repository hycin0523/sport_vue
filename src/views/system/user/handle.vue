<template>
  <el-card>
    <div slot="header" class="clearfix">
      <span>{{ title }}</span>
      <el-button style="float: right;" size="small" @click="$emit('cancel')">返回</el-button>
    </div>
    <div>
      <el-form :model="form" ref="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="11">
            <el-form-item label="登录名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入登录名" style="width: 80%" />
            </el-form-item>
          </el-col>
          <el-col :span="11" v-if="this.form.id == null">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入登录密码" style="width: 80%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="form.sex" placeholder="请选择性别" style="width: 80%">
                <el-option :value="0" label="男" />
                <el-option :value="1" label="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" style="width: 80%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="电话号码" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="请输入电话号码" style="width: 80%" />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入电子邮箱" style="width: 80%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="用户角色" prop="roles">
              <el-select v-model="rolesId" placeholder="请选择角色信息" style="width: 80%" multiple>
                <el-option
                  v-for="(item, index) in roleList"
                  :key="index"
                  :label="item.label"
                  :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="是否启用" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="居住地址" prop="address">
              <el-input
                v-model="form.address"
                type="textarea"
                maxlength="100"
                show-word-limit
                :autosize="{ minRows: 3, maxRows: 5 }"
                placeholder="请输入居住地址"
                style="width: 80%" />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="用户头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                :action="action"
                :headers="headers"
                :show-file-list="false"
                :on-success="handleSuccess"
                :before-upload="beforeUpload">
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="$emit('cancel')">取 消</el-button>
        <el-button type="primary" @click="clickOk">确 定</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>

export default {
  data() {
    return {
      //表单校验
      rules: {
        userName: [
          { required: true, message: "请输入登录名", trigger: "blur" },
          { min: 2, max: 20, message: "登录名长度在 2 到 20 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" }
          // { min: 6, max:32, message: "登录密码在 6 到 32 个字符", trigger: "blur" }
        ],
        sex: [
          { required: true, message: "请选择性别", trigger: "blur" }
        ],
        phoneNumber: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { message: "手机号码输入不正确", trigger: "blur", pattern: /^1(3[0-9]|5[0-3,5-9]|7[1-3,5-8]|8[0-9])\d{8}$/ }
        ],
        avatar: [
          {
            required: true,
            validator: (rules, value, callback) => {
              if (this.form.avatar === null || this.form.avatar === "" || this.form.avatar === undefined) {
                callback(new Error("请上传用户头像"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ]
      },
      imageUrl: null,
      action: "/tool/upload",
      headers: {
        Authorization: sessionStorage.getItem("token")
      },
      roleList: [],
      rolesId: []
    };
  },

  /** 接收父组件传递的值 */
  props: ["title", "form"],

  watch: {
    "form": {
      handler(val, old) {
        if (val.name) {
          this.form.userName = val.name;
        }
        if (val.avatar) {
          this.imageUrl = val.avatar.startsWith("https") ? val.avatar : this.$qiniu + val.avatar;
        }
        if (val.roles && val.roles.length > 0) {
          this.rolesId = [];
          val.roles.forEach(item => {
            this.rolesId.push(item.id);
          });
        }
      }
    }
  },

  methods: {
    /**
     * 上传成功
     */
    handleSuccess(res, file) {
      this.imageUrl = this.$qiniu + res.data;
      this.form.avatar = res.data;
    },
    /**
     * 上传之前
     */
    beforeUpload(file) {
      //限制文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        this.$message.warning("文件大小不能超过10MB");
        return false;
      }
      //限制图片格式
      let index = file.name.lastIndexOf(".");
      let suffix = file.name.substring(index + 1);
      if (suffix !== "jpg" && suffix !== "png" && suffix !== "jpeg") {
        this.$message.warning("请上传jpg、png、jpeg格式的图片！");
        return false;
      }
    },
    /**
     * 点击确定
     */
    clickOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return this.$message.error("表单校验未通过，请检查后提交！");
        let arr = [];
        this.rolesId.forEach(item => {
          arr.push({ id: item });
        });
        this.form.roles = arr;
        if (this.form.id === undefined || this.form.id === null) {
          this.$ajax.post("/user/insert", this.form).then((res) => {
            if (res.data.flag) {
              this.$message.success(res.data.message);
            }
            return this.$emit("cancel");
          });
        } else {
          this.$ajax.put("/user/update", this.form).then((res) => {
            if (res.data.flag) {
              this.$message.success(res.data.message);
            }
            return this.$emit("cancel");
          });
        }
      });
    }
  },

  created() {
    this.$ajax.get("/role/findAll").then((res) => {
      this.roleList = res.data.data;
    });
  },
};
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 130px;
  height: 130px;
  line-height: 130px;
  text-align: center;
}

.avatar {
  width: 130px;
  height: 130px;
  display: block;
}

.clearfix {
  text-align: left;
}
</style>

