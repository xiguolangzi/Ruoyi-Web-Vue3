<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="配置编码" prop="configCode">
        <el-input v-model="queryParams.configCode" placeholder="请输入配置编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['config:tenantConfig:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['config:tenantConfig:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['config:tenantConfig:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['config:tenantConfig:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tenantConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="配置ID" align="center" prop="configId" />
      <el-table-column label="配置编码" align="center" prop="configCode" />
      <el-table-column label="配置的值" align="center" prop="configValue">
        <template #default="scope">
          <el-switch v-model="scope.row.configValue" :active-value="StatusEnum.ENABLE"
            :inactive-value="StatusEnum.DISABLE" inline-prompt active-text="启用" inactive-text="禁用"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            @change="handleChangeStatus(scope.row)" v-if="scope.row.showType == ShowTypeEnum.SWITCH" />
          <el-input v-model="scope.row.configValue" @change="handleChangeStatus(scope.row)"
            v-if="scope.row.showType == ShowTypeEnum.INPUT" />
        </template>
      </el-table-column>
      <el-table-column label="配置名称" align="center" prop="configName" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        v-if="userStore.userType == '00'">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['config:tenantConfig:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['config:tenantConfig:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改租户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tenantConfigRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配置编码:" prop="configCode">
          <el-input v-model="form.configCode" placeholder="请输入配置编码" />
        </el-form-item>
        <el-form-item label="配置的值:" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入配置的值" />
        </el-form-item>
        <el-form-item label="默认值:" prop="configValue">
          <el-input v-model="form.defaultValue" placeholder="请输入配置的值" />
        </el-form-item>
        <el-form-item label="配置名称:" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="展示类型:" prop="showType">
          <el-radio-group v-model="form.showType">
            <el-radio v-for="dict in ShowTypeDict" :key="dict.value" :value="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

<script setup name="TenantConfig">
import { listTenantConfig, getTenantConfig, delTenantConfig, addTenantConfig, updateTenantConfig, updateConfigValue } from "@/api/config/tenantConfig";
import useUserStore from "@/store/modules/user";
import {ShowTypeDict, ShowTypeEnum, StatusEnum } from "./tenantConfigConstants.js";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const tenantConfigList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const handleChangeStatus = (row) => {
  updateConfigValue(row).then((res) => {
    proxy.$modal.msgSuccess("修改配置 ' '" + row.configName + "' 成功");
    getList();
  }).catch(getList());
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configCode: null,
  },
  rules: {
    configCode: [
      { required: true, message: "配置编码不能为空", trigger: "blur" }
    ],
    configValue: [
      { required: true, message: "配置的值不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询租户配置列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listTenantConfig(queryParams.value).then(response => {
    tenantConfigList.value = response.rows;
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
    configId: null,
    configCode: null,
    configValue: null,
    defaultValue: null,
    configName: null,
    showType: null,
    tenantId: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null
  };
  proxy.resetForm("tenantConfigRef");
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
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加租户配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _configId = row.configId || ids.value
  getTenantConfig(_configId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改租户配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tenantConfigRef"].validate(valid => {
    if (valid) {
      if (form.value.configId != null) {
        updateTenantConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTenantConfig(form.value).then(response => {
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
  const _configIds = row.configId || ids.value;
  proxy.$modal.confirm('是否确认删除租户配置编号为"' + _configIds + '"的数据项？').then(function() {
    return delTenantConfig(_configIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('config/tenantConfig/export', {
    ...queryParams.value
  }, `tenantConfig_${new Date().getTime()}.xlsx`)
}

getList();
</script>
