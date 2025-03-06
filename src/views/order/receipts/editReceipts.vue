<!-- PurchaseOrderDetail.vue -->
<template>
  <div class="purchase-order-detail">
    <el-card class="purchase-order">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>采购入库单详情</h2>
            <dict-tag :options="erp_receipts_status" :value="form.receiptsStatus" />
            <svg-icon icon-class="waitReceived" style="font-size: 40px;"
              v-if="form.receiptsStatus === OrderStatusEnum.RECEIVED || form.receiptsStatus === OrderStatusEnum.BIND_INVOICED" />
            <svg-icon icon-class="invoice" style="font-size: 40px;"
              v-if="form.receiptsStatus === OrderStatusEnum.BIND_INVOICED" />
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="ml-4">
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.receiptsStatus === OrderStatusEnum.EDIT" @click="handleSave"
                v-hasPermi="['order:receipts:add','order:receipts:edit']">
                保存
              </el-button>
              <el-button type="danger" v-if="form.receiptsStatus === OrderStatusEnum.EDIT" @click="handleDelete"
                v-hasPermi="['order:receipts:add','order:receipts:edit']">
                删除
              </el-button>

              <!-- 保存状态 -->
              <el-button type="primary" v-if="form.receiptsStatus === OrderStatusEnum.SAVE"
                @click="handleSubmitForReceive" v-hasPermi="['order:receipts:add','order:receipts:edit']">
                提交入库申请
              </el-button>
              <el-button type="warning" v-if="form.receiptsStatus === OrderStatusEnum.SAVE" @click="handleEdit"
                v-hasPermi="['order:receipts:add','order:receipts:edit']">
                继续编辑
              </el-button>

              <!-- 待入库状态 -->
              <el-button type="primary" v-if="form.receiptsStatus === OrderStatusEnum.WAIT_FOR_RECEIVED"
                @click="handleReceived" v-hasPermi="['order:receipts:received']">
                确认入库
              </el-button>
              <el-button type="danger" v-if="form.receiptsStatus === OrderStatusEnum.WAIT_FOR_RECEIVED"
                @click="handleReject" v-hasPermi="['order:receipts:received']">
                驳回入库申请
              </el-button>

              <!-- 已入库状态 -->
              <el-button type="success" v-if="form.receiptsStatus === OrderStatusEnum.RECEIVED"
                @click="handleBindInvoiced" v-hasPermi="['order:receipts:invoiced']">
                绑定发票
              </el-button>
              <el-button type="danger" v-if="form.receiptsStatus === OrderStatusEnum.RECEIVED" @click="handleUnReceived"
                v-hasPermi="['order:receipts:received']">
                反入库
              </el-button>

              <!-- 生成发票 -->
              <el-button type="warning" v-if="form.receiptsStatus === OrderStatusEnum.BIND_INVOICED"
                @click="handleUnBindInvoiced" v-hasPermi="['order:receipts:invoiced']">
                解绑发票
              </el-button>

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
              <el-tooltip content="退出编辑" effect="dark" placement="bottom">
                <el-button icon="Close" type="info" @click="goBack"> 退出编辑 </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="receiptsRef" :model="form" :rules="rules" label-width="120px"
        :disabled="form.receiptsStatus !== OrderStatusEnum.EDIT">

        <!-- 基本信息 -->
        <el-row :gutter="20">
          <el-form-item label="入库单号:" prop="receiptsNo">
            <el-input v-model="form.receiptsNo" placeholder="系统自动生成" disabled />
          </el-form-item>
          <el-form-item label="供应商：" prop="supplierId">
            <el-select v-model="form.supplierId" filterable clearable placeholder="请选中供应商"
              @change="handleChangeSupplier">
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option v-for="item in supplierList" :key="item.supplierId" :label="item.supplierName"
                :value="item.supplierId" />
            </el-select>
          </el-form-item>
          <el-form-item label="入库仓库:" prop="warehouseId">
            <el-select v-model="form.warehouseId" filterable clearable placeholder="请选择存入的仓库">
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.warehouseName"
                :value="item.warehouseId" />
            </el-select>
          </el-form-item>
          <el-form-item label="入库时间:" prop="receivedTime">
            <el-date-picker v-model="form.receivedTime" type="date" placeholder="选择入库日期" style="width: 150px;" />
          </el-form-item>
          <el-form-item label="入库备注:" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-row>
        <el-row :gutter="20">
          <el-form-item label="发票号:" prop="invoiceId">
            <el-select v-model="form.invoiceId" filterable clearable placeholder="请选择发票号"
              @focus="handleCheckSupplierId()" style="width: 100%;">
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option v-for="item in purchaseInvoiceList" :key="item.invoiceId" :label="item.invoiceNo"
                :value="item.invoiceId" />
            </el-select>
          </el-form-item>
          <el-form-item label="配送方式" prop="deliveryType">
            <el-select v-model="form.deliveryType" placeholder="请选择配送方式" clearable>
              <el-option v-for="dict in erp_delivery_type" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="物流公司:" prop="deliveryCompanyId" v-if="form.deliveryType=='2'">
            <el-select v-model="form.deliveryCompanyId" filterable clearable placeholder="请选中物流公司" style="width: 200px">
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option v-for="item in logisticsCompanyList" :key="item.companyId" :label="item.companyName"
                :value="item.companyId" />
            </el-select>
          </el-form-item>
          <el-form-item label="物流单号:" prop="deliveryNo" v-if="form.deliveryType=='2'">
            <el-input v-model="form.deliveryNo" placeholder="请输入备注" />
          </el-form-item>
          <el-form-item label="货柜编号:" prop="containerId" v-if="form.deliveryType=='3'">
            <el-select v-model="form.containerId" filterable clearable placeholder="请选中货柜" style="width: 200px">
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option v-for="item in containerList" :key="item.containerId" :label="item.containerCode"
                :value="item.containerId" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认批次号:" prop="batchNo">
            <el-input v-model="form.batchNo" placeholder="请输入批次号" />
          </el-form-item>
        </el-row>
      </el-form>

      <!-- 分割线 -->
      <el-divider content-position="left">
        <strong style="margin-right: 30px;">入库商品明细</strong>
        <el-button type="primary" size="small" icon="Link" @click="handleLinkPurchaseOrder"
          v-if="form.receiptsStatus == OrderStatusEnum.EDIT">引入采购单</el-button>
      </el-divider>

      <!-- 商品明细 -->
      <div id="touch-scroll-container" style="height:400px">
        <!-- 隐藏输入框 -->
        <input ref="hiddenInput" style="opacity: 0; position: absolute;" />
        <el-auto-resizer>
          <template #default="{ height, width }">
            <el-table-v2 ref="tableRef" :columns="columns" :data="tableData" :sort-by="sortState" :width="width"
              :height="height" :row-height="50" fixed class="custom-table" @scroll="handleScroll" @column-sort="onSort">
            </el-table-v2>
          </template>
        </el-auto-resizer>
      </div>

      <div class="table-operations"
        v-if="form.receiptsStatus === OrderStatusEnum.EDIT && form.details.length < maxLength">
        <el-button type="primary" @click="addItem">
          <el-icon>
            <Plus />
          </el-icon>
          <span> 添加商品 (限制最多 {{ maxLength }} 条流水)</span>
        </el-button>
      </div>

      <!-- 合计信息 -->
      <template #footer>
        <div style="display: flex; justify-content: space-evenly; align-items: center;">
          <div>
            <span> 合计采购额: {{ formatAmount(form.totalPurchaseAmount) }} € </span>
          </div>
          <div>
            <span>合计折扣额: {{ formatAmount(form.totalDiscountAmount) }} € </span>
          </div>
          <div>
            <span> 合计税额: {{ formatAmount(form.totalTaxAmount) }} € </span>
          </div>
          <div>
            <strong class="total-net-amount"> 实际金额: {{ formatAmount(form.totalNetAmount) }} € </strong>
          </div>
        </div>
      </template>
    </el-card>

    <!-- 订单操作记录 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>订单操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
          :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
          {{ activity.operator }} - {{ activity.action }}
          <span v-if="activity.remark"> - - 描述 : </span>
          <span class="remark">{{ activity.remark }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="approvalForm" label-width="80px">
        <!-- 必须要填写备注的操作类型 -->
        <el-form-item :label="getRemarkMessage(currentAction) + ':'"
          v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20"
            :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
        <el-form-item label="请选择发票:" v-if="currentAction == OrderOperateType.BIND_INVOICED">
          <el-select v-model="form.invoiceId" filterable clearable placeholder="请选择发票号" @focus="handleCheckSupplierId()"
            style="width: 100%;">
            <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
            <el-option v-for="item in purchaseInvoiceList" :key="item.invoiceId" :label="item.invoiceNo"
              :value="item.invoiceId" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 不须要填写备注的操作类型 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 引入采购订单 -->
    <el-dialog :title="linkPurchaseOrderTitle" v-model="open" width="70%" append-to-body>
      <el-card>
        <!---- 采购订单选择器 -->
        <el-row>
          <el-col :span="5">
            <el-form-item label="开启采购订单引入">
              <el-switch v-model="showPurchaseNo" size="large" width="60" inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" active-text="开启"
                inactive-text="关闭" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采购订单号:" prop="orderNo" style="margin-right: 20px">
              <el-select v-model="linkPurchaseOrderId" filterable clearable placeholder="请选择采购订单" style="width: 200px"
                @change="handleLinkPurchaseOrderChange" :disabled="!showPurchaseNo">
                <el-option v-for="item in linkPurchaseOrderList" :key="item.orderId" :label="item.orderNo"
                  :value="item.orderId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="syncPurchaseQuantity" :disabled="!showPurchaseNo">同步采购数量</el-button>
                <el-button type="success" @click="syncShortageQuantity" :disabled="!showPurchaseNo">同步缺货数量</el-button>
              </el-button-group>
            </el-form-item>
          </el-col>
        </el-row>


        <!-- 采购订单明细 -->
        <el-table :data="purchaseOrder.details" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="商品名称" align="left" prop="productSkuVo.skuName" min-width="120"
            show-overflow-tooltip />
          <el-table-column label="sku编码" align="left" prop="productSkuVo.skuCode" min-width="120"
            show-overflow-tooltip />
          <el-table-column label="suk" align="left" prop="productSkuVo.skuValue" min-width="90" show-overflow-tooltip>
            <template #default="scope">
              <div v-if="getSkuValue(scope.row.productSkuVo?.skuValue) === 'default'">
                -- <!-- 直接显示默认 SKU -->
              </div>
              <div v-else v-for="(item, index) in getSkuValue(scope.row.productSkuVo?.skuValue)" :key="index">
                <strong>{{ item[0] }}:</strong>
                <span>{{ item[1] }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="采购单价" align="right" header-align="center" prop="unitPrice">
            <template #default="scope">
              <span>{{ formatTwo(scope.row.unitPrice) }} €</span>
            </template>
          </el-table-column>
          <el-table-column label="采购数量" align="center" prop="quantity" />
          <el-table-column label="入库数量" align="center" prop="inputQuantity">
            <template #default="scope">
              <el-input-number v-model="scope.row.inputQuantity" :min="0" :controls="false" style="width: 100%"
                :precision="0" :step="0" :disabled="!showPurchaseNo || scope.row.unitPrice == 0"
                @change="calculateShortageQuantity(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column label="已入库" align="center" prop="receivedQuantity" />
          <el-table-column label="缺货数量" align="center" prop="shortageQuantity" />
          <el-table-column label="批次号" align="center" prop="batchNo" min-width="120">
            <template #default="scope">
              <el-tooltip placement="top" :content="scope.row.batchNo">
                <el-input v-model="scope.row.batchNo" placeholder="请输入批次号" />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="过期日期" align="center" prop="expireDate" min-width="150">
            <template #default="scope">
              <el-date-picker v-model="scope.row.expireDate" type="date" placeholder="请选择过期日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" :disabled-date="disablePastDates" style="width: 100%;" />
            </template>
          </el-table-column>
        </el-table>

      </el-card>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitLinkPurchaseOrder()" :disabled="!showPurchaseNo">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted  } from 'vue'
import { ElAutocomplete, ElButton, ElDatePicker, ElIcon, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElOption, ElSelect, ElTooltip } from 'element-plus'
import { useRouter, useRoute } from "vue-router";
import useUserStore from "@/store/modules/user"
import { h } from 'vue'
import { nextTick } from 'vue'
import { debounce } from 'lodash'
import { TableV2SortOrder } from 'element-plus'
import { listReceipts, getReceipts, delReceipts, addReceipts, updateReceipts, updateReceiptsStatus, received, unReceived, bindInvoiced, unBindInvoiced } from "@/api/order/receipts";
import { listSupplier } from "@/api/order/supplier"
import { listSkuByAddOrder, selectStockBySkuId } from "@/api/product/sku"
import { listContainers } from "@/api/transportation/containers";
import { listLogisticsCompanies} from "@/api/order/logisticsCompanies";
import { listWarehouse} from "@/api/product/warehouse";
import { listPurchaseOrderByStatus, getPurchaseOrder} from "@/api/order/purchaseOrder";
import { listCostInvoice } from "@/api/finance/costInvoice";
import { getSkuValue } from '@/utils/ruoyi.js';
import { CostInvoiceSelectStatusList, OrderStatusEnum, OrderStatusColor, OrderStatusName, OrderOperateType } from "./receiptsEnum.js"
import { InvoiceTypeEnum, InvoiceStatusEnum, AssistTypeEnum } from "@/views/finance/costInvoice/costInvoiceEnum.js"


const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { erp_delivery_type, erp_receipts_status } = proxy.useDict('erp_delivery_type', 'erp_receipts_status');


// ****************************** 引入采购单 start *****************************
// 时间选择器不可以选择之前的时间
const disablePastDates = (date) => {
  return date.getTime() < new Date().getTime()
}

const open = ref(false);
// 采购订单列 是否展示控制
const showPurchaseNo = ref(false);
const linkPurchaseOrderTitle = ref("");
/** 点击 引入采购单  -> 获取采购单列表 */
const handleLinkPurchaseOrder = () => {
  // 检查是否已选中供应商
  proxy.$refs["receiptsRef"].validate().then(() => {
    open.value = true;
    resetLinkPurchaseData().then(()=>{
      getLinkPurchaseOrderList().then(() => {
        linkPurchaseOrderTitle.value = "引入已有采购订单";
        console.log("引入采购单数据：",linkPurchaseOrderList.value)
      });
    })
  }) 
};

/** 获取采购订单列表 */
const linkPurchaseOrderList = ref([]);
const purchaseQueryParams = ref({
  // 采购订单状态是 审核 或 进行中
  statusList: [3,4],
  supplierId: null,
});
const getLinkPurchaseOrderList = () => {
    return listPurchaseOrderByStatus(purchaseQueryParams.value)
      .then(response => {
        linkPurchaseOrderList.value = response.data || [];
      })
      .catch (error => {
        ElMessage.error("获取采购订单列表时出错:",error)
      })
};

/** 选择采购订单ID -> 获取采购订单明细 */
const linkPurchaseOrderId = ref(null);
const purchaseOrder = ref([]);
const handleLinkPurchaseOrderChange = (linkPurchaseOrderId) => {
  if (linkPurchaseOrderId) {
    getPurchaseOrder(linkPurchaseOrderId).then((response) => {
      purchaseOrder.value = response.data;
      // 还原数据
      if (purchaseOrder.value.details) {
        purchaseOrder.value.details.forEach(item => {
          item.productSkuVo.skuValue = item.productSkuVo.skuValue;
          item.batchNo = form.value.batchNo;
          item.expireDate = null;
          item.inputQuantity = 0;
        });
      }
      console.log("初始化数据正常：",purchaseOrder.value); 
    });
  }
}

/** 重置引入采购订单数据 */
const resetLinkPurchaseData = () => {
    linkPurchaseOrderList.value = [];
    linkPurchaseOrderId.value = null;
    purchaseOrder.value = [];
    ids.value = [];
    return Promise.resolve();
}

// 多选框选中数据
const ids = ref([]);
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.detailId);
}

/** 采购订单引入 - 同步采购数量 */
const syncPurchaseQuantity = () => {
  if(purchaseOrder.value.details){
    // 入库数量同分采购数量
    purchaseOrder.value.details = purchaseOrder.value.details.map(item => ({
      ...item,
      inputQuantity: item.quantity
    }));
  }
  
}


/** 采购订单引入 - 同步缺货数量 */
const syncShortageQuantity = () => {
  if(purchaseOrder.value.details){
    // 同步缺货数量
    purchaseOrder.value.details = purchaseOrder.value.details.map(item => ({
      ...item,
      inputQuantity: item.shortageQuantity
    }));
  }
  
}

/** 提交引入采购单 */
const submitLinkPurchaseOrder = () => {
  if (!linkPurchaseOrderId.value) {
    ElMessage.error("请选择采购订单");
    return;
  }
  // 获取已选择的数据
  const selectedDetails = purchaseOrder.value.details.filter(item => ids.value.includes(item.detailId));
  if (selectedDetails.length === 0) {
    ElMessage.error("请选择要引入的明细数据");
    return;
  }

  // 将选择的数据转换并添加到form.value.details
  const newDetails = selectedDetails.map(item => ({
    purchaseOrderId: purchaseOrder.value.orderId,
    purchaseOrderNo: purchaseOrder.value.orderNo,
    skuId: item.skuId,
    unitId: item.unitId,
    productSkuVo: {
      skuCode: item.productSkuVo?.skuCode || '',
      skuValue: item.productSkuVo?.skuValue || [],
      productCode: item.productSkuVo?.productCode || '',
      skuName: item.productSkuVo?.skuName || ''
    },
    unitVo: {
      unitCode: item.unitVo.unitCode || '',
    },
    quantity: item.quantity || 0,
    receivedQuantity: item.inputQuantity || 0,
    purchaseAmount: item.purchaseAmount || 0,
    discountRate: item.discountRate || 0,
    discountAmount: item.discountAmount || 0,
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount ||0,
    netAmount: item.netAmount || 0,
    unitPrice: item.unitPrice || 0,
    shortageQuantity: item.shortageQuantity || 0,
    batchNo: item.batchNo || '',
    expireDate: item.expireDate,
  }));

  // 先判断是否存在相同的sku,如果存在提示覆盖还是累加
  const existingItemList = form.value.details.filter(detail => 
    newDetails.some(newItem => newItem.skuId === detail.skuId)
  );

  console.log("已存在的商品：",existingItemList)
  if (existingItemList.length > 0) {
    ElMessageBox.confirm('存在相同的商品，如何处理？', '提示', {
      distinguishCancelAndClose: true,
      confirmButtonText: '覆盖相同商品',
      cancelButtonText: '数量累加',
      type: 'warning',
    })
      .then(() => {
          // 覆盖逻辑：直接用新的商品信息替换原有的商品
          const mergedDetails = form.value.details.map(existingItem => {
            const newItem = newDetails.find(item => item.skuId === existingItem.skuId);
            return newItem ? newItem : existingItem;
          });
          // 添加新的不重复的商品
          const newUniqueItems = newDetails.filter(
            newItem => !form.value.details.some(detail => detail.skuId === newItem.skuId)
          );

          form.value.details = [...mergedDetails, ...newUniqueItems];
          ElMessage.warning("已覆盖重复的商品！");
          console.log("覆盖流程 - mergedDetails",mergedDetails)
          console.log("覆盖流程 - newUniqueItems",newUniqueItems)
          console.log("覆盖流程 - form.value.details",form.value.details)

          // 计算汇总金额
          calculateAmount();
          open.value = false;
      })
      .catch((action) => {
        if(action === 'cancel')
        {
          // 累加逻辑：对于相同SKU的商品，累加数量
          const mergedDetails = form.value.details.map(existingItem => {
            const newItem = newDetails.find(item => item.skuId === existingItem.skuId);
            console.log("累加流程 - 累加商品newItem：",newItem)
            if (newItem) {
              const totalReceivedQuantity = Number((existingItem.receivedQuantity || 0) + (newItem.receivedQuantity || 0)).toFixed(2);
              const unitPrice = Number(existingItem.unitPrice || 0);
              const discountRate = Number(existingItem.discountRate || 0) * 0.01;
              const taxRate = Number(existingItem.taxRate || 0) * 0.01;

              return {
                ...existingItem,
                receivedQuantity: totalReceivedQuantity,
                purchaseAmount: Number((totalReceivedQuantity * unitPrice).toFixed(2)),
                discountAmount: Number((totalReceivedQuantity * unitPrice * discountRate).toFixed(2)),
                taxAmount: Number((totalReceivedQuantity * unitPrice * (1 - discountRate) * taxRate).toFixed(2)),
                netAmount: Number((totalReceivedQuantity * unitPrice *( 1- discountRate ) * ( 1 + taxRate )).toFixed(2)),
              };
            }
            return existingItem;
          });

          // 添加新的不重复的商品
          const newUniqueItems = newDetails.filter(
            newItem => !form.value.details.some(detail => detail.skuId === newItem.skuId)
          );

          form.value.details = [...mergedDetails, ...newUniqueItems];
          ElMessage.success("已累加重复商品的数量！");

          // 计算汇总金额
          calculateAmount();
          open.value = false;
          
        } else {
          // 用户取消操作
          ElMessage.info("已取消操作");
        }
        
      })
  } else {
    // 添加新的明细到form中
    form.value.details = [...form.value.details, ...newDetails];
    calculateAmount();
    ElMessage.warning("已将引入的数据加入到商品明细中！")
    open.value = false;
  } 

}

/** 计算金额*/
const calculateShortageQuantity = (index) => {
  const item = purchaseOrder.value.details[index]
  item.purchaseAmount = item.unitPrice * item.inputQuantity
  item.discountAmount = item.purchaseAmount * item.discountRate * 0.01
  item.taxAmount = (item.purchaseAmount - item.discountAmount) * item.taxRate * 0.01
  item.netAmount = item.purchaseAmount - item.discountAmount + item.taxAmount
  
}

const calculateAmount = () => {
  // 合计总数量
  form.value.totalQuantity = form.value.details.reduce((sum, item) => sum + (item.quantity || 0), 0)
  // 合计 采购金额
  form.value.totalPurchaseAmount = form.value.details.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
  // 合计 折扣额
  form.value.totalDiscountAmount = form.value.details.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  // 合计 税额
  form.value.totalTaxAmount = form.value.details.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
  // 合计 实际采购总金额
  form.value.totalNetAmount = form.value.details.reduce((sum, item) => sum + (item.netAmount || 0), 0)
}



// ****************************** 引入采购单 end   *******************************


// ****************************** 发票号 数据获取 start *****************************
const handleCheckSupplierId = () => {
  // 如果没有选择供应商，提示请先选择供应商
  if (form.value.supplierId == null){
    ElMessage.warning("请先选择供应商！")
  }
}

const purchaseInvoiceList = ref([]);

// 获取发票列表
const getPurchaseInvoiceList = async (supplierId) => {
  // TODO: 定义发票状态: 草稿 未审核 已审核
  const invoiceStatusList = CostInvoiceSelectStatusList;
  const invoiceType = InvoiceTypeEnum.INVOICE_TYPE_PURCHASE;  // 采购发票
  const assistType = AssistTypeEnum.ASSIST_TYPE_SUPPLIER;   // 辅助类型：供应商

  try {
    // 并行发起请求
    const requests = invoiceStatusList.map(status => 
      listCostInvoice({
        assistType: assistType,
        assistId: supplierId || null,
        invoiceType: invoiceType,
        invoiceStatus: status
      })
    );

    // 等待所有请求完成
    const responses = await Promise.all(requests);

    // 合并数据并去重
    purchaseInvoiceList.value = [
      ...new Set(
        responses.flatMap(response => response.rows || [])
      )
    ];
  } catch (error) {
    console.error("获取发票列表时出错:", error);
    ElMessage.error(`获取发票列表失败: ${error.message}`);
  }
};

// ****************************** 发票号 数据获取 end ******************************



// ****************************** 仓库 数据获取 start *****************************
const warehouseList = ref([]);
// 获取仓库列表
const getWarehouseList = () => {
    listWarehouse()
      .then(response => {
        warehouseList.value = response.rows || [];
      })
      .catch (error => {
        ElMessage.error("获取仓库列表时出错:",error)
      })
};
getWarehouseList()

// ****************************** 仓库 数据获取 end ******************************

// ****************************** 物流公司 数据获取 start *************************
const logisticsCompanyList = ref([]);
// 获取物流公司列表
const fetchLogisticsCompany = () => {
    listLogisticsCompanies()
      .then(response => {
        logisticsCompanyList.value = response.rows || [];
      })
      .catch (error => {
        ElMessage.error("获取物流公司列表时出错:",error)
      })
};
fetchLogisticsCompany()

// ****************************** 物流公司 数据获取 end **************************

// *****************************  供应商 数据获取 start **************************
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

let originalSupplierId = null; // 缓存原始的供应商ID
const handleChangeSupplier = () => {
  form.value.invoiceId = null;
  // 1 更新查询参数
  purchaseQueryParams.value.supplierId = form.value.supplierId;
  // 2 如果开启了 显示采购订单号，更新供应商就会清空商品明细
  if(showPurchaseNo.value){
    // 切换供应商 清空入库商品明细
    ElMessageBox.confirm(
      '是否确认变更已选择的供应商？ 变更会导致清空当前入库商品明细数据!',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      // 清空数据
      form.value.details = [];
      //purchaseQueryParams.value.supplierId = form.value.supplierId;
      // 缓存当前的供应商ID
      originalSupplierId = form.value.supplierId;
      // 显示成功提示
      ElMessage.success('已更换供应商');
    }).catch(() => {
      // 取消操作,恢复原供应商ID
      form.value.supplierId = originalSupplierId;
      ElMessage.info('已取消更换供应商'); 
    });
    
  }
  // 3 获取供应商对应的发票号
  getPurchaseInvoiceList(form.value.supplierId);
}

// ******************************  供应商 数据获取 end *****************************

// ****************************** 货柜 数据获取 start ******************************
const containerList = ref([])
/** 货柜 - 获取列表 */
const getContainerList = async () => {
    listContainers()
      .then(response => {
        containerList.value = response.rows || []
      })
      .catch(error => {
        ElMessage.error("获取货柜列表时出错:",error)
      })
};
getContainerList()

// ****************************** 货柜 数据获取 end ******************************


//*******************************   虚拟表格 数据部分  start **********************
const columns = computed(() => [
  {
    key: 'actions',
    title: '删除',
    width: 60,
    align: 'center',
    hidden: form.value.receiptsStatus !== OrderStatusEnum.EDIT,  // 控制列是否可见
    cellRenderer: ({ rowIndex }) => {
      if (form.value.receiptsStatus === OrderStatusEnum.EDIT) {
        return h(ElButton, {
          type: 'danger',
          circle: true,
          icon: 'Delete',
          onClick: () => removeItem(rowIndex),
        },)
      }
      return ''
    }
  },
  {
    key: 'index',
    title: '序号',
    width: 55,
    align: 'center',
    cellRenderer: ({ rowIndex }) => rowIndex + 1
  },
   {
    key: 'purchaseOrderNo',
    title: '采购订单',
    width: 150,
    align: 'left',
    hidden: !showPurchaseNo.value,  // 控制列是否可见
    cellRenderer: ({ rowData }) => {
      const getTooltipContent = () => {return rowData.purchaseOrderNo ? rowData.purchaseOrderNo : '';}
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
      }
      )   
    }
  },
  {
    key: 'quantity',
    title: '采购订单总量',
    width: 100,
    align: 'right',
    hidden: form.value.receiptsStatus !== OrderStatusEnum.EDIT || !showPurchaseNo.value,
    cellRenderer: ({ rowData }) => rowData.quantity
  },
  {
    key: 'shortageQuantity',
    title: '采购订单欠货',
    width: 100,
    align: 'right',
    hidden: form.value.receiptsStatus !== OrderStatusEnum.EDIT || !showPurchaseNo.value,
    cellRenderer: ({ rowData }) => rowData.shortageQuantity
  },
  {
    key: 'skuName',
    title: '商品名称',
    width: 150,
    align: 'left',
    cellRenderer: ({ rowData }) => {
      const getTooltipContent = () => {return rowData.productSkuVo?.skuName;}
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
      }
      )   
    }
  },
  {
    key: 'skuCode',
    title: '规格编码',
    width: 180,
    align: 'left',
    cellRenderer: ({ rowData }) => {
      const getTooltipContent = () => {return rowData.productSkuVo?.skuCode || ' ';}
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
      }
      )   
    }
  },
  {
    key: 'skuValue',
    title: '规格属性',
    width: 120,
    align: 'left',
    cellRenderer: ({ rowData }) => {
      const skuValueArr =  getSkuValue(rowData.productSkuVo?.skuValue)
      if(skuValueArr === "default"){
        return h('span', ' -- -- ')
      }
      return h('div', {}, skuValueArr.map(([key, value]) => {
        if (key !== '' && key !== 'skuName') {
          return h('div', [
            h('strong', `${key}:`),
            h('span', ` ${value}`)
          ])
        }
      }))
    }
  },
  {
    key: 'productCode',
    title: '商品编码',
    width: 180,
    align: 'left',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'productCode')
      const getTooltipContent = () => { return rowData.productSkuVo?.productCode || ''; }
      if (form.value.receiptsStatus === OrderStatusEnum.EDIT) {
        return h(ElAutocomplete, {
          id: inputId,
          modelValue: rowData.productSkuVo?.productCode || '',
          'onUpdate:modelValue': (value) => {
            form.value.details[rowIndex].productSkuVo.productCode = value
          },
          fetchSuggestions: queryProducts,
          placeholder: '输入商品编码或名称',
          highlightFirstItem: true,
          onSelect: (item) => handleProductSelect(item, rowIndex),
          onBlur: () => handleProductOnBlur(rowIndex),
          onChange: () => handleProductChange(rowIndex),
          onKeydown: (e) => handleAutocompleteKeydown(e, rowIndex, 'productCode'),
          onFocus: () => {
            currentFocus.value = { rowIndex, columnKey: 'productCode' };
            isAutocompleteEdit.value = true;
          },
        }, {
          default: ({ item }) => h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
            h('div', `${item.skuCode} - ${item.skuName}`),
            h('small', { style: { color: '#909399', marginLeft: '5px' } }, `库存: ${item.averageCostBySkuVo?.currentStock || '--'}`)
          ])
        })
      }
      // 非编辑状态，显示商品编码

      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      }, {
        default: () => h('div', {
          style: {
            overflow: 'hidden',       // 隐藏溢出部分
            textOverflow: 'ellipsis', // 使用省略号
            whiteSpace: 'nowrap',     // 禁止换行
            cursor: 'pointer'         // 鼠标变成指针，增加交互提示
          }
        }, getTooltipContent())
      }
      )
    }
  },
  {
    key: 'skuUnit',
    title: '单位',
    width: 60,
    align: 'left',
    cellRenderer: ({ rowData }) => {
      if (rowData.unitVo.unitCode) {
        return rowData.unitVo.unitCode
      } else {
        return '--'
      }
    }
  },
  {
    key: 'receivedQuantity',
    title: '入库数量',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'receivedQuantity')
      return h('div',{style: {...getCellStyle(rowIndex, 'receivedQuantity'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.receivedQuantity,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].receivedQuantity = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'receivedQuantity'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'receivedQuantity' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 999999,
        controls: false,
        step:0,
        valueOnClear: 0,
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT
      }))
        
    } 
  },
  {
    key: 'unitPrice',
    title: '单价',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'unitPrice')
      return h('div',{style: {...getCellStyle(rowIndex, 'unitPrice'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.unitPrice,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].unitPrice = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'unitPrice'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'unitPrice' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 2,
        min: 0,
        max: 99999,
        controls: false,
        valueOnClear: 0, 
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
        step:0,
        align:'right'
      },{suffix:() => h('span', {style:{marginLeft:'5px',color:'#909399'}},' €') }))
    }
  },
  {
    key: 'purchaseAmount',
    title: '金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.purchaseAmount)} €`
  },
  {
    key: 'discountRate',
    title: '折扣率%',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'discountRate')
      return h('div',{style: {...getCellStyle(rowIndex, 'discountRate'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.discountRate,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].discountRate = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'discountRate'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'discountRate' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 100,
        controls: false,
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
        step:0,
      },{suffix: () => '%'}))
    }
  },
  {
    key: 'discountAmount',
    title: '折扣额',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.discountAmount)} €`
  },
  {
    key: 'taxRate',
    title: '税率%',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'taxRate')
      return h('div',{style: {...getCellStyle(rowIndex, 'taxRate'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.taxRate,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].taxRate = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'taxRate'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'taxRate' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 100,
        controls: false,
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
        step:0,
      },{suffix: () => '%'}))
    }
  },
  {
    key: 'taxAmount',
    title: '税额',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.taxAmount)} €`
  },
  {
    key: 'netAmount',
    title: '采购总金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.netAmount)} €`
  },
  {
    key: 'batchNo',
    title: '批次号',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'batchNo')
      return h('div',{style: {...getCellStyle(rowIndex, 'batchNo'),width:'100%',display:'flex'}},h(ElInput, {
        id: inputId,
        modelValue: rowData.batchNo,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].batchNo = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'batchNo'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'batchNo' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        controls: false,
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
      }))
    }
  },
  {
    key: 'expireDate',
    title: '过期日期',
    width: 150,
    align: 'center',
    hidden: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'expireDate')
      return h('div',{style: {...getCellStyle(rowIndex, 'expireDate'),width:'100%',display:'flex'}},h(ElDatePicker, {
        id: inputId,
        modelValue: rowData.expireDate,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].expireDate = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'expireDate'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'expireDate' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        type: 'date',
        placeholder:"请选择过期日期",
        disabledDate: disablePastDates,
        disabled: form.value.receiptsStatus !== OrderStatusEnum.EDIT,
        style:{width:'100%'},
      }))
    }
  }
])

const tableData = computed(() => form.value.details)

// 绑定 虚拟表格，用于滚动事件
const tableRef = ref(false)
/** 处理失去焦点后 清除焦点问题 */
const isKeyScrolling = ref(true); // 用于标记是否是键盘触发的滚动
// 用于引用隐藏的输入框
const hiddenInput = ref(null); 
/** 虚拟表格 - 现存量字段 排序 01 */
const sortState = ref({
  key: 'column-0',
  order: TableV2SortOrder.ASC,
})
/** 虚拟表格 - 现存量字段 排序 02 */
const onSort = (sortBy) => {
  console.log(sortBy)
  tableData.value = tableData.value.reverse()
  sortState.value = sortBy
}

//*******************************   虚拟表格 数据部分  end *************************

//***********************   虚拟表格 自动填充组件的键盘操作  start ******************
// 自动填充单元格 编辑状态
const isAutocompleteEdit = ref(true);
const handleAutocompleteKeydown = (event,rowIndex,columnKey) => {
  // 如果 非 自动填充单元格 编辑状态 -> 触发全局键盘移动事件
  if (!isAutocompleteEdit.value) {
    // 阻止事件冒泡，避免触发虚拟表格的上移逻辑
    event.stopPropagation();  
    handleKeyNavigation(event,rowIndex,columnKey)
    isAutocompleteEdit.value = true
  }
};

//***********************   虚拟表格 自动填充组件的键盘操作  end **********************


// ******************************  控制键盘操作焦点事件  start ***********************
// 当前焦点位置
const currentFocus = ref({
  rowIndex: 0,
  columnKey: 'productCode' // 当前聚焦的列key
})

// 可编辑的列keys（需要根据实际情况修改）
const editableColumns = [
  'productCode',
  'receivedQuantity',
  'unitPrice',
  'discountRate',
  'taxRate',
  'batchNo'
]

/** 获取表格数据总行数 */ 
const getTableRowCount = () => {
  return tableData.value?.length || 0
}

/** 检查行索引是否有效 */ 
const isValidRowIndex = (rowIndex) => {
  const totalRows = getTableRowCount()
  return rowIndex >= 0 && rowIndex <= totalRows
}

/** 更新焦点状态 */ 
const updateFocusState = async (rowIndex, columnKey) => {
  currentFocus.value = { ...currentFocus.value, rowIndex, columnKey }
}

/** 生成输入框的唯一ID */ 
const getInputId = (rowIndex, columnKey) => `input-${rowIndex}-${columnKey}`

/** 获取单元格样式 */ 
const getCellStyle = (rowIndex, columnKey) => {
  if (rowIndex == null) return {}
  if (currentFocus.value?.rowIndex == null) return {}
  const isFocused = rowIndex === currentFocus.value.rowIndex && 
                   columnKey === currentFocus.value.columnKey
  return {
    backgroundColor: isFocused ? 'rgba(11, 15, 250, 0.918)' : 'transparent',
    transition: 'background-color 0.1s',
    padding: '0 1px',
  }
}
/** 键盘导航 */ 
const handleKeyNavigation = (e, currentRowIndex, currentColumnKey) => {
  // 返回列名所在的索引(控制列之间的切换)
  const currentColIndex = editableColumns.indexOf(currentColumnKey)
  const totalRows = getTableRowCount()
  let nextRowIndex = currentRowIndex
  let nextColumnKey = currentColumnKey

  // 先阻止默认行为，避免数字框的上下键行为
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()  // 添加这行以彻底阻止事件冒泡
  }

  switch (e.key) {
    case 'ArrowUp':
      if (currentRowIndex > 0) {
        hiddenInput.value.focus();  // bug处理
        nextRowIndex = Math.max(currentRowIndex - 1, 0)
      }
      break
      
    case 'ArrowDown':
      if (currentRowIndex < tableData.value.length - 1) {
        hiddenInput.value.focus();  // bug处理
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
      }
      break
      
    case 'ArrowLeft':
      if (currentColIndex > 0) {
        hiddenInput.value.focus();  // bug处理
        nextColumnKey = editableColumns[currentColIndex - 1]
      }
      break
      
    case 'ArrowRight':
      if (currentColIndex < editableColumns.length - 1) {
        hiddenInput.value.focus();  // bug处理
        nextColumnKey = editableColumns[currentColIndex + 1]
      }
      break
      
    case 'Enter':
      if (currentRowIndex < tableData.value.length - 1) {
        hiddenInput.value.focus();  // bug处理
        e.stopPropagation()
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
        nextColumnKey = editableColumns[0]
      }
      break

  }
  // 如果位置发生变化，则移动焦点
  if (nextRowIndex !== currentRowIndex || nextColumnKey !== currentColumnKey) {
    moveFocus(nextRowIndex, nextColumnKey)
  }
}


/** 移动焦点 */ 
const moveFocus = (rowIndex, columnKey) => {
  try {
    // 边界检查
    if (!isValidRowIndex(rowIndex)) {
      ElMessage.warning(`行索引 ${rowIndex} 超出范围`)
      return
    }

    // 先滚动到目标行
    if (tableRef.value) {
      //ElMessage.error(`移动焦点之前`)
      tableRef.value.scrollToRow(rowIndex)
      //ElMessage.error(`移动焦点到：${rowIndex}`)
    }

    // 更新焦点状态
    updateFocusState(rowIndex, columnKey)
    
    // 渲染之后触发
    nextTick(() => {
      const inputId = getInputId(rowIndex, columnKey)
      const targetInput = document.getElementById(inputId)
      if (targetInput) {
        // 标识键盘触发的滚动
        //ElMessage.error(`重新聚焦到：${rowIndex}`)
        isKeyScrolling.value = true;
        targetInput.focus()
        
        if (targetInput.tagName === 'INPUT') {
          targetInput.select()
        }
      } else {
        console.warn(`未找到目标输入框: ${inputId}`)
      }
    })

  } catch (error) {
    console.error('移动焦点时发生错误:', error)
  }
  
}

/** lodash防抖处理滚动 */ 
const debouncedScroll = debounce(() => {
  isKeyScrolling.value = false;
}, 2);

/** 鼠标滚动 焦点处理 */
const handleScroll = () => {
    if (isKeyScrolling.value) {
      debouncedScroll()  
    } else {
      // 手动滚动才移除焦点
      hiddenInput.value.focus(); 
    }
}


// ******************************  控制键盘操作焦点事件  end *************************

//**************************** 解决虚拟表格 触屏滚动的问题 start 备用 ****************/
const addTouchClass = () => {
  const tableBodyDiv = tableRef.value.$el.querySelector('.el-table-v2__body > div');
  tableBodyDiv.classList.add('is-touch');
};
const removeTouchClass = () => {
  const tableBodyDiv = tableRef.value.$el.querySelector('.el-table-v2__body > div');
  tableBodyDiv.classList.remove('is-touch');
};
const addTouchEventListeners = () => {
  const container = document.querySelector('#touch-scroll-container');
  if (!container) return;
  container.addEventListener('touchstart', addTouchClass, { passive: true });
  container.addEventListener('touchend', removeTouchClass, { passive: true });
};
const removeTouchEventListeners = () => {
  const container = document.querySelector('#touch-scroll-container');
  if (!container) return;
  container.removeEventListener('touchstart', addTouchClass, { passive: true });
  container.removeEventListener('touchend', removeTouchClass, { passive: true });
};
//**************************** 解决虚拟表格 触屏滚动的问题 end 备用 ****************/

/** 组件挂载后初始化设置 */ 
onMounted(() => {
  // 监听触屏滚动事件
  addTouchEventListeners();
})
/** 组件销毁前移除监听 */ 
onBeforeUnmount(() => {
  // 组件销毁前移除触屏滚动监听
  removeTouchEventListeners();
});


//**************************************   虚拟表格 - 数据部分   ***************************************/

const userStore = useUserStore();

/** 获取时间线项目类型 */ 
const getTimelineItemType = (receiptsStatus) => {
  const typeMap = {
    edit: 'info',
    save: 'primary',
    submit: 'warning',
    reject: 'danger',
    received: 'success',
    unReceived: 'danger',
    bindInvoiced: 'success',
    unBindInvoiced: 'danger',
  }
  return typeMap[receiptsStatus] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OrderOperateType.RECEIVED]: '入库备注',
    [OrderOperateType.UN_RECEIVED]: '反入库原因',
    [OrderOperateType.BIND_INVOICED]: '绑定发票备注',
    [OrderOperateType.UN_BIND_INVOICED]: '解绑发票原因'
  };
  return messages[action] || '备注';
}

// 允许最大订单条数
const maxLength = 1000
// 每次添加新增的条数
const onceAddItemLength = 5

// 表单数据
const form = ref({
  receiptsId: null,
  receiptsNo: null,
  supplierId: null,
  totalQuantity: 0,
  totalPurchaseAmount: 0,
  totalDiscountAmount: 0,
  totalTaxAmount: 0,
  totalNetAmount: 0,
  receiptsStatus: OrderStatusEnum.EDIT,
  deliveryType: '1',
  deliveryCompanyId: null,
  deliveryNo: null,
  deliveryTime: new Date(),
  containerId: null,
  deliveryAmount: null,
  clearanceFee: null,
  vatInput: null,
  totalAmountCost: null,
  remark: '',
  operateLog: '',
  operateType: '',
  receivedTime: new Date(),
  warehouseId: null,
  showPurchaseNo,
  batchNo: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
  details: [],
  invoiceId:null,
})


// 表单校验规则
const rules = ref({
  receivedTime: [
    { required: true, message: '请选择订单日期' , trigger: ['blur','change'] }
  ],
  supplierId: [
    { required: true, message: '请选择供应商' , trigger: ['blur','change'] }
  ],
  warehouseId: [
    { required: true, message: '请选择仓库' , trigger: ['blur','change'] }
  ],
})


// ******************************  数据展示  start **************************
/** 格式化金额 - 通过Math.round处理小数点精度(5不进位的BUG) */ 
const formatAmount = (amount) => {
  return amount ? (Math.round(amount * 100) / 100).toFixed(2) : '0.00';
}


// ******************************  数据展示  end ****************************



// **********************  商品 数据模糊查询处理 start ********************
// 商品 - 初始化商品列表
const skuList = ref([])
/** 商品 - 获取列表 */
const getSkuList = () => {
  listSkuByAddOrder().then(response => {
    skuList.value = response.rows || [] ;
  })
}
/** 商品 -  自动补全输入框的返回值 */
const queryProducts = (queryString, cb) => {
  const results = queryString  ? skuList.value.filter(sku =>
      (sku.skuCode && sku.skuCode.toLowerCase().includes(queryString.toLowerCase())) ||
      (sku.skuName && sku.skuName.toLowerCase().includes(queryString.toLowerCase())) ||
      (sku.productCode && sku.productCode.toLowerCase().includes(queryString.toLowerCase()))
    ) : []
    console.log("商品搜索结果：",results)
  cb(results || [])
}

/** 商品 -  选择后调用的赋值操作 */
const handleProductSelect = (sku, index) => {
  // 切换 自动聚焦单元格的编辑状态
  isAutocompleteEdit.value = false;

  const item = form.value.details[index]
  item.skuId = sku.skuId
  item.unitId = sku.unitId
  item.productSkuVo.skuName = sku.skuName
  item.productSkuVo.productCode = sku.productCode
  item.productSkuVo.skuCode = sku.skuCode
  item.productSkuVo.skuValue = sku.skuValue
  item.productSkuVo.skuStock = sku.averageCostBySkuVo?.currentStock || 0
  item.unitVo.unitCode = sku.unitVo?.unitCode || '--'
  
  console.log("选择的结果：",item)
}

/** 如果有更新 清空采购订单信息 */
const handleProductChange = (index) => {
  form.value.details[index].purchaseOrderId = null
  form.value.details[index].purchaseOrderNo = null
}

/** 商品 -  失去焦点后 判断输入框中的内容与列表是否匹配 不匹配说明只修改没有选择操作 所以清空 */ 
const handleProductOnBlur = (index) => {
  // 移除焦点
  currentFocus.value = null;
  isAutocompleteEdit.value = true;
  if(skuList.value.length === 0){
    initializeEmptyDetail(index);
    return;
  }
  
  const matchedSku = skuList.value.find(sku => sku.skuCode === form.value.details[index].productSkuVo.skuCode);
  if(!matchedSku){
    //console.log("提示：输入的商品编码不存在，未选中或未回车确认，清空输入框内容！");
    initializeEmptyDetail(index);
    ElMessage.error('提示：输入的内容不存在，清空输入框内容！');
    return;
  }
  if (matchedSku.productCode !== form.value.details[index].productSkuVo.productCode) {
    //console.log("提示：输入的商品编码与列表不匹配，未选中或回车确认，清空输入框内容！");
    initializeEmptyDetail(index);
    ElMessage.error('提示：没有选择或回车确认，清空输入框内容！');
    return;
  }
};

const initializeEmptyDetail = (index) => {
  form.value.details[index].skuId = ''
  form.value.details[index].productSkuVo = {
    skuCode: '',
    skuValue: '',
    skuName: '',
    productCode: '',
    skuStock: 0,
  }
  form.value.details[index].unitVo = {
    unitId: '',
    unitCode: '',
  }
  form.value.details[index].unitPrice = 0
  form.value.details[index].receivedQuantity = 0
  form.value.details[index].purchaseAmount = 0
  form.value.details[index].discountRate = 0
  form.value.details[index].discountAmount = 0
  form.value.details[index].taxRate = 0
  form.value.details[index].taxAmount = 0
  form.value.details[index].netAmount = 0
  form.value.details[index].quantity = 0
  form.value.details[index].shortageQuantity = 0
  form.value.details[index].batchNo = form.value.batchNo
  form.value.details[index].expireDate  = null
  form.value.details[index].purchaseOrderId = null
  form.value.details[index].purchaseOrderNo = null
}


/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => ({
    detailId: '',
    skuId: '',
    productSkuVo:{
      skuCode: '',
      skuValue: '',
      skuName: '',
      productCode: '',
      skuStock: 0,
    },
    unitVo:{
      unitId: '',
      unitCode: '',
    },
    unitPrice: 0,
    receivedQuantity: 0,
    purchaseAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    netAmount: 0,
    quantity: 0,
    shortageQuantity: 0,
    batchNo: form.value.batchNo,
    expireDate : null,
    purchaseOrderId: null,
    purchaseOrderNo: null,
    
  }))
  // 将新记录数组添加到现有数组中
  form.value.details.push(...newItems) 
}

/** 移除商品行 */ 
const removeItem = (index) => {
  form.value.details.splice(index, 1)
}
// **********************  商品 数据模糊查询处理 end ********************


// ***************************  计算逻辑 start *******************************
/** 订单计算 */
const calculateRowAmount = (index) => {
  const item = form.value.details[index]
  item.purchaseAmount = item.unitPrice * item.receivedQuantity
  item.discountAmount = item.purchaseAmount * item.discountRate * 0.01
  item.taxAmount = (item.purchaseAmount - item.discountAmount) * item.taxRate * 0.01
  item.netAmount = item.purchaseAmount - item.discountAmount + item.taxAmount
  
  // 合计总数量
  form.value.totalQuantity = form.value.details.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
  // 合计 采购金额
  form.value.totalPurchaseAmount = form.value.details.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
  // 合计 折扣额
  form.value.totalDiscountAmount = form.value.details.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  // 合计 税额
  form.value.totalTaxAmount = form.value.details.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
  // 合计 实际采购总金额
  form.value.totalNetAmount = form.value.details.reduce((sum, item) => sum + (item.netAmount || 0), 0)
}

// ***************************  计算逻辑 end *******************************


// **************************    操作  start ********************************

// 继续编辑订单
const handleEdit = () => {
 openApprovalDialog('编辑订单', OrderOperateType.EDIT)
 // 获取供应商对应的未核销发票
 getPurchaseInvoiceList(form.value.supplierId)
 
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购入库单编号为"' + form.value.receiptsNo + '"的数据项？').then(function() {
    return delReceipts(form.value.receiptsId);
  }).then(() => {
    ElMessage.success("删除成功");
    goBack();
  }).catch((e) => {
    ElMessage.error("删除失败：",e);
  });
}

/** 保存订单 */ 
const handleSave = () => {
  // 与校验表单提交校验一致，此处只做提交之前的预校验 */
  proxy.$refs["receiptsRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.details = form.value.details.filter(item => item.skuId)
    if(form.value.details.length === 0){
      ElMessage.error("您还没有输入商品明细!")
      return;
    }
    // 2 检查是否存在相同的(skuId+unitPrice)  true存在相同的skuId
    if (checkHaveSameSkuIdAndPrice(form.value.details)) {
      return;
    }
    // 3 检查条目的输入项 false不通过
    if (!validateItems(form.value.details)) {
      return;
    }

    // 4 提交表单
    openApprovalDialog('保存订单', OrderOperateType.SAVE)
  })
  
}
/** 检查采购条目的必输项 */
const validateItems = (submitItems) => {
  for (const item of submitItems) {
    if(item.receivedQuantity == null ){
      ElMessage.error("采购明细 数量不能为空!");
      return false;
    }
    if (item.unitPrice == null) {
      ElMessage.error("采购明细 采购单价不能为空!");
      return false;
    }
    if (item.receivedQuantity <= 0) {
      ElMessage.error("采购明细 数量必须大于 0 !");
      return false;
    }
    if (item.unitPrice < 0) {
      ElMessage.error("采购明细 采购单价必须大于等于 0 !");
      return false;
    }
  }
  return true;
};

/** 检查采购条目是否有相同的skuId+unitPrice */
const checkHaveSameSkuIdAndPrice = (submitItems) => {
  const skuChecker = new Set();

  for (const item of submitItems) {
    // 检查 skuId+unitPrice 重复
      let skuKey = item.skuId.toString() + item.unitPrice.toString()
      if (skuChecker.has(skuKey)) {
        ElMessage.error("的商品明细 sku: "  + item.skuCode + " 重复，请检查！");
        return true;
      }
      skuChecker.add(skuKey);
  }
  return false;
}

/** 提交 入库申请 */ 
const handleSubmitForReceive = () => {
  openApprovalDialog('提交入库申请', OrderOperateType.SUBMIT)
}

/** 驳回 */ 
const handleReject = () => {
  openApprovalDialog('驳回入库申请', OrderOperateType.REJECT)
}

/** 确认入库 */ 
const handleReceived = () => {
  openApprovalDialog('确认入库', OrderOperateType.RECEIVED)
}

/** 反入库 */ 
const handleUnReceived = () => {
   openApprovalDialog('反入库', OrderOperateType.UN_RECEIVED)
}

/** 生成发票 */ 
const handleBindInvoiced = () => {
  // 提出提示框，请输入发票号
  getPurchaseInvoiceList()
  openApprovalDialog('绑定发票', OrderOperateType.BIND_INVOICED)
}

/** 反生成发票 */ 
const handleUnBindInvoiced = () => {
  openApprovalDialog('解绑发票', OrderOperateType.UN_BIND_INVOICED)
}


/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 导出 */
const handleExport = () => {
  console.log("************* 点击导出 ")
}



// **************************    操作  end ********************************

// ************************** 审核记录 + 提示弹窗 start ******************

const dialogVisible = ref(false)  // 提交弹窗状态
const dialogTitle = ref('')       // 提交弹窗标题
const currentAction = ref('')     // 当前操作类型

/** 提交弹窗参数 */ 
const approvalForm = ref({
  remark: ''
})

/** 打开提交操作的弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}

/** 添加采购订单操作记录 */ 
// 订单操作记录
const orderOperateLog = ref([])
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue: actionValue || ''
  }
  console.log("*********** 添加操作记录 ", newLog)
  // 查找是否存在相同 operator 的记录
  const existingIndex = orderOperateLog.value.findIndex(
    log => log.action === action
  )
  if (existingIndex !== -1) {
    // 如果存在，先删除原有记录
    orderOperateLog.value.splice(existingIndex, 1)
  }
  
  // 添加新记录（无论是否存在都会添加到最后）
  orderOperateLog.value.push(newLog)
}

/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = orderOperateLog.value
  
}

 /** 提交数据预处理 */ 
const prepareData = () => {
  if(orderOperateLog.value){
    form.value.operateLog = JSON.stringify(orderOperateLog.value);
  }
  
};

/** 提交数据错误处理函数 */ 
const handleError = (message = "操作失败") => {
  // 恢复 skuValue operateLog 的Json格式
  parseJson();
  ElMessage.error(message);
  // 关闭对话框和加载状态
  dialogVisible.value = false;
  RefreshTab()
};

/** 采购订单提交操作 */ 
const actionRequiresRemark = [ OrderOperateType.REJECT, OrderOperateType.RECEIVED, OrderOperateType.UN_RECEIVED, OrderOperateType.BIND_INVOICED, OrderOperateType.UN_BIND_INVOICED];
const actionRequiresNoRemark = [ OrderOperateType.EDIT, OrderOperateType.SAVE, OrderOperateType.DELETE, OrderOperateType.SUBMIT];
const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark ) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }
  if (actionRequiresRemark.includes(currentAction.value)  &&  !form.value.invoiceId && currentAction.value == OrderOperateType.BIND_INVOICED) {
    ElMessage.warning(`请选择发票号！`);
    return;
  }

  // 3 定义动作及相应状态
  const actions = {
    [OrderOperateType.SAVE]: {
      status: OrderStatusEnum.SAVE,
      message: '保存成功',
      actionValue: OrderOperateType.SAVE
    },
    [OrderOperateType.EDIT]: {
      status: OrderStatusEnum.EDIT,
      message: '开始编辑',
      actionValue: OrderOperateType.EDIT
    },
    [OrderOperateType.SUBMIT]: {
      status: OrderStatusEnum.WAIT_FOR_RECEIVED,
      message: '提交入库申请!',
      actionValue: OrderOperateType.SUBMIT
    },
    [OrderOperateType.REJECT]: {
      status: OrderStatusEnum.SAVE,
      message: '驳回入库申请!',
      actionValue: OrderOperateType.REJECT
    },
    [OrderOperateType.RECEIVED]: {
      status: OrderStatusEnum.RECEIVED,
      message: '入库成功 成功!',
      actionValue: OrderOperateType.RECEIVED
    },
    [OrderOperateType.BIND_INVOICED]: {
      status: OrderStatusEnum.BIND_INVOICED,
      message: '已绑定发票!',
      actionValue: OrderOperateType.BIND_INVOICED
    },
    [OrderOperateType.UN_RECEIVED]: {
      status: OrderStatusEnum.SAVE,
      message: '反入库 成功!',
      actionValue: OrderOperateType.UN_RECEIVED
    },
    [OrderOperateType.UN_BIND_INVOICED]: {
      status: OrderStatusEnum.RECEIVED,
      message: '解绑发票成功!',
      actionValue: OrderOperateType.UN_BIND_INVOICED
    },
  }

  const currentActionConfig = actions[currentAction.value]
  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.receiptsStatus = currentActionConfig.status;
  form.value.operateType = currentActionConfig.actionValue;

  try {
    // 1 数据预处理 转json格式
    prepareData();

    // 4 后端 API调用
    if (currentAction.value === OrderOperateType.SAVE) {
      form.value.showPurchaseNo = showPurchaseNo.value
      if (form.value.receiptsId == null) {
        // 新增操作
        await addReceipts(form.value)
          .then( (res) => {
            form.value.receiptsId = res.data.receiptsId
            form.value.receiptsNo = res.data.receiptsNo
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("新增 入库单 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.EDIT
          } );
      } else {
        // 修改操作
        await updateReceipts(form.value)
          // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("修改 入库单 操作失败")
            form.value.receiptsStatus = OrderStatusEnum.EDIT
          });
      }
    } else if (currentAction.value === OrderOperateType.EDIT) {
      // 编辑操作
      await updateReceiptsStatus(form.value)
        // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("编辑 入库单 操作失败")
            form.value.receiptsStatus = OrderStatusEnum.SAVE
          });
    }else if (currentAction.value === OrderOperateType.SUBMIT) {
      // 提交入库申请
      await updateReceiptsStatus(form.value)
        // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("提交入库申请 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.SAVE
          });
    }else if (currentAction.value === OrderOperateType.REJECT) {
      // 驳回入库申请
      await updateReceiptsStatus(form.value)
        // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("驳回入库申请 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.SAVE
          });
    }else if (currentAction.value === OrderOperateType.RECEIVED) {
      // 入库操作
      await received(form.value)
        // 修改状态更新操作日志
          .then( (res) => {
            if (res.code === 500) {
              handleError("入库 操作失败")
            }
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("入库 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.WAIT_FOR_RECEIVED
          });
    } else if (currentAction.value === OrderOperateType.UN_RECEIVED) {
      // 反入库操作
      await unReceived(form.value)
        // 修改状态更新操作日志 
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("反入库 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.RECEIVED
          });
    }else if (currentAction.value === OrderOperateType.BIND_INVOICED) {
      // 绑定发票操作
      await bindInvoiced(form.value)
        // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("绑定发票 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.WAIT_FOR_BIND_INVOICED
          });
    } else if (currentAction.value === OrderOperateType.UN_BIND_INVOICED) {
      // 解绑发票操作
      await unBindInvoiced(form.value)
        // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => {
            handleError("解绑发票 操作失败");
            form.value.receiptsStatus = OrderStatusEnum.BIND_INVOICED
          });
    }
  } catch (error) {
    console.log("API 调用异常: ", error);
    handleError("API 调用异常，请重试")
  } finally {
    // 关闭对话框和加载状态
    dialogVisible.value = false;
  }   
}

// 当前要关闭的 tabs
const view = {
  path: route.path,
  name: route.name,
  meta: route.meta,
};

/** 返回上一页 */
const goBack = () => {
  // 关闭当前 tab
  proxy.$tab.closePage(view).then(() => {
    // 跳转页面
    router.push({path: "/purchaseManage/receipts",});
  })
  
};

const RefreshTab = () => {
  // 刷新当前页
  //proxy.$tab.refreshPage(view)
  getInfoById()
}

/** 通过修改传递的 orderId 获取商品信息 */
const getInfoById = () => {
  // 获取修改传递的参数
  const _receiptsId = route.query.receiptsId;

  if (_receiptsId) {
    getReceipts(_receiptsId).then((response) => {
      form.value = response.data;
      // 还原数据
      if (form.value.operateLog) {
        orderOperateLog.value = JSON.parse(form.value.operateLog);
        form.value.operateLog = JSON.parse(form.value.operateLog);
      }
      // 是否引用采购单
      showPurchaseNo.value = form.value.showPurchaseNo
      // 获取供应商未核销的采购发票
      getPurchaseInvoiceList(form.value.supplierId)

      console.log("初始化数据正常：",form.value);
      
    });
  }
}

onMounted(() => {
  addItem()
});

// ************************** 审核记录 + 提示弹窗 end ******************

getInfoById()
getSkuList()
getSuppliers()

</script>

<style scoped lang="scss">
.purchase-order {
  margin: 0px 10px 0px 10px;
}

/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    h2 {
      margin: 0;
    }
  }
  .actions {
    display: flex;
    gap: 10px;
  }
}

.supplier-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 金额合计
.total-net-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.operation-card{
  margin: 0px 10px 0px 10px;
  .remark {
    color: #909399;
    font-size: 13px;
    margin: 4px 0 0;
  }
}


// 解决虚拟表格 触屏滚动的问题 - 方案一 控制内部滚动条
:deep(.el-table-v2__body) > div.is-touch {
  overflow: auto !important;
}

:deep(.custom-table){
  content-visibility: auto;
}
</style>