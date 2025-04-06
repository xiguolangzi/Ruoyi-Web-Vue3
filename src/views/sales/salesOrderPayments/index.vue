<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单初始单号" prop="orderId">
        <el-input
          v-model="queryParams.orderInitNo"
          placeholder="请输入订单初始单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付方式" prop="payMethod">
        <el-select v-model="queryParams.payMethod" placeholder="请选择支付方式" clearable>
          <el-option
            v-for="dict in sales_order_pay_method"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="第三方交易号" prop="transactionNo">
        <el-input
          v-model="queryParams.transactionNo"
          placeholder="请输入第三方交易号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['sales:salesOrderPayments:add']" v-if="false"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesOrderPayments:edit']" v-if="false"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesOrderPayments:remove']" v-if="false"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesOrderPayments:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="salesOrderPaymentsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="支付编号" align="center" prop="paymentNo" />
      <el-table-column label="初始订单编号" align="center" prop="orderInitNo" />
      <el-table-column label="销售订单编号" align="center" prop="orderNo" />
      <el-table-column label="支付方式" align="center" prop="payMethod">
        <template #default="scope">
          <dict-tag :options="sales_order_pay_method" :value="scope.row.payMethod"/>
        </template>
      </el-table-column>
      <el-table-column label="支付金额" align="center" prop="payAmount" >
        <template #default="scope">
          <span> {{formatTwo(scope.row.payAmount) }} € </span> 
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center" prop="payTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.payTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="第三方支付交易号" align="center" prop="transactionNo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="false">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesOrderPayments:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesOrderPayments:remove']">删除</el-button>
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

    <!-- 添加或修改支付记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesOrderPaymentsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="销售订单ID" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入销售订单ID" />
        </el-form-item>
        <el-form-item label="支付方式" prop="payMethod">
          <el-select v-model="form.payMethod" placeholder="请选择支付方式" clearable>
            <el-option
              v-for="dict in sales_order_pay_method"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="payAmount">
          <el-input-number v-model="form.payAmount" placeholder="请输入支付金额" />
        </el-form-item>
        <el-form-item label="第三方支付交易号" prop="transactionNo">
          <el-input v-model="form.transactionNo" placeholder="请输入第三方支付交易号" />
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

<script setup name="SalesOrderPayments">
import { listSalesOrderPayments, getSalesOrderPayments, delSalesOrderPayments, addSalesOrderPayments, updateSalesOrderPayments } from "@/api/sales/salesOrderPayments";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sales_order_pay_method } = proxy.useDict("sales_order_pay_method");

const salesOrderPaymentsList = ref([]);
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
    orderId: null,
    payMethod: null,
    payAmount: null,
    transactionNo: null,
    tenantId: null
  },
  rules: {
    orderId: [
      { required: true, message: "销售订单ID不能为空", trigger: "blur" }
    ],
    payMethod: [
      { required: true, message: "支付方式不能为空", trigger: "blur" }
    ],
    payAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询支付记录列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesOrderPayments(queryParams.value).then(response => {
    salesOrderPaymentsList.value = response.rows;
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
    paymentId: null,
    orderId: null,
    payMethod: null,
    payAmount: null,
    createBy: null,
    transactionNo: null,
    tenantId: null
  };
  proxy.resetForm("salesOrderPaymentsRef");
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
  ids.value = selection.map(item => item.paymentId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加支付记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _paymentId = row.paymentId || ids.value
  getSalesOrderPayments(_paymentId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改支付记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesOrderPaymentsRef"].validate(valid => {
    if (valid) {
      if (form.value.paymentId != null) {
        updateSalesOrderPayments(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesOrderPayments(form.value).then(response => {
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
  const _paymentIds = row.paymentId || ids.value;
  proxy.$modal.confirm('是否确认删除支付记录编号为"' + _paymentIds + '"的数据项？').then(function() {
    return delSalesOrderPayments(_paymentIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesOrderPayments/export', {
    ...queryParams.value
  }, `salesOrderPayments_${new Date().getTime()}.xlsx`)
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
