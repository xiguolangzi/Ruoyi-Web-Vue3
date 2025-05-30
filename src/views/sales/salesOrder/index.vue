<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="初始单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderInitNo"
          placeholder="请输入初始单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单来源" prop="orderSource">
        <el-select v-model="queryParams.orderSource" placeholder="请选择订单来源" clearable>
          <el-option
            v-for="dict in sales_order_source"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库ID" prop="warehouseId">
        <el-input
          v-model="queryParams.warehouseId"
          placeholder="请输入仓库ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收银台ID" prop="cajaId">
        <el-input
          v-model="queryParams.cajaId"
          placeholder="请输入收银台ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交班ID" prop="shiftId">
        <el-input
          v-model="queryParams.shiftId"
          placeholder="请输入交班ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务员ID" prop="salesmanId">
        <el-input
          v-model="queryParams.salesmanId"
          placeholder="请输入业务员ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户ID" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入客户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="销售活动ID" prop="activityId">
        <el-input
          v-model="queryParams.activityId"
          placeholder="请输入销售活动ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单类型" prop="orderType">
        <el-select v-model="queryParams.orderType" placeholder="请选择订单类型" clearable>
          <el-option
            v-for="dict in sales_order_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in sales_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单支付状态" prop="orderPayStatus">
        <el-select v-model="queryParams.orderPayStatus" placeholder="请选择订单支付状态" clearable>
          <el-option
            v-for="dict in sales_order_pay_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['sales:salesOrder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesOrder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesOrder:export']"
        >导出</el-button>
      </el-col>
      
      <el-col :span="1.5">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" size="small" v-loading="loading" :data="salesOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="初始单号" align="center" prop="orderInitNo" show-overflow-tooltip min-width="150">
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.orderInitNo }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="订单方向" align="center" prop="orderDirection" >
        <template #default="scope">
          <dict-tag :options="sales_order_direction" :value="scope.row.orderDirection"/>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center" prop="orderNo" show-overflow-tooltip min-width="150" />
      <el-table-column label="总数量" align="center" prop="totalQuantity" />
      <el-table-column label="总金额" align="center" prop="totalAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总折扣额" align="center" prop="totalDiscountAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalDiscountAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="销售总额" align="center" prop="totalSalesAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalSalesAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="基础金额" align="center" prop="totalBaseAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalBaseAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总税额" align="center" prop="totalTaxAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalTaxAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="应收总额" align="center" prop="totalNetAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalNetAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="含税状态" align="center" prop="inTax" >
        <template #default="scope">
          <el-tag v-if="scope.row.inTax == '0'" type="success">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="未核销金额" align="center" prop="remainAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.remainAmount)}} €</span>
        </template>
      </el-table-column>
      <el-table-column label="已核销金额" align="center" prop="verifiedAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.verifiedAmount)}} €</span>
        </template>
      </el-table-column>
      
      
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template #default="scope">
          <dict-tag :options="sales_order_type" :value="scope.row.orderType"/>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="sales_order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="orderPayStatus">
        <template #default="scope">
          <dict-tag :options="sales_order_pay_status" :value="scope.row.orderPayStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="订单来源" align="center" prop="orderSource">
        <template #default="scope">
          <dict-tag :options="sales_order_source" :value="scope.row.orderSource"/>
        </template>
      </el-table-column>
      <el-table-column label="父级订单编号" align="center" prop="parentOrderInitNo" show-overflow-tooltip min-width="100" />
      <el-table-column label="仓库名称" align="center" prop="warehouseName" />
      <el-table-column label="收银台名称" align="center" prop="cajaName" />
      <el-table-column label="业务员名称" align="center" prop="salesmanName" />
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="业务活动" align="center" prop="activityName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="190">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesOrder:edit']" size="small">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesOrder:remove']" size="small">删除</el-button>
          <el-button link type="primary" @click="handleShowDetail(scope.row)" v-hasPermi="['sales:salesOrder:query']" size="small">>>更多详情</el-button>
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

    <!-- 详情抽屉弹窗 -->
    <el-drawer v-model="drawer" direction="rtl" append-to-body size="50%" :with-header="false">
      <div v-if="currentRow" style="width: 100%;">
        <el-card shadow="hover" class="compact-card" style="width: 100%;">
          <template #header>
            <div class="clearfix" style="display: flex;">
              <span style="margin-right: 20px;">订单信息</span>
              <dict-tag :options="sales_order_direction" :value="currentRow.orderDirection"/>
            </div>
          </template>
          <el-descriptions direction="vertical" :column="4" size="small" border >
            <el-descriptions-item label="初始单号" :span="1" >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="currentRow.orderInitNo"
                placement="top-start"
              >
                <span class="text-ellipsis">{{ currentRow.orderInitNo }}</span>
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="订单编号" :span="1" >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="currentRow.orderNo"
                placement="top-start"
              >
                <span class="text-ellipsis">{{ currentRow.orderNo }}</span>
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="父级订单编号" :span="1" >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="currentRow.parentOrderInitNo"
                placement="top-start"
              >
                <span class="text-ellipsis">{{ currentRow.parentOrderInitNo }}</span>
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="收银台名称" :span="1" >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="currentRow.cajaName"
                placement="top-start"
              >
                <span class="text-ellipsis">{{ currentRow.cajaName }}</span>
              </el-tooltip>
            </el-descriptions-item>

            <el-descriptions-item label="订单类型" >
              <dict-tag :options="sales_order_type" :value="currentRow.orderType"/>
            </el-descriptions-item>
            <el-descriptions-item label="订单状态" >
              <dict-tag :options="sales_order_status" :value="currentRow.orderStatus"/>
            </el-descriptions-item>
            <el-descriptions-item label="订单来源" >
              <dict-tag :options="sales_order_source" :value="currentRow.orderSource"/>
            </el-descriptions-item>
            <el-descriptions-item label="扣减仓库" >
              <span>{{ currentRow.warehouseName }} </span>
            </el-descriptions-item>
            

            <el-descriptions-item label="总数量" width="100">
              <span>{{ currentRow.totalQuantity }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="总金额" width="100">
              <span>{{ formatTwo(currentRow.totalAmount)}} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="活动减免" width="100">
              <span>{{ formatTwo(currentRow.totalPromotionReduceQuantity)}} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="总折扣额" width="100">
              <span>{{ formatTwo(currentRow.totalDiscountAmount)}} €</span>
            </el-descriptions-item>

            <el-descriptions-item label="销售总额" >
              <span>{{ formatTwo(currentRow.totalSalesAmount)}} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="基础金额" >
              <span>{{ formatTwo(currentRow.totalBaseAmount)}} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="总税额" >
              <span>{{ formatTwo(currentRow.totalTaxAmount)}} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="应收总额" >
              <span>{{ formatTwo(currentRow.totalNetAmount)}} €</span>
            </el-descriptions-item>

            <el-descriptions-item label="现金收款" >
              <span>{{ formatTwo(currentRow.cashAmount) }} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="银行收款" >
              <span>{{ formatTwo(currentRow.bankAmount) }} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="找零" >
              <span>{{ formatTwo(currentRow.changeAmount) }} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="抹零" >
              <span>{{ formatTwo(currentRow.zeroAmount) }} €</span>
            </el-descriptions-item>

            <el-descriptions-item label="支付状态" >
              <dict-tag :options="sales_order_pay_status" :value="currentRow.orderPayStatus"/>
            </el-descriptions-item>
            <el-descriptions-item label="客户名称" >
              <span>{{ currentRow.customerName }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="未核销金额" >
              <span>{{ formatTwo(currentRow.remainAmount) }} €</span>
            </el-descriptions-item>
            <el-descriptions-item label="已核销金额" >
              <span>{{ formatTwo(currentRow.verifiedAmount) }} €</span>
            </el-descriptions-item>

            <el-descriptions-item label="业务员名称" >
              <span>{{ currentRow.salesmanName ?? '--' }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="基础佣金点数" >
              <span>{{ currentRow.remark ?? '--' }} %</span>
            </el-descriptions-item>
            <el-descriptions-item label="业务活动名称" >
              <span>{{ currentRow.activityName ?? '--' }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="业务活动佣金点数" >
              <span>{{ currentRow.remark ?? '--' }} %</span>
            </el-descriptions-item>

            <el-descriptions-item label="创建人" >
              <span>{{ currentRow.createBy }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" >
              <span>{{ currentRow.createTime }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="修改人" >
              <span>{{ currentRow.updateBy }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="修改时间" >
              <span>{{ currentRow.updateTime }} </span>
            </el-descriptions-item>

            <el-descriptions-item label="备注信息" :span="4" >
              <span>{{ currentRow.remark ?? '--' }} </span>
            </el-descriptions-item>

          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="SalesOrder">
import { listSalesOrder, getSalesOrder, delSalesOrder } from "@/api/sales/salesOrder";
import useUserStore from "@/store/modules/user";
import { OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum } from './cashOperationUtil/cashOperationEnum.js';
import { OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import SnowflakeID from '@/utils/SnowflakeID.js';
import { useRouter, useRoute } from "vue-router";

// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');

const salesOrderList = ref([]);
const salesOrderDetailList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const orderInitNos = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderInitNo: null,
    orderNo: null,
    parentOrderId: null,
    orderSource: null,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    customerId: null,
    activityId: null,
    orderType: null,
    orderStatus: null,
    orderIsHold: null,
    orderPayStatus: null,
    tenantId: null,
  },
  rules: {
    tenantId: [
      { required: true, message: "租户id不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询销售订单列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesOrder(queryParams.value).then(response => {
    salesOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ***************************************  6 抽屉数据部分 start *********************************************
// 抽屉弹窗
const drawer = ref(false);
const currentRow = ref(null)
const handleShowDetail = (row) => {
  currentRow.value = row;
  drawer.value = true;
}
// ***************************************  6 抽屉数据部分 end *********************************************


// 表单重置
function reset() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderNo = snowflake.nextId();
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.SALES,
    orderInitNo: orderNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.CAJA,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    customerId: null,
    activityId: null,
    orderType: OrderTypeEnum.PRE_ORDER,
    orderStatus: OrderStatusEnum.INIT,
    orderIsHold: OrderIsHoldEnum.NORMAL,
    orderPayStatus: OrderPayStatusEnum.SETTLE,
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscountAmount: 0,
    totalSalesAmount: 0,
    totalBaseAmount: 0,
    totalTaxAmount: 0,
    totalNetAmount: 0,
    cashAmount: 0,
    bankAmount: 0,
    changeAmount: 0,
    zeroAmount: 0,
    remainAmount: 0,
    verifiedAmount: 0,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null,
    delFlag: null,
    operateLog: null,
  };
  salesOrderDetailList.value = [];
  proxy.resetForm("salesOrderRef");
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
  orderInitNos.value = selection.map(item => item.orderInitNo);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  const obj = {path: "/salesManager/editSalesOrder", name:"editSalesOrder"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/salesManager/editSalesOrder" });
    } 
  ) 
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _orderId = row.orderId || ids.value[0];
  const obj = {path: "/salesManager/editSalesOrder", name:"editSalesOrder"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/salesManager/editSalesOrder", query: { orderId: _orderId } });
    } 
  )
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  const _orderInitNo = row.orderInitNo || orderInitNos.value;
  proxy.$modal.confirm('是否确认删除销售订单编号为"' + _orderInitNo + '"的数据项？').then(function() {
    return delSalesOrder(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesOrder/export', {
    ...queryParams.value
  }, `salesOrder_${new Date().getTime()}.xlsx`)
}

/** 监听路由，路由跳转后更新界面数据 */
watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList();
  }
);

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

.text-ellipsis {
  display: inline-block ;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


</style>
