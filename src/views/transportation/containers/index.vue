<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="货柜编号" prop="containerCode">
        <el-input
          v-model="queryParams.containerCode"
          placeholder="请输入货柜编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货柜状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择货柜状态" clearable>
          <el-option
            v-for="dict in erp_containers_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasPermi="['transportation:containers:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['transportation:containers:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['transportation:containers:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['transportation:containers:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="containersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="货柜ID" align="center" prop="containerId" width="150"/>
      <el-table-column label="货柜编号" align="center" prop="containerCode" />
      <el-table-column label="预计发货时间" align="center" prop="shippingScheduleTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shippingScheduleTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际发货时间" align="center" prop="actualShippingTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualShippingTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计到港时间" align="center" prop="etaPortTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.etaPortTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际到港时间" align="center" prop="actualArrivalPortTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualArrivalPortTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="报关时间" align="center" prop="customsDeclarationTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.customsDeclarationTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关检时间" align="center" prop="customsInspectionTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.customsInspectionTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="清关完成时间" align="center" prop="customsClearanceTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.customsClearanceTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计入仓时间" align="center" prop="estimatedWarehouseTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.estimatedWarehouseTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际入仓时间" align="center" prop="actualWarehouseTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualWarehouseTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货柜状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="erp_containers_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户编号" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['transportation:containers:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['transportation:containers:remove']">删除</el-button>
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

    <!-- 添加或修改货柜对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="containersRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="货柜编号" prop="containerCode">
          <el-input v-model="form.containerCode" placeholder="请输入货柜编号" />
        </el-form-item>
        <el-form-item label="预计发货时间" prop="shippingScheduleTime">
          <el-date-picker clearable
            v-model="form.shippingScheduleTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择预计发货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际发货时间" prop="actualShippingTime">
          <el-date-picker clearable
            v-model="form.actualShippingTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择实际发货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预计到港时间" prop="etaPortTime">
          <el-date-picker clearable
            v-model="form.etaPortTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择预计到港时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际到港时间" prop="actualArrivalPortTime">
          <el-date-picker clearable
            v-model="form.actualArrivalPortTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择实际到港时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="报关时间" prop="customsDeclarationTime">
          <el-date-picker clearable
            v-model="form.customsDeclarationTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择报关时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="关检时间" prop="customsInspectionTime">
          <el-date-picker clearable
            v-model="form.customsInspectionTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择关检时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="清关完成时间" prop="customsClearanceTime">
          <el-date-picker clearable
            v-model="form.customsClearanceTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择清关完成时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预计入仓时间" prop="estimatedWarehouseTime">
          <el-date-picker clearable
            v-model="form.estimatedWarehouseTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择预计入仓时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际入仓时间" prop="actualWarehouseTime">
          <el-date-picker clearable
            v-model="form.actualWarehouseTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择实际入仓时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="货柜状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in erp_containers_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="Containers">
import { listContainers, getContainers, delContainers, addContainers, updateContainers } from "@/api/transportation/containers";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_containers_status } = proxy.useDict('erp_containers_status');

const containersList = ref([]);
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
    containerCode: null,
    status: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询货柜列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listContainers(queryParams.value).then(response => {
    containersList.value = response.rows;
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
    containerId: null,
    containerCode: null,
    shippingScheduleTime: null,
    actualShippingTime: null,
    etaPortTime: null,
    actualArrivalPortTime: null,
    customsDeclarationTime: null,
    customsInspectionTime: null,
    customsClearanceTime: null,
    estimatedWarehouseTime: null,
    actualWarehouseTime: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("containersRef");
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
  ids.value = selection.map(item => item.containerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加货柜";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _containerId = row.containerId || ids.value
  getContainers(_containerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改货柜";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["containersRef"].validate(valid => {
    if (valid) {
      if (form.value.containerId != null) {
        updateContainers(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addContainers(form.value).then(response => {
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
  const _containerIds = row.containerId || ids.value;
  proxy.$modal.confirm('是否确认删除货柜编号为"' + _containerIds + '"的数据项？').then(function() {
    return delContainers(_containerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('transportation/containers/export', {
    ...queryParams.value
  }, `containers_${new Date().getTime()}.xlsx`)
}

getList();
</script>
