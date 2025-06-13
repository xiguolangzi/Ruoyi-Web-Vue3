<template>
  <el-dialog v-model="dialogVisible" title="退货处理" width="90%" :before-close="handleClose" class="return-dialog"
    ref="refundTable">
    <template #header>
      <div class="header-container">
        <div class="title">
          <h2>退货订单</h2>
          <dict-tag :options="sales_order_type" :value="orderData.orderType" />
          <dict-tag :options="sales_order_pay_status" :value="orderData.orderPayStatus" />
          <dict-tag :options="sales_order_status" :value="orderData.orderStatus" />
        </div>
        <div class="actions">
          <el-button-group class="ml-4">
            <el-button type="primary" @click="completePayment" :loading="submitting"
              v-if="orderData.orderStatus != OrderStatusEnum.CONFIRM">
              完成付款
            </el-button>
            <el-button type="warning" @click="handlePrintTicket">打印单据</el-button>
            <el-button type="danger" @click="handleClose">取消</el-button>
          </el-button-group>

        </div>
      </div>
    </template>

    <el-card shadow="hover">
      <!-- 退货订单信息展示 -->
      <div v-if="orderData.orderInitNo">
        <el-descriptions border :column="4" size="small">
          <el-descriptions-item label="退货初始单号">{{ orderData.orderInitNo }}</el-descriptions-item>
          <el-descriptions-item label="客户" :width="100">{{ orderData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="业务员" :width="100">{{ orderData.salesmanName }}</el-descriptions-item>
          <el-descriptions-item label="佣金点数" :width="100">{{ orderData.baseCommissionRate }}</el-descriptions-item>
          <el-descriptions-item label="当前CAJA" :width="100">{{ orderData.cajaName }}</el-descriptions-item>
          <el-descriptions-item label="当前收银" :width="100">{{ orderData.shiftUserName }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">{{ orderData.orderPayStatus }}</el-descriptions-item>
          <el-descriptions-item label="当前交班编号" :width="100">{{ orderData.shiftNo }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>



    <!-- 分割线 -->
    <el-divider content-position="left">退货明细</el-divider>

    <el-card shadow="hover">
      <!-- 退货订单明细 -->
      <el-table ref="tableRef" :data="orderData.salesOrderDetailList" :stripe="true" size="small" border
        style="width: 100%; height: 100%; margin-bottom: 20px;">
        <el-table-column type="index" label="序号" align="center" width="50" />
        <el-table-column label="SKU 条码" prop="skuCode" align="center" width="150" show-overflow-tooltip />
        <el-table-column prop="skuName" label="商品名称" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="skuValue" align="center" label="规格属性" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="getSkuValue(scope.row.skuValue) === 'default'">
              -- <!-- 直接显示默认 SKU -->
            </div>
            <div v-else v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
              <strong>{{ item[0] }}:</strong>
              <span>{{ item[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="unitCode" align="center" label="单位" width="55" />
        <el-table-column prop="detailPrice" align="center" label="单价" />
        <el-table-column prop="detailQuantity" align="center" label="数量" />
        <el-table-column prop="detailDiscountRate" align="center" label="折扣" />
        <el-table-column prop="detailSalesAmount" align="center" label="金额" />
        <el-table-column prop="detailTaxRate" align="center" label="税率" width="50" />
        <el-table-column prop="detailNetAmount" label="总金额" align="center" width="70">
          <template #default="scope">
            <span> {{ formatTwo(scope.row.detailNetAmount) }} €</span>
          </template>
        </el-table-column>
        <el-table-column prop="detailSn" align="left" header-align="center" label="机器码" show-overflow-tooltip />
        <el-table-column prop="promotionName" align="left" header-align="center" label="促销活动" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.promotionName ?? '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isGift" align="center" label="赠品" width="60">
          <template #default="scope">
            <span :style="{ color: scope.row.isGift == 1 ? 'red' : '' }">{{ scope.row.isGift == 1 ? "是" : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="skuType" align="center" label="商品类型">
          <template #default="scope">
            <dict-tag :options="erp_product_sku_type" :value="scope.row.skuType" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 操作按钮 -->
    <template #footer>
      <el-card style="margin: 0px; padding: 0px;" shadow="hover">
        <!-- 统计 -->
        <el-row class="footer-row">
          <!-- 第1个区域：订单配置数据 -->
          <el-col class="footer-col" :span="5">
            <div class="footer-content">
              <el-descriptions :column="1" size="small">
                <el-descriptions-item label="客户名称:">
                  <span class="highlight-text">{{ orderData.customerName || '--' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="税号:">
                  <span class="highlight-text">{{ orderData.invoiceNif || '--' }}</span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <dict-tag :options="invoice_regimen" :value="orderData.customerRegimen" />
                    <dict-tag :options="invoice_calificacion" :value="orderData.customerCalificacion" />
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="公司名称:">
                  <span class="highlight-text">{{ orderData.customerNombre || '--' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="手机:">
                  <span class="highlight-text">{{ orderData.invoicePhone || '--' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="地址:">
                  <span class="highlight-text">{{ orderData.invoiceAddressCountry + ' ' +
                    orderData.invoiceAddressProvince
                    + ' '
                    + orderData.invoicePostcode + ' ' + orderData.invoiceAddressDetail }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>

          <!-- 分割线 -->
          <div class="divider vertical"></div>

          <!-- 第2个区域：税率明细 -->
          <el-col class="footer-col" :span="8">
            <div class="footer-content">
              <el-table class="table-container" :data="orderData.verifacInvoice?.verifacInvoiceDetailList" size="small"
                style="margin-bottom: 20px;">
                <el-table-column prop="detailBase" label="Base" sortable align="center" min-width="80">
                  <template #default="scope">
                    <span>{{ formatTwo(scope.row.detailBase) + ' €' }} </span>
                  </template>
                </el-table-column>
                <el-table-column prop="detailTipoIva" label="IVA%" align="center" min-width="50">
                  <template #default="scope">
                    <span>{{ (scope.row.detailTipoIva || 0) + ' %' }} </span>
                  </template>
                </el-table-column>
                <el-table-column prop="detailCuotaIva" label="IVA" align="center" min-width="80">
                  <template #default="scope">
                    <span>{{ formatTwo(scope.row.detailCuotaIva) + ' €' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="detailTipoRe" label="RE%" align="center" min-width="50">
                  <template #default="scope">
                    <span>{{ (scope.row.detailTipoRe || 0) + ' %' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="detailCuotaRe" label="RE" align="center" min-width="80">
                  <template #default="scope">
                    <span>{{ formatTwo(scope.row.detailCuotaRe) + ' €' }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <el-switch v-model="orderData.inTax" :active-value="orderInTaxEnum.IN_Tax"
                :inactive-value="orderInTaxEnum.NOT_IN_TAX" active-text="含税" inactive-text="不含税" inline-prompt
                :disabled="canEditStatus"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; margin: 0px;padding: 0px;"
                v-hasPermi="['sales:salesCaja:edit']" size="small" />
            </div>
          </el-col>

          <!-- 分割线 -->
          <div class="divider vertical"></div>

          <!-- 第3个区域：订单统计数据 -->
          <el-col class="footer-col" :span="6">
            <div class="footer-content">
              <el-descriptions :column="2" size="small" style="margin-top: 10px;">
                <el-descriptions-item label="销售金额:">
                  <span class="highlight-text">{{ formatTwo(orderData.totalAmount) + ' €' }} </span>
                </el-descriptions-item>
                <el-descriptions-item label="折扣金额:">
                  <span class="highlight-text">{{ formatTwo(orderData.totalDiscountAmount) + ' €' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="活动减免:">
                  <span class="highlight-text">{{ formatTwo(orderData.totalPromotionReduceAmount) + ' €' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="减免数量:">
                  <span class="highlight-text">{{ orderData.totalPromotionReduceQuantity ?? 0 }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="基础金额:" :span="2">
                  <span class="highlight-text">{{ formatTwo(orderData.totalBaseAmount) + ' €' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="基础税金额:">
                  <span class="highlight-text">{{ formatTwo(orderData.totalTaxAmount) + ' €' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="附加税金额:">
                  <span class="highlight-text">{{ formatTwo(orderData.totalReAmount) + ' €' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="应收金额:" :span="2" class-name="total-label"
                  label-class-name="total-content2">
                  <span>{{ formatTwo(orderData.totalNetAmount) + ' €' }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>

          <!-- 分割线 -->
          <div class="divider vertical"></div>
          <!-- 第4个区域：二维码 -->
          <el-col class="footer-col" :span="2">
            <div class="qrcode">
              <a v-if="orderData.verifacInvoice?.invoiceQr" :href="orderData.verifacInvoice.invoiceQr" target="_blank">
                <qrcode-vue :value="orderData.verifacInvoice?.invoiceQr || null" :size="120" level="H" />
              </a>
              <el-empty v-else :image-size="40" style="padding: 0px;margin: 0px;" />
              <dict-tag :options="varifac_invoice_type" :value="orderData.verifacInvoice?.invoiceTipo" />
            </div>
          </el-col>

        </el-row>
      </el-card>

    </template>

    <!-- 收款确认 对话框 -->
    <RefundPaymentDialog ref="paymentDialog" :orderData="orderData" :paymentAutoPrint="props.paymentAutoPrint"
      :canRemainAmount="props.canRemainAmount" @printTicket="handlePrintTicket" @payment="handleCompletePayment"
      :notification-container="refundTable" />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RefundPaymentDialog from '@/components/sales/RefundPaymentDialog.vue';
import { orderInTaxEnum } from '@/views/sales/salesOrder/cashOperationUtil/tenantConfigEnum.js';
import QrcodeVue from 'qrcode.vue';
import {  OrderStatusEnum } from "@/views/sales/salesOrder/cashOperationUtil/cashOperationEnum.js";


const { proxy } = getCurrentInstance();
const { erp_product_sku_type } = proxy.useDict( 'erp_product_sku_type');
const { invoice_regimen, invoice_calificacion, varifac_invoice_type } = proxy.useDict('invoice_regimen', 'invoice_calificacion', 'varifac_invoice_type');
const {  sales_order_direction, sales_order_type, sales_order_status, sales_order_pay_status } = proxy.useDict('sales_order_direction', 'sales_order_type', 'sales_order_status', 'sales_order_pay_status');

const props = defineProps({
  orderData: {
    type: Object,
    required: true,
    default: () => { },
  },
  paymentAutoPrint: {
    type: String,
    default: '0',
  },
  canRemainAmount: {
    type: String,
    default: '1',
  },
  notificationContainer: {
    type: [String, Object],
    default: 'body'
  }
});

const emit = defineEmits(['printTicket','payment'])

/** 完成支付 */
function handleCompletePayment (salesOrderPayment){
  emit('payment', salesOrderPayment)
}

/**
 * 打印小票
 */
const handlePrintTicket = () => {
  // 调用确认接口 - 返回QR
  emit('printTicket')
  // TODO: 打印带有QR的订单信息
  console.log('退款订单界面打印小票')
}

const dialogVisible = ref(false)
const paymentDialog = ref(null);  // 绑定收款组件
const submitting = ref(false)
const refundTable = ref(null)
const canEditStatus = ref(true)

function payment(){
  paymentDialog.value.openPaymentDialog()
}


// 打开对话框
const openDialog = () => {
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
  // 先完成付款业务
  if (props.orderData?.orderStatus != OrderStatusEnum.CONFIRM){
    ElMessageBox.confirm('请先完成付款业务!', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {}).catch(() => {})
  } else {
    ElMessageBox.confirm('确定要取消退货吗? ', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dialogVisible.value = false
    }).catch(() => {
    })
  }
}

function completePayment () { 
  // 确认退货订单
  console.log('完成支付业务:')
  paymentDialog.value.openPaymentDialog()
} 


defineExpose({ openDialog })
</script>

<style scoped lang="scss">

/* 头部样式 */
.header-container {
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

.return-dialog {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.return-dialog :deep(.el-dialog__body) {
  flex: 1;
  overflow-y: auto;
}

/* 分割线样式 */
.divider {
  &.vertical {
    width: 1.5px;
    background: #ebeef5;
    margin: 0 8px;
  }
}


</style>