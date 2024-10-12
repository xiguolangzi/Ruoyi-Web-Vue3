<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="税号" prop="taxNumber">
        <el-input
          v-model="queryParams.taxNumber"
          placeholder="请输入税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="租户名称" prop="tenantName">
        <el-input
          v-model="queryParams.tenantName"
          placeholder="请输入租户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="租户类型" prop="tenantType">
        <el-select v-model="queryParams.tenantType" placeholder="请选择租户类型" clearable style="width: 200px">
          <el-option
            v-for="dict in sys_tenant_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="帐号状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择帐号状态" clearable style="width: 200px">
          <el-option
            v-for="dict in sys_tenant_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入邮箱"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:tenant:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:tenant:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:tenant:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:tenant:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="OfficeBuilding"
          :disabled="single"
          @click="handleAddTenantDept"
          v-hasPermi="['system:tenant:add:dept']"
        >初始化租户部门</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="同时管理员、清空管理员角色" effect="dark" placement="bottom">
          <el-button
            type="primary"
            plain
            icon="Star"
            :disabled="single"
            @click="handleAddTenantAdmin"
            v-hasPermi="['system:tenant:add:admin']"
          >初始化租户管理员</el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="同时初始化 租户部门、租户管理员" effect="dark" placement="bottom">
          <el-button
            type="warning"
            plain
            icon="Pointer"
            :disabled="single"
            @click="handleExport"
            v-hasPermi="['system:tenant:export']"
          >一键初始化</el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Share"
          :disabled="single"
          @click="handleExport"
          v-hasPermi="['system:tenant:export']"
        >分配套餐</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Finished"
          :disabled="single"
          @click="handleExport"
          v-hasPermi="['system:tenant:export']"
        >开通数据</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tenantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="租户编码" align="center" prop="tenantId" />
      <el-table-column label="税号" align="center" prop="taxNumber" />
      <el-table-column label="租户名称" align="center" prop="tenantName" />
      <el-table-column label="租户类型" align="center" prop="tenantType">
        <template #default="scope">
          <dict-tag :options="sys_tenant_type" :value="scope.row.tenantType"/>
        </template>
      </el-table-column>
      <el-table-column label="帐号状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" prop="phoneNumber" />
      <el-table-column label="邮编" align="center" prop="postalCode" />
      <el-table-column label="地址" align="center" prop="address" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenant:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenant:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改租户信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tenantRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="税号" prop="taxNumber">
          <el-input v-model="form.taxNumber" placeholder="请输入税号" />
        </el-form-item>
        <el-form-item label="租户名称" prop="tenantName">
          <el-input v-model="form.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户类型" prop="tenantType">
          <el-select v-model="form.tenantType" placeholder="请选择租户类型">
            <el-option
              v-for="dict in sys_tenant_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="帐号状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择帐号状态">
            <el-option
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮编" prop="postalCode">
          <el-input v-model="form.postalCode" placeholder="请输入邮编" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tenant">
import { listTenant, getTenant, delTenant, addTenant, updateTenant, addTenantDept, addTenantAdmin } from "@/api/system/tenant";
import useUserStore from "@/store/modules/user";
import { ElMessage, ElMessageBox } from 'element-plus'

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status, sys_tenant_type } = proxy.useDict('sys_tenant_status', 'sys_tenant_type');

const tenantList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taxNumber: null,
    tenantName: null,
    tenantType: null,
    status: null,
    phoneNumber: null,
    email: null,
  },
  rules: {
    taxNumber: [
      { required: true, message: "税号不能为空", trigger: "blur" }
    ],
    tenantName: [
      { required: true, message: "租户名称不能为空", trigger: "blur" }
    ],
    tenantType: [
      { required: true, message: "租户类型不能为空", trigger: "change" }
    ],
    phoneNumber: [
      { required: true, message: "手机号不能为空", trigger: "blur" }
    ],
    postalCode: [
      { required: true, message: "邮编不能为空", trigger: "blur" }
    ],
    address: [
      { required: true, message: "地址不能为空", trigger: "blur" }
    ],
    email: [
      { required: true, message: "邮箱不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询租户信息列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listTenant(queryParams.value).then(response => {
    tenantList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    tenantId: null,
    taxNumber: null,
    tenantName: null,
    tenantType: null,
    status: null,
    phoneNumber: null,
    postalCode: null,
    address: null,
    email: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("tenantRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.tenantId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加租户信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _tenantId = row.tenantId || ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改租户信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tenantRef"].validate(valid => {
    if (valid) {
      if (form.value.tenantId != null) {
        updateTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _tenantIds = row.tenantId || ids.value;
  proxy.$modal.confirm('是否确认删除租户信息编号为"' + _tenantIds + '"的数据项？').then(function() {
    return delTenant(_tenantIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/tenant/export', {
    ...queryParams.value
  }, `tenant_${new Date().getTime()}.xlsx`)
}

/** 新增租户顶级部门 */
function handleAddTenantDept() {
  // 获取选中租户的信息
  reset();
  const _tenantId = ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    // 调用新增部门接口
    addTenantDept(form.value).then(response => {
      proxy.$modal.msgSuccess(response.msg);
    });
  });
  
}


/** 新增租户管理员用户 */
function handleAddTenantAdmin(){
  ElMessageBox.confirm(
    '注意：初始化租户管理员，将会删除 该租户名下"所有用户"的角色信息，确认初始化吗?',
    'Warning',
    {
      confirmButtonText: '确认初始化',
      cancelButtonText: '取消初始化',
      type: 'warning',
    }
  )
    .then(() => {
      // 获取选中租户的信息
      reset();
      const _tenantId = ids.value
      getTenant(_tenantId).then(response => {
        form.value = response.data;
        // 调用新增部门接口
        addTenantAdmin(form.value).then(response => {
          proxy.$modal.msgSuccess(response.msg);
        });
      });
      ElMessage({
        type: 'success',
        message: '初始化成功！',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消初始化！',
      })
    })
  
}

/** 租户分配套餐 */


/** 一键处理住户初始化操作 */


/** 租户开通数据操作 */

getList();
</script>
