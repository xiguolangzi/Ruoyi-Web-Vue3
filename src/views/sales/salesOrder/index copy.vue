<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
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
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="含税状态" prop="orderInTax">
        <el-select v-model="queryParams.orderInTax" placeholder="请选择含税状态" clearable>
          <el-option
            v-for="dict in sales_order_in_tax"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in sales_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单支付状态" prop="orderPayStatus">
        <el-select v-model="queryParams.orderPayStatus" placeholder="请选择订单支付状态" clearable>
          <el-option
            v-for="dict in sales_order_pay_status"
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="salesOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="orderId" />
      <el-table-column label="初始单号" align="center" prop="orderInitNo" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="原始订单ID" align="center" prop="parentOrderId" />
      <el-table-column label="订单来源" align="center" prop="orderSource">
        <template #default="scope">
          <dict-tag :options="sales_order_source" :value="scope.row.orderSource"/>
        </template>
      </el-table-column>
      <el-table-column label="含税状态" align="center" prop="orderInTax">
        <template #default="scope">
          <dict-tag :options="sales_order_in_tax" :value="scope.row.orderInTax"/>
        </template>
      </el-table-column>
      <el-table-column label="仓库ID" align="center" prop="warehouseId" />
      <el-table-column label="收银台ID" align="center" prop="cajaId" />
      <el-table-column label="交班ID" align="center" prop="shiftId" />
      <el-table-column label="业务员ID" align="center" prop="salesmanId" />
      <el-table-column label="客户ID" align="center" prop="customerId" />
      <el-table-column label="销售活动ID" align="center" prop="activityId" />
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
      <el-table-column label="是否挂单" align="center" prop="orderIsHold">
        <template #default="scope">
          <dict-tag :options="sales_order_is_hold" :value="scope.row.orderIsHold"/>
        </template>
      </el-table-column>
      <el-table-column label="订单支付状态" align="center" prop="orderPayStatus">
        <template #default="scope">
          <dict-tag :options="sales_order_pay_status" :value="scope.row.orderPayStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="totalAmount" />
      <el-table-column label="总折扣额" align="center" prop="totalDiscountAmount" />
      <el-table-column label="促销活动减免金额" align="center" prop="totalPromotionReduceAmount" />
      <el-table-column label="销售总额" align="center" prop="totalSalesAmount" />
      <el-table-column label="基础金额" align="center" prop="totalBaseAmount" />
      <el-table-column label="总税额" align="center" prop="totalTaxAmount" />
      <el-table-column label="应收总额" align="center" prop="totalNetAmount" />
      <el-table-column label="未核销金额" align="center" prop="remainAmount" />
      <el-table-column label="已核销金额" align="center" prop="verifiedAmount" />
      <el-table-column label="促销活动赠送数量" align="center" prop="totalGiftQuantity" />
      <el-table-column label="优惠抹零(交班计算)" align="center" prop="totalZeroAmount" />
      <el-table-column label="备注信息" align="center" prop="remark" />
      <el-table-column label="租户id" align="center" prop="tenantId" />
      <el-table-column label="操作记录" align="center" prop="operateLog" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesOrder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesOrder:remove']">删除</el-button>
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

    <!-- 添加或修改销售订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesOrderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="初始单号" prop="orderInitNo">
          <el-input v-model="form.orderInitNo" placeholder="请输入初始单号" />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="原始订单ID" prop="parentOrderId">
          <el-input v-model="form.parentOrderId" placeholder="请输入原始订单ID" />
        </el-form-item>
        <el-form-item label="订单来源" prop="orderSource">
          <el-input v-model="form.orderSource" placeholder="请输入订单来源" />
        </el-form-item>
        <el-form-item label="含税状态" prop="orderInTax">
          <el-input v-model="form.orderInTax" placeholder="请输入含税状态" />
        </el-form-item>
        <el-form-item label="仓库ID" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="请输入仓库ID" />
        </el-form-item>
        <el-form-item label="收银台ID" prop="cajaId">
          <el-input v-model="form.cajaId" placeholder="请输入收银台ID" />
        </el-form-item>
        <el-form-item label="交班ID" prop="shiftId">
          <el-input v-model="form.shiftId" placeholder="请输入交班ID" />
        </el-form-item>
        <el-form-item label="业务员ID" prop="salesmanId">
          <el-input v-model="form.salesmanId" placeholder="请输入业务员ID" />
        </el-form-item>
        <el-form-item label="客户ID" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入客户ID" />
        </el-form-item>
        <el-form-item label="销售活动ID" prop="activityId">
          <el-input v-model="form.activityId" placeholder="请输入销售活动ID" />
        </el-form-item>
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="form.orderType" placeholder="请选择订单类型">
            <el-option
              v-for="dict in sales_order_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-radio-group v-model="form.orderStatus">
            <el-radio
              v-for="dict in sales_order_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否挂单" prop="orderIsHold">
          <el-input v-model="form.orderIsHold" placeholder="请输入是否挂单" />
        </el-form-item>
        <el-form-item label="订单支付状态" prop="orderPayStatus">
          <el-radio-group v-model="form.orderPayStatus">
            <el-radio
              v-for="dict in sales_order_pay_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="总金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
        </el-form-item>
        <el-form-item label="总折扣额" prop="totalDiscountAmount">
          <el-input v-model="form.totalDiscountAmount" placeholder="请输入总折扣额" />
        </el-form-item>
        <el-form-item label="促销活动减免金额" prop="totalPromotionReduceAmount">
          <el-input v-model="form.totalPromotionReduceAmount" placeholder="请输入促销活动减免金额" />
        </el-form-item>
        <el-form-item label="销售总额" prop="totalSalesAmount">
          <el-input v-model="form.totalSalesAmount" placeholder="请输入销售总额" />
        </el-form-item>
        <el-form-item label="基础金额" prop="totalBaseAmount">
          <el-input v-model="form.totalBaseAmount" placeholder="请输入基础金额" />
        </el-form-item>
        <el-form-item label="总税额" prop="totalTaxAmount">
          <el-input v-model="form.totalTaxAmount" placeholder="请输入总税额" />
        </el-form-item>
        <el-form-item label="应收总额" prop="totalNetAmount">
          <el-input v-model="form.totalNetAmount" placeholder="请输入应收总额" />
        </el-form-item>
        <el-form-item label="未核销金额" prop="remainAmount">
          <el-input v-model="form.remainAmount" placeholder="请输入未核销金额" />
        </el-form-item>
        <el-form-item label="已核销金额" prop="verifiedAmount">
          <el-input v-model="form.verifiedAmount" placeholder="请输入已核销金额" />
        </el-form-item>
        <el-form-item label="促销活动赠送数量" prop="totalGiftQuantity">
          <el-input v-model="form.totalGiftQuantity" placeholder="请输入促销活动赠送数量" />
        </el-form-item>
        <el-form-item label="优惠抹零(交班计算)" prop="totalZeroAmount">
          <el-input v-model="form.totalZeroAmount" placeholder="请输入优惠抹零(交班计算)" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="租户id" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户id" />
        </el-form-item>
        <el-form-item label="删除状态" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除状态" />
        </el-form-item>
        <el-form-item label="操作记录" prop="operateLog">
          <el-input v-model="form.operateLog" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">销售订单明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddSalesOrderDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteSalesOrderDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="salesOrderDetailList" :row-class-name="rowSalesOrderDetailIndex" @selection-change="handleSalesOrderDetailSelectionChange" ref="salesOrderDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="明细类型" prop="detailType" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.detailType" placeholder="请选择明细类型">
                <el-option
                  v-for="dict in sales_order_detail_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="父级sku" prop="detailMainSkuId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailMainSkuId" placeholder="请输入父级sku" />
            </template>
          </el-table-column>
          <el-table-column label="skuId" prop="skuId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuId" placeholder="请输入skuId" />
            </template>
          </el-table-column>
          <el-table-column label="sku编码" prop="skuCode" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuCode" placeholder="请输入sku编码" />
            </template>
          </el-table-column>
          <el-table-column label="sku类型" prop="skuType" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.skuType" placeholder="请选择sku类型">
                <el-option
                  v-for="dict in erp_product_sku_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="sku属性" prop="skuValue" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuValue" placeholder="请输入sku属性" />
            </template>
          </el-table-column>
          <el-table-column label="sku名称" prop="skuName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuName" placeholder="请输入sku名称" />
            </template>
          </el-table-column>
          <el-table-column label="辅助名称" prop="assistName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.assistName" placeholder="请输入辅助名称" />
            </template>
          </el-table-column>
          <el-table-column label="批次ID" prop="batchId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.batchId" placeholder="请输入批次ID" />
            </template>
          </el-table-column>
          <el-table-column label="序列号" prop="detailSn" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailSn" placeholder="请输入序列号" />
            </template>
          </el-table-column>
          <el-table-column label="商品单价" prop="detailPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailPrice" placeholder="请输入商品单价" />
            </template>
          </el-table-column>
          <el-table-column label="商品数量" prop="detailQuantity" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailQuantity" placeholder="请输入商品数量" />
            </template>
          </el-table-column>
          <el-table-column label="销售金额" prop="detailAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailAmount" placeholder="请输入销售金额" />
            </template>
          </el-table-column>
          <el-table-column label="折扣率" prop="detailDiscountRate" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailDiscountRate" placeholder="请输入折扣率" />
            </template>
          </el-table-column>
          <el-table-column label="折扣金额" prop="detailDiscountAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailDiscountAmount" placeholder="请输入折扣金额" />
            </template>
          </el-table-column>
          <el-table-column label="销售金额" prop="detailSalesAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailSalesAmount" placeholder="请输入销售金额" />
            </template>
          </el-table-column>
          <el-table-column label="基础金额" prop="detailBaseAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailBaseAmount" placeholder="请输入基础金额" />
            </template>
          </el-table-column>
          <el-table-column label="税率" prop="detailTaxRate" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailTaxRate" placeholder="请输入税率" />
            </template>
          </el-table-column>
          <el-table-column label="税额" prop="detailTaxAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailTaxAmount" placeholder="请输入税额" />
            </template>
          </el-table-column>
          <el-table-column label="实际金额" prop="detailNetAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.detailNetAmount" placeholder="请输入实际金额" />
            </template>
          </el-table-column>
          <el-table-column label="促销活动ID" prop="promotionId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.promotionId" placeholder="请输入促销活动ID" />
            </template>
          </el-table-column>
          <el-table-column label="促销活动名称" prop="promotionName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.promotionName" placeholder="请输入促销活动名称" />
            </template>
          </el-table-column>
          <el-table-column label="商品备注" prop="remark" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入商品备注" />
            </template>
          </el-table-column>
          <el-table-column label="租户ID" prop="tenantId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.tenantId" placeholder="请输入租户ID" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="SalesOrder">
import { listSalesOrder, getSalesOrder, delSalesOrder, addSalesOrder, updateSalesOrder } from "@/api/sales/salesOrder";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');

const salesOrderList = ref([]);
const salesOrderDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedSalesOrderDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderInitNo: null,
    orderNo: null,
    parentOrderId: null,
    orderSource: null,
    orderInTax: null,
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
    totalAmount: null,
    totalDiscountAmount: null,
    totalPromotionReduceAmount: null,
    totalSalesAmount: null,
    totalBaseAmount: null,
    totalTaxAmount: null,
    totalNetAmount: null,
    remainAmount: null,
    verifiedAmount: null,
    totalGiftQuantity: null,
    totalZeroAmount: null,
    tenantId: null,
    operateLog: null
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

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    orderId: null,
    orderInitNo: null,
    orderNo: null,
    parentOrderId: null,
    orderSource: null,
    orderInTax: null,
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
    totalAmount: null,
    totalDiscountAmount: null,
    totalPromotionReduceAmount: null,
    totalSalesAmount: null,
    totalBaseAmount: null,
    totalTaxAmount: null,
    totalNetAmount: null,
    remainAmount: null,
    verifiedAmount: null,
    totalGiftQuantity: null,
    totalZeroAmount: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null,
    delFlag: null,
    operateLog: null
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
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加销售订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _orderId = row.orderId || ids.value
  getSalesOrder(_orderId).then(response => {
    form.value = response.data;
    salesOrderDetailList.value = response.data.salesOrderDetailList;
    open.value = true;
    title.value = "修改销售订单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesOrderRef"].validate(valid => {
    if (valid) {
      form.value.salesOrderDetailList = salesOrderDetailList.value;
      if (form.value.orderId != null) {
        updateSalesOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除销售订单编号为"' + _orderIds + '"的数据项？').then(function() {
    return delSalesOrder(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 销售订单明细序号 */
function rowSalesOrderDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 销售订单明细添加按钮操作 */
function handleAddSalesOrderDetail() {
  let obj = {};
  obj.detailType = "";
  obj.detailMainSkuId = "";
  obj.skuId = "";
  obj.skuCode = "";
  obj.skuType = "";
  obj.skuValue = "";
  obj.skuName = "";
  obj.assistName = "";
  obj.batchId = "";
  obj.detailSn = "";
  obj.detailPrice = "";
  obj.detailQuantity = "";
  obj.detailAmount = "";
  obj.detailDiscountRate = "";
  obj.detailDiscountAmount = "";
  obj.detailSalesAmount = "";
  obj.detailBaseAmount = "";
  obj.detailTaxRate = "";
  obj.detailTaxAmount = "";
  obj.detailNetAmount = "";
  obj.promotionId = "";
  obj.promotionName = "";
  obj.remark = "";
  obj.tenantId = "";
  salesOrderDetailList.value.push(obj);
}

/** 销售订单明细删除按钮操作 */
function handleDeleteSalesOrderDetail() {
  if (checkedSalesOrderDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的销售订单明细数据");
  } else {
    const salesOrderDetails = salesOrderDetailList.value;
    const checkedSalesOrderDetails = checkedSalesOrderDetail.value;
    salesOrderDetailList.value = salesOrderDetails.filter(function(item) {
      return checkedSalesOrderDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleSalesOrderDetailSelectionChange(selection) {
  checkedSalesOrderDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesOrder/export', {
    ...queryParams.value
  }, `salesOrder_${new Date().getTime()}.xlsx`)
}

getList();
</script>
