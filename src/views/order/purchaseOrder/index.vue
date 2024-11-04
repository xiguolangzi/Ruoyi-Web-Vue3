<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="供应商ID" prop="supplierId">
        <el-input v-model="queryParams.supplierId" placeholder="请输入供应商ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="采购员ID" prop="buyerId">
        <el-input v-model="queryParams.buyerId" placeholder="请输入采购员ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option v-for="dict in erp_purchase_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['order:purchaseOrder:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['order:purchaseOrder:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['order:purchaseOrder:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['order:purchaseOrder:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" align="center" prop="orderNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="供应商ID" align="center" prop="supplierId" />
      <el-table-column label="采购员ID" align="center" prop="buyerId" />
      <el-table-column label="订单金额" align="center" prop="totalAmount" />
      <el-table-column label="折扣额" align="center" prop="discountAmount" />
      <el-table-column label="税额" align="center" prop="taxAmount" />
      <el-table-column label="应付金额" align="center" prop="finalAmount" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="erp_purchase_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="下单日期" align="center" prop="orderDate" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="center" prop="remark" />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['order:purchaseOrder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['order:purchaseOrder:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改采购订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="purchaseOrderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="供应商ID" prop="supplierId">
          <el-input v-model="form.supplierId" placeholder="请输入供应商ID" />
        </el-form-item>
        <el-form-item label="采购员ID" prop="buyerId">
          <el-input v-model="form.buyerId" placeholder="请输入采购员ID" />
        </el-form-item>
        <el-form-item label="订单金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入订单金额" />
        </el-form-item>
        <el-form-item label="折扣额" prop="discountAmount">
          <el-input v-model="form.discountAmount" placeholder="请输入折扣额" />
        </el-form-item>
        <el-form-item label="税额" prop="taxAmount">
          <el-input v-model="form.taxAmount" placeholder="请输入税额" />
        </el-form-item>
        <el-form-item label="应付金额" prop="finalAmount">
          <el-input v-model="form.finalAmount" placeholder="请输入应付金额" />
        </el-form-item>
        <el-form-item label="下单日期" prop="orderDate">
          <el-date-picker clearable v-model="form.orderDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择下单日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-radio-group v-model="form.orderStatus">
            <el-radio v-for="dict in erp_purchase_status" :key="dict.value"
              :label="dict.value">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息" />
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

<script setup name="PurchaseOrder">
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder } from "@/api/order/purchaseOrder";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";

// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { erp_purchase_status } = proxy.useDict('erp_purchase_status');

const purchaseOrderList = ref([]);
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
    orderNo: null,
    supplierId: null,
    buyerId: null,
    orderStatus: null,
    tenantId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购订单列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listPurchaseOrder(queryParams.value).then(response => {
    purchaseOrderList.value = response.rows;
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
    orderId: null,
    orderNo: null,
    supplierId: null,
    buyerId: null,
    totalAmount: null,
    discountAmount: null,
    taxAmount: null,
    finalAmount: null,
    orderDate: null,
    orderStatus: null,
    remark: null,
  };
  proxy.resetForm("purchaseOrderRef");
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
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  // reset();
  // open.value = true;
  // title.value = "添加采购订单";
  router.push({ path: "/order/purchaseOrder/edit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _orderId = row.orderId || ids.value
  getPurchaseOrder(_orderId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购订单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseOrderRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId != null) {
        updatePurchaseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseOrder(form.value).then(response => {
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
  const _orderIds = row.orderId || ids.value;
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + _orderIds + '"的数据项？').then(function() {
    return delPurchaseOrder(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/purchaseOrder/export', {
    ...queryParams.value
  }, `purchaseOrder_${new Date().getTime()}.xlsx`)
}

getList();
</script>
