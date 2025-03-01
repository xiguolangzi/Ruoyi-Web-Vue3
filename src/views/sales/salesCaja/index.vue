<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="唯一标识" prop="macAddress">
        <el-input
          v-model="queryParams.macAddress"
          placeholder="请输入MAC地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收银机名称" prop="cajaName">
        <el-input
          v-model="queryParams.cajaName"
          placeholder="请输入收银机名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备状态" prop="cajaStatus">
        <el-select v-model="queryParams.cajaStatus" placeholder="请选择设备状态" clearable>
          <el-option v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
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
          v-hasPermi="['sales:salesCaja:add']"
        >新增设备</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesCaja:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesCaja:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesCaja:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="salesCajaList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="收银机名称" align="center" prop="cajaName" />
      <el-table-column label="设备唯一标识" align="center" prop="macAddress" min-width="150" show-overflow-tooltip/>
      <el-table-column label="注册人" align="center" prop="createBy" />
      <el-table-column label="设备状态" align="center" prop="cajaStatus" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.cajaStatus" :active-value="sys_tenant_status[0].value"
            :inactive-value="sys_tenant_status[1].value" inline-prompt active-text="启用" inactive-text="禁用"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            @change="handleChangeStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="createTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注描述" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesCaja:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesCaja:remove']">删除</el-button>
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

    <!-- 添加或修改caja注册对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesCajaRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="唯一标识" prop="macAddress">
          <el-input v-model="form.macAddress" placeholder="系统自动获取" disabled/>
        </el-form-item>
        <el-form-item label="收银机名称" prop="cajaName">
          <el-input v-model="form.cajaName" placeholder="请输入收银机名称" type="textarea" maxlength="30" show-word-limit :rows="1" />
        </el-form-item>
        <el-form-item label="设备状态" prop="cajaStatus">
          <el-radio-group v-model="form.cajaStatus">
            <el-radio v-for="dict in sys_tenant_status" :key="dict.value" :value="dict.value">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注描述" prop="remark" >
          <el-input v-model="form.remark" placeholder="请输入备注描述" type="textarea" maxlength="50" show-word-limit :rows="2"/>
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

<script setup name="SalesCaja">
import { listSalesCaja, getSalesCaja, delSalesCaja, addSalesCaja, updateSalesCaja, changeStatus } from "@/api/sales/salesCaja";
import useUserStore from "@/store/modules/user";
import { getFingerprint } from "@/utils/fingerprintJS";

// 租户ID字段过滤使用
const userStore = useUserStore();
const {deviceFingerprint} = getFingerprint();

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

const salesCajaList = ref([]);
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
    macAddress: null,
    cajaName: null,
    tenantId: null,
    cajaStatus: null
  },
  rules: {
    macAddress: [
      { required: true, message: "MAC地址不能为空", trigger: "blur" }
    ],
    cajaName: [
      { required: true, message: "收银机名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询caja注册列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesCaja(queryParams.value).then(response => {
    salesCajaList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 修改状态  */
function handleChangeStatus(row) {
  let text = row.cajaStatus === "0" ? "启用" : "禁用";
  proxy.$modal.confirm('确认要"' + text + '" 设备名称为："' + row.cajaName + '" 的设备吗?').then(function () {
    return changeStatus(row);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
    getList();
  }).catch(function () {
    row.cajaStatus = row.cajaStatus === "0" ? "1" : "0";
  });
};

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    cajaId: null,
    macAddress: null,
    cajaName: null,
    cajaStatus: '0',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null
  };
  proxy.resetForm("salesCajaRef");
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
  ids.value = selection.map(item => item.cajaId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value.macAddress = deviceFingerprint.value;  // 获取设备唯一标识
  open.value = true;
  title.value = "添加caja注册";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _cajaId = row.cajaId || ids.value
  getSalesCaja(_cajaId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改caja注册";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesCajaRef"].validate(valid => {
    if (valid) {
      if (form.value.cajaId != null) {
        updateSalesCaja(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesCaja(form.value).then(response => {
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
  const _cajaIds = row.cajaId || ids.value;
  proxy.$modal.confirm('是否确认删除caja注册编号为"' + _cajaIds + '"的数据项？').then(function() {
    return delSalesCaja(_cajaIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesCaja/export', {
    ...queryParams.value
  }, `salesCaja_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%; /* 确保父容器高度充满 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1; /* 表格区域充满剩余空间 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex-grow: 1; /* 表格充满剩余空间 */
}

.pagination {
  flex-shrink: 0; /* 分页栏固定在底部 */
  margin-top: auto; /* 将分页栏推到容器底部 */
}
</style>
