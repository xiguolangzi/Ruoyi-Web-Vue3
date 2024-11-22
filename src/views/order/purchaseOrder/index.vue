<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo" >
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable @keyup.enter="handleQuery" style="width: 150px;"/>
      </el-form-item>
      <el-form-item label="供应商：" prop="supplierId">
        <el-select
          v-model="queryParams.supplierId"
          filterable
          clearable
          placeholder="请选中供应商"
          style="width: 150px"
        >
          <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
          <el-option
          v-for="item in supplierList"
          :key="item.supplierId"
          :label="item.supplierName"
          :value="item.supplierId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="采购人员:" prop="buyerId">
        <el-select
          v-model="queryParams.buyerId"
          filterable
          clearable
          placeholder="请选中采购员"
          style="width: 150px"
        >
          <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
          <el-option
          v-for="item in buyerList"
          :key="item.userId"
          :label="item.userName"
          :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable style="width: 150px;">
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
          v-hasPermi="['order:purchaseOrder:edit']">编辑</el-button>
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
      <el-table-column label="订单编号" align="center" prop="orderNo" min-width="180" show-overflow-tooltip >
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.orderNo }}
        </span>
        </template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="supplierId" show-overflow-tooltip >
        <template v-slot="scope">
          {{ getSuppliersName(scope.row.supplierId)}}
        </template>
      </el-table-column>
      <el-table-column label="采购员" align="center" prop="buyerId" show-overflow-tooltip >
        <template v-slot="scope">
          <span> {{ getBuyerName(scope.row.buyerId) }} </span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="right" header-align="center" prop="totalPurchaseAmount" show-overflow-tooltip min-width="100" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalPurchaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣额" align="right" header-align="center" prop="totalDiscountAmount" show-overflow-tooltip min-width="100" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalDiscountAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="税额" align="right" header-align="center" prop="totalTaxAmount" show-overflow-tooltip min-width="100" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalTaxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="实际金额" align="right" header-align="center" prop="totalNetAmount" show-overflow-tooltip min-width="100" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalNetAmount) }} €</span>
        </template>
      </el-table-column>
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
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script setup name="PurchaseOrder">
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder } from "@/api/order/purchaseOrder";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";
import { listBuyer } from "@/api/system/user"
import { listSupplier } from "@/api/order/supplier"

// *****************************  供应商 数据获取 start *****************************
// 供应商 - 初始化列表
const supplierList = ref([])
/** 供应商 - 获取列表 */
const getSuppliers = async () => {
    listSupplier()
      .then(response => {
        supplierList.value = response.rows || []
      })
      .catch(error => {
        ElMessage.error("获取供应商列表时出错:",error)
      })
};
getSuppliers()
const getSuppliersName = (id) => {
  return supplierList.value.find(supplier => supplier.supplierId === id)?.supplierName || '--'
 }

// ******************************  供应商 数据获取 end *****************************

// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { erp_purchase_status } = proxy.useDict('erp_purchase_status');

const purchaseOrderList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const nos = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);


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
});

const { queryParams, form } = toRefs(data);

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
  nos.value = selection.map(item => item.orderNo);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  const obj = {path: "/order/purchaseOrder/edit", name:"editPurchaseOrder"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/order/purchaseOrder/edit" });
    } 
  )
  
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _orderId = row.orderId || ids.value[0];
  const obj = {path: "/order/purchaseOrder/edit", name:"editPurchaseOrder"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/order/purchaseOrder/edit", query: { orderId: _orderId } });
    } 
  )
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  const _orderNos = row.orderNo || nos.value;
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + _orderNos + '"的数据项？').then(function() {
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

/** 监听路由，路由跳转后更新界面数据 */
watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList();
  }
);

// 采购员 - 初始化列表
const buyerList = ref([])
/** 采购员 - 获取列表 */
const getBuyers = () => {
  listBuyer().then(response => {
    buyerList.value = response.rows || []
  })
}

const getBuyerName = (buyerId) => {
  const user = buyerList.value.find((item) => item.userId === buyerId);
  return user ? user.userName : "";
} 

/** 保留2位小数 */
const formatTwo = (value) => {
  if (value) {
    return value.toFixed(2);
  } else {
    return 0;
  }
};

getBuyers()
getList();
</script>
