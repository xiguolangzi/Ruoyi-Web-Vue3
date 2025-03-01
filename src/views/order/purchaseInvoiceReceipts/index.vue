<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="发票号" prop="invoiceNo">
        <el-input
          v-model="queryParams.invoiceNo"
          placeholder="请输入发票号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="采购入库单号" prop="receiptsNo">
        <el-input
          v-model="queryParams.receiptsNo"
          placeholder="请输入采购入库单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in erp_purchase_invoice_receipts_status"
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
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:purchaseInvoiceReceipts:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="purchaseInvoiceReceiptsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="发票号" align="left"  prop="invoiceNo" />
      <el-table-column label="采购入库单号" align="left"  prop="receiptsNo" />
      <el-table-column label="实际入库金额" align="center" prop="accountsPayable" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.accountsPayable) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="erp_purchase_invoice_receipts_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="false">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:purchaseInvoiceReceipts:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:purchaseInvoiceReceipts:remove']">删除</el-button>
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
  </div>
</template>

<script setup name="PurchaseInvoiceReceipts">
import { listPurchaseInvoiceReceipts, getPurchaseInvoiceReceipts, delPurchaseInvoiceReceipts, addPurchaseInvoiceReceipts, updatePurchaseInvoiceReceipts } from "@/api/order/purchaseInvoiceReceipts";

const { proxy } = getCurrentInstance();
const { erp_purchase_invoice_receipts_status } = proxy.useDict('erp_purchase_invoice_receipts_status');

const purchaseInvoiceReceiptsList = ref([]);
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
    pageSize: 20,
    invoiceNo: null,
    receiptsNo: null,
    status: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购发票关联采购入库单列表 */
function getList() {
  loading.value = true;
  listPurchaseInvoiceReceipts(queryParams.value).then(response => {
    purchaseInvoiceReceiptsList.value = response.rows;
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
    invoiceId: null,
    receiptsId: null,
    accountsPayable: null,
    status: null,
    tenantId: null
  };
  proxy.resetForm("purchaseInvoiceReceiptsRef");
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
  ids.value = selection.map(item => item.invoiceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加采购发票关联采购入库单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _invoiceId = row.invoiceId || ids.value
  getPurchaseInvoiceReceipts(_invoiceId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购发票关联采购入库单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseInvoiceReceiptsRef"].validate(valid => {
    if (valid) {
      if (form.value.invoiceId != null) {
        updatePurchaseInvoiceReceipts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseInvoiceReceipts(form.value).then(response => {
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
  const _invoiceIds = row.invoiceId || ids.value;
  proxy.$modal.confirm('是否确认删除采购发票关联采购入库单编号为"' + _invoiceIds + '"的数据项？').then(function() {
    return delPurchaseInvoiceReceipts(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/purchaseInvoiceReceipts/export', {
    ...queryParams.value
  }, `purchaseInvoiceReceipts_${new Date().getTime()}.xlsx`)
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
