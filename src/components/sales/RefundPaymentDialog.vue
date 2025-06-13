<template>
  <el-dialog v-model="paymentDialogVisible" width="600px" :before-close="handleClose"
    style="margin-top: 100px !important;">
    <template #header>
      <div class="header-part">
        <strong style="font-size: 24px; margin-right: 30px;">退款界面</strong>
        <dict-tag :options="sales_order_status" :value="orderData.orderStatus" style="margin-right: 20px;" />
        <dict-tag :options="sales_order_pay_status" :value="orderData.orderPayStatus" />

      </div>
    </template>
    <el-form  label-width="120px" ref="paymentFormRef"
      :disabled="orderData.orderType != OrderTypeEnum.PRE_ORDER">
      <el-row>
        <el-col :span="12">
          <!-- 订单信息展示 -->
          <el-form-item label="应退金额:">
            <span class="amount-display">{{ formatTwo(-orderData.totalNetAmount) + ' €'}}</span>
          </el-form-item>

          <el-form-item label="已退金额:">
            <span class="amount-display">{{ formatTwo(-orderData.verifiedAmount) + ' €'}}</span>
          </el-form-item>

          <el-form-item label="待退金额:">
            <span :class="['amount-display', { 'text-danger': -orderData.remainAmount > 0 }]">
              {{ formatTwo(-orderData.remainAmount) + ' €'}}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <div class="qrcode">
            <a v-if="orderData.verifacInvoice?.invoiceQr" :href="orderData.verifacInvoice.invoiceQr" target="_blank">
              <qrcode-vue :value="orderData.verifacInvoice?.invoiceQr || null" :size="120" level="H" />
            </a>
          </div>
        </el-col>
      </el-row>

      <div class="dialog-footer">
        <el-button-group>

          <el-button type="primary" @click="handlePayment(method.value)" :disabled="isPayment" v-for="method in sales_order_pay_method" :key="method.value">
            {{ method.label }}
          </el-button>
          <el-button type="success" @click="handlePrintTicket"
            :disabled="orderData.orderPayStatus == OrderPayStatusEnum.UN_PAID">
            打印小票
          </el-button>
        </el-button-group>
      </div>


      <!-- 支付历史 -->
      <el-divider v-if="orderData.salesOrderPaymentList?.length > 0" content-position="left">
        <span>支付历史</span>
      </el-divider>

      <el-table :data="orderData.salesOrderPaymentList" border size="small" style="width: 100%"  v-if="orderData.salesOrderPaymentList?.length > 0">
        <el-table-column prop="payMethod" label="退款方式" align="center">
          <template #default="scope">
            <dict-tag :options="sales_order_pay_method" :value="scope.row.payMethod" />
          </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="退款金额" align="right" header-align="center">
          <template #default="scope">
            <span>{{ formatTwo(-scope.row.payAmount) + ' €'}} </span>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="退款时间" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.payTime, '{m}-{d}-{y} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="70">
          <template #default="scope">
            <el-button type="danger" size="small" :icon="Delete" circle @click="handleDeleteRow(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>

    </el-form>


  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import {PaymentMethodEnum, OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import {  OrderTypeEnum } from '@/views/sales/salesOrder/cashOperationUtil/cashOperationEnum.js';
import { Delete } from '@element-plus/icons-vue';
import { now } from 'lodash';
import QrcodeVue from 'qrcode.vue';


const { proxy } = getCurrentInstance();
const { sales_order_pay_method, sales_order_pay_status } = proxy.useDict("sales_order_pay_method", "sales_order_pay_status")
const { sales_order_direction, sales_order_type, sales_order_status} = proxy.useDict( 'sales_order_direction', 'sales_order_type', 'sales_order_status');

const props = defineProps({
  orderData: {
    type: Object,
    required: true,
    default: () => {},
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

const emit = defineEmits(['printTicket', 'payment'])

// 对话框状态
const paymentDialogVisible = ref(false)

// 收款状态 (false 展示，true 隐藏)
const isPayment = computed(() => {
  if(props.orderData.orderPayStatus == OrderPayStatusEnum.PAID){
    return true;
  }
  return false;
})


/**
 * 打印小票
 */
const handlePrintTicket = () => {
  // 调用确认接口 - 返回QR
  emit('printTicket')
  // TODO: 打印带有QR的订单信息
  console.log('支付界面打印小票')
}

/** 付款操作 */
function handlePayment(method){
  if(method == PaymentMethodEnum.CASH){ 
    ElMessage.success('现金付款！')
  }
  if(method == PaymentMethodEnum.BANK){ 
    ElMessage.success('银行付款！')
  }
  if(method == PaymentMethodEnum.CHEQUE){ 
    ElMessage.success('支票付款！')
  }
  if(method == PaymentMethodEnum.VOUCHER){ 
    ElMessage.success('代金券付款！')
  }
  // 添加null检查
  if (!props.orderData.salesOrderPaymentList) {
    props.orderData.salesOrderPaymentList = [];
  }
  const salesOrderPayment =  createPaymentRecord(method, props.orderData.remainAmount)
  // 4 调用支付接口 -> 更新订单信息、支付信息、库存扣减
  emit('payment', salesOrderPayment)
}


/**
 * 创建支付记录
 * @param method 支付方式
 * @param amount 支付金额
 */
const createPaymentRecord = (method, amount) => {
  return {
    paymentId: null,
    paymentNo: null,
    orderId: props.orderData.orderId,
    orderInitNo: props.orderData.orderInitNo,
    orderNo: props.orderData.orderNo,
    payMethod: method,
    payAmount: amount,
    payTime: now(), // 存储为字符串而非Date对象
    transactionNo: null
  }
}

/**
 * 取消收款
 */
const handleClose = () => {
  paymentDialogVisible.value = false
}

// 打开支付对话框
const openPaymentDialog = () => {
  paymentDialogVisible.value = true
}


defineExpose({ openPaymentDialog })
</script>

<style scoped>
.amount-display {
  font-size: 18px;
  font-weight: bold;
}
.text-danger {
  color: #f56c6c;
}
.text-success {
  color: #67c23a;
  font-size: 24px;
}
.tip-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.dialog-footer{
  text-align: center;
  margin-left: 50px;
}

.qrcode{
  display: grid;
  place-items: center; /* 水平和垂直居中 */
  width: 100%;
  height: 100%;
}

.header-part{
  display: flex;
  align-items: center;
}
</style>