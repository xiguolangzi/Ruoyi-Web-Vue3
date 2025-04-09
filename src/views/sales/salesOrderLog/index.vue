<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单初始编号" prop="orderInitNo">
        <el-input v-model="queryParams.orderInitNo" placeholder="请输入订单初始编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="caja名称" prop="cajaName">
        <el-input v-model="queryParams.cajaName" placeholder="请输入caja名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="收银员名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入收银员名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作类型" prop="operationType">
        <el-select v-model="queryParams.operationType" placeholder="请选择操作类型" clearable>
          <el-option v-for="dict in sales_operation_type" :key="dict.value" :label="dict.label"
            :value="Number(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['sales:salesOrderLog:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['sales:salesOrderLog:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="salesOrderLogList" size="small"
      :preserve-expanded-content="true" :row-class-name="setRowClassName">
      <el-table-column v-if="notHasOldDetailData" type="expand" width="50">
        <template #default="props">
          <div v-if="props.row.oldPrice || props.row.oldQuantity || props.row.oldDiscountRate">
            <el-descriptions direction="vertical" :column="5" size="small" border
              style="width: 500px;margin-left: 200px;">
              <el-descriptions-item label="修改前 - 单价" align="center">{{ formatTwo(props.row.oldPrice) + ' €'
                }}</el-descriptions-item>
              <el-descriptions-item label="修改前 - 数量" align="center">{{ props.row.oldQuantity }}</el-descriptions-item>
              <el-descriptions-item label="修改前 - 金额" align="center">{{ formatTwo(props.row.oldAmount) + ' €'
                }}</el-descriptions-item>
              <el-descriptions-item label="修改前 - 折扣率" align="center">{{ props.row.oldDiscountRate + ' %'
                }}</el-descriptions-item>
              <el-descriptions-item label="修改前 - 应收金额" align="center">{{ formatTwo(props.row.oldTotalNetAmount) + ' €'
                }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单初始编号" align="center" prop="orderInitNo" min-width="120" show-overflow-tooltip />
      <el-table-column label="caja名称" align="center" prop="cajaName" show-overflow-tooltip />
      <el-table-column label="收银员名称" align="center" prop="userName" show-overflow-tooltip />

      <el-table-column label="操作类型" align="center" prop="operationType" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sales_operation_type" :value="scope.row.operationType" />
        </template>
      </el-table-column>
      <el-table-column label="skuCode" align="center" prop="skuCode" min-width="120" show-overflow-tooltip />
      <el-table-column label="sku名称" align="center" prop="skuName" min-width="120" show-overflow-tooltip />
      <el-table-column label="单价" align="center" prop="price" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTwo(scope.row.price) + ' €'}} </span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="quantity" show-overflow-tooltip />
      <el-table-column label="金额" align="center" prop="amount" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTwo(scope.row.amount) + ' €'}} </span>
        </template>
      </el-table-column>
      <el-table-column label="折扣率" align="center" prop="discountRate" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.discountRate + ' %'}} </span>
        </template>
      </el-table-column>
      <el-table-column label="应收金额" align="center" prop="totalNetAmount" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalNetAmount) + ' €'}} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作时间" align="center" prop="operationTime" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.operationTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['sales:salesOrderLog:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script setup name="SalesOrderLog">
import { listSalesOrderLog, getSalesOrderLog, delSalesOrderLog, addSalesOrderLog, updateSalesOrderLog } from "@/api/sales/salesOrderLog";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const {sales_operation_type} = proxy.useDict("sales_operation_type")

const salesOrderLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderInitNo: null,
    cajaId: null,
    cajaName: null,
    userId: null,
    userName: null,
    operationType: null,
  }
});

const { queryParams } = toRefs(data);

// 添加计算属性判断是否有套餐商品
const notHasOldDetailData = computed(() => {
  return salesOrderLogList.value.some(item => {
    console.log("************",item)
    if (!item.oldPrice && !item.oldQuantity && !item.oldDiscountRate){
      return false;
    } else {
      return true;
    }
  })
})

const setRowClassName = ({ row }) => {
  // 如果没有原始数据，添加一个类名隐藏展开按钮
  if (!row.oldPrice && !row.oldQuantity && !row.oldDiscountRate){
    return 'no-expand-row';
  } else {
    return '';
  }
};

/** 查询订单操作日志列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesOrderLog(queryParams.value).then(response => {
    salesOrderLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
  ids.value = selection.map(item => item.logId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _logIds = row.logId || ids.value;
  proxy.$modal.confirm('是否确认删除订单操作日志编号为"' + _logIds + '"的数据项？').then(function() {
    return delSalesOrderLog(_logIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesOrderLog/export', {
    ...queryParams.value
  }, `salesOrderLog_${new Date().getTime()}.xlsx`)
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

:deep(.el-table__body tr.no-expand-row td.el-table__expand-column) {
  visibility: collapse;
}
</style>
