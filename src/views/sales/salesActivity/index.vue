<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动状态" prop="activityStatus">
        <el-select v-model="queryParams.activityStatus" placeholder="请选择活动状态" clearable>
          <el-option
            v-for="dict in sys_tenant_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input
          v-model="queryParams.tenantId"
          placeholder="请输入租户ID"
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
          v-hasPermi="['sales:salesActivity:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesActivity:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesActivity:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesActivity:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="salesActivityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动ID" align="center" prop="activityId" />
      <el-table-column label="活动名称" align="center" prop="activityName" />
      <el-table-column label="活动状态" align="center" prop="activityStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.activityStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="活动权重" align="center" prop="activityWeight" />
      <el-table-column label="基础佣金" align="center" prop="salesmanHasCommission">
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.salesmanHasCommission"/>
        </template>
      </el-table-column>
      <el-table-column label="佣金点数" align="center" prop="salesmanAddCommissionRate" />
      <el-table-column label="基础折扣" align="center" prop="customerHasDiscount">
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.customerHasDiscount"/>
        </template>
      </el-table-column>
      <el-table-column label="折上折(大于0)" align="center" prop="customerAddDiscountRate" />
      <el-table-column label="产品活动" align="center" prop="closePromotion">
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.closePromotion"/>
        </template>
      </el-table-column>
      <el-table-column label="活动开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesActivity:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesActivity:remove']">删除</el-button>
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

    <!-- 添加或修改销售活动 对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesActivityRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动状态" prop="activityStatus">
          <el-radio-group v-model="form.activityStatus">
            <el-radio
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动权重" prop="activityWeight">
          <el-input v-model="form.activityWeight" placeholder="请输入活动权重" />
        </el-form-item>
        <el-form-item label="基础佣金" prop="salesmanHasCommission">
          <el-input v-model="form.salesmanHasCommission" placeholder="请输入基础佣金" />
        </el-form-item>
        <el-form-item label="佣金点数" prop="salesmanAddCommissionRate">
          <el-input v-model="form.salesmanAddCommissionRate" placeholder="请输入佣金点数" />
        </el-form-item>
        <el-form-item label="基础折扣" prop="customerHasDiscount">
          <el-input v-model="form.customerHasDiscount" placeholder="请输入基础折扣" />
        </el-form-item>
        <el-form-item label="折上折(大于0)" prop="customerAddDiscountRate">
          <el-input v-model="form.customerAddDiscountRate" placeholder="请输入折上折(大于0)" />
        </el-form-item>
        <el-form-item label="产品活动" prop="closePromotion">
          <el-input v-model="form.closePromotion" placeholder="请输入产品活动" />
        </el-form-item>
        <el-form-item label="活动开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择活动开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择活动结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="删除状态" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除状态" />
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

<script setup name="SalesActivity">
import { listSalesActivity, getSalesActivity, delSalesActivity, addSalesActivity, updateSalesActivity } from "@/api/sales/salesActivity";

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

const salesActivityList = ref([]);
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
    activityName: null,
    activityStatus: null,
    tenantId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询销售活动 列表 */
function getList() {
  loading.value = true;
  listSalesActivity(queryParams.value).then(response => {
    salesActivityList.value = response.rows;
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
    activityId: null,
    activityName: null,
    activityStatus: null,
    activityWeight: null,
    salesmanHasCommission: null,
    salesmanAddCommissionRate: null,
    customerHasDiscount: null,
    customerAddDiscountRate: null,
    closePromotion: null,
    startTime: null,
    endTime: null,
    tenantId: null,
    delFlag: null
  };
  proxy.resetForm("salesActivityRef");
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
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加销售活动 ";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _activityId = row.activityId || ids.value
  getSalesActivity(_activityId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改销售活动 ";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesActivityRef"].validate(valid => {
    if (valid) {
      if (form.value.activityId != null) {
        updateSalesActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesActivity(form.value).then(response => {
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
  const _activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除销售活动 编号为"' + _activityIds + '"的数据项？').then(function() {
    return delSalesActivity(_activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesActivity/export', {
    ...queryParams.value
  }, `salesActivity_${new Date().getTime()}.xlsx`)
}

getList();
</script>
