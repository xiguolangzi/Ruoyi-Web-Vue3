<template>
  <el-dialog
    v-model="paymentDialogVisible"
    title="收银"
    width="600px"
    :before-close="handleClose"
    style="margin-top: 100px !important;"
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    :show-close="false"
  >
    <el-form :model="paymentForm" label-width="120px" ref="paymentFormRef">
      <!-- 订单信息展示 -->
      <el-form-item label="应收金额:">
        <span class="amount-display">{{ formatTwo(orderData.totalNetAmount)  + ' €'}}</span>
      </el-form-item>
      
      <el-form-item label="已收金额:">
        <span class="amount-display">{{ formatTwo(verifiedAmount)  + ' €'}}</span>
      </el-form-item>
      
      <el-form-item label="待收金额:">
        <span :class="['amount-display', { 'text-danger': remainAmount > 0 }]">
          {{ formatTwo(remainAmount) + ' €'}}
        </span>
      </el-form-item>
      
      <!-- 支付方式输入 -->
      <el-form-item label="现金支付:" prop="cashAmount">
        <el-input-number
          v-model="paymentForm.cashAmount"
          v-focus-select
          :min="0"
          :max="999999"
          :precision="2"
          :step="0"
          :controls="false"
          :value-on-clear="0"
          placeholder="请输入现金金额"
        >
          <template #suffix >€</template>
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="银行支付:" prop="bankAmount">
        <el-input-number
          v-model="paymentForm.bankAmount"
          v-focus-select
          :min="0"
          :max="999999"
          :precision="2"
          :step="0"
          :controls="false"
          :value-on-clear="0"
          placeholder="请输入银行支付金额"
        >
          <template #suffix >€</template>
        </el-input-number>
      </el-form-item>
      
      <el-row>
        <el-col :span="1.5">
          <el-form-item label="优惠抹零:" prop="zeroAmount">
            <el-input-number
              v-model="orderData.zeroAmount"
              v-focus-select
              :min="0"
              :max="5"
              :precision="2"
              :step="0"
              :controls="false"
              :value-on-clear="0"
              placeholder="0-5欧范围内"
            >
              <template #suffix >€</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="1.5">
          <!-- 找零显示 -->
          <el-form-item label="找零金额:" >
            <span class="amount-display text-success">{{ formatTwo(changeAmount)  + ' €'}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <div class="dialog-footer">
          <el-button-group>
            <el-button @click="handleClose" type="danger" :disabled="orderData.salesOrderPaymentList.length > 0">取消收款</el-button>
            <el-button @click="handleContinueUpdateOrder" type="warning">修改订单</el-button>
            <el-button 
              type="primary" 
              @click="handlePartialPayment"
              :disabled="isPartialPayment"
            >
              部分收款
            </el-button>
            <el-button 
              type="primary" 
              @click="handleCompletedPayment"
              :disabled="isCompletedPayment"
            >
              完全收款
            </el-button>
          </el-button-group>
        </div>
      
      
      <!-- 支付历史 -->
      <el-divider v-if="orderData.salesOrderPaymentList?.length > 0" content-position="left" >
        <span >支付历史</span>
      </el-divider>

        <el-table :data="orderData.salesOrderPaymentList" border size="small" style="width: 100%" show-summary v-if="orderData.salesOrderPaymentList?.length > 0">
          <el-table-column prop="payMethod" label="支付方式" align="center" >
            <template #default="scope">
              <dict-tag :options="sales_order_pay_method" :value="scope.row.payMethod"/>
            </template>
          </el-table-column>
          <el-table-column prop="payAmount" label="支付金额" align="right" header-align="center" >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.payAmount) + ' €'}}  </span> 
            </template>
          </el-table-column>
          <el-table-column prop="payTime" label="支付时间" align="center" >
            <template #default="scope">
              <span>{{ parseTime(scope.row.payTime, '{y}-{m}-{d}')  }}</span>
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
import { ElMessage } from 'element-plus';
import {PaymentMethodEnum, initOrderPaymentData, OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import { Delete } from '@element-plus/icons-vue';
import {completePayment} from '@/api/sales/salesOrder.js'


const { proxy } = getCurrentInstance();
const {sales_order_pay_method} = proxy.useDict("sales_order_pay_method")

const emit = defineEmits(['paymentComplete','continueUpdateOrder'])

// 对话框状态
const paymentDialogVisible = ref(false)
// 订单数据
const orderData = ref({
  orderInitNo: null,
  totalNetAmount: 0,
  verifiedAmount: 0,
  remainAmount: 0,
  cashAmount: 0,
  bankAmount: 0,
  zeroAmount: 0,
  changeAmount: 0,
  salesOrderPaymentList: []
})
// 支付表单
const paymentForm = ref({
  cashAmount: 0,
  bankAmount: 0,
})
const paymentFormRef = ref(null)

// 计算属性 - 已核销金额
const verifiedAmount = computed(() => {
  return (orderData.value.salesOrderPaymentList || []).reduce((sum, payment) => {
    return sum + (Number(payment.payAmount) || 0 )
  }, 0) + orderData.value.zeroAmount
})

// 当前收款金额
const currentPaymentAmount = computed(() => {
  return (Number(paymentForm.value.cashAmount) || 0) + 
         (Number(paymentForm.value.bankAmount) || 0)
})

// 未核销金额
const remainAmount = computed(() => {
  const total = Number(orderData.value.totalNetAmount) || 0
  const verified = verifiedAmount.value
  const current = currentPaymentAmount.value
  return total - verified - current
})

// 找零金额
const changeAmount = computed(() => {
  return remainAmount.value < 0 ? Math.abs(remainAmount.value) : 0
})

// 部分收款 - 状态
const isPartialPayment = computed(() => {
  if (remainAmount.value > 0){
    if(paymentForm.value.cashAmount <= 0 && paymentForm.value.bankAmount <= 0){
      return true
    } else{
      return false
    }
  } else {
    return true
  }     
})

// 完成收款 - 状态
const isCompletedPayment = computed(() => {
  if(remainAmount.value <= 0){
    return false
  }else{
    return true
  }
})


// 打开支付对话框
const openPaymentDialog = (order) => {
  orderData.value = {
    ...orderData.value,
    ...order,
    totalNetAmount: order.totalNetAmount || 0,
    verifiedAmount: order.verifiedAmount || 0,
    remainAmount: order.remainAmount || 0,
    cashAmount: order.cashAmount || 0,
    bankAmount: order.bankAmount || 0,
    zeroAmount: order.zeroAmount || 0,
    changeAmount: order.changeAmount || 0,
    salesOrderPaymentList: order.salesOrderPaymentList || []
  }
  paymentDialogVisible.value = true
  resetPaymentForm()
}

/**
 * 部分收款处理
 */
const handlePartialPayment = () => {
  // 创建支付记录
  const payments = []
  
  if (paymentForm.value.cashAmount > 0) {
    payments.push(createPaymentRecord(PaymentMethodEnum.CASH, paymentForm.value.cashAmount))
  }
  
  if (paymentForm.value.bankAmount > 0) {
    payments.push(createPaymentRecord(PaymentMethodEnum.BANK, paymentForm.value.bankAmount))
  }
  
  // 更新支付记录列表
  orderData.value.salesOrderPaymentList = [
    ...orderData.value.salesOrderPaymentList,
    ...payments
  ]


  // 部分支付
  orderData.value.orderPayStatus = OrderPayStatusEnum.NOT_COMPLETED;
  orderData.value.verifiedAmount = verifiedAmount.value; 
  orderData.value.remainAmount = orderData.value.totalNetAmount - verifiedAmount.value;
  orderData.value.cashAmount = getTotalByType(PaymentMethodEnum.CASH);
  orderData.value.bankAmount = getTotalByType(PaymentMethodEnum.BANK);
  orderData.value.changeAmount = changeAmount.value;

  resetPaymentForm()
  ElMessage.success('部分收款已记录，请继续收款')
  console.log('部分收款:----订单数据',orderData.value)

}

/**
 * 完成收款处理
 */
const handleCompletedPayment = () => {
  // 1 创建支付记录
  const payments = []
  if (paymentForm.value.cashAmount > 0) {
    payments.push(createPaymentRecord(PaymentMethodEnum.CASH, paymentForm.value.cashAmount))
  }
  if (paymentForm.value.bankAmount > 0) {
    payments.push(createPaymentRecord(PaymentMethodEnum.BANK, paymentForm.value.bankAmount))
  }
  // 2 更新支付记录列表
  orderData.value.salesOrderPaymentList = [
    ...orderData.value.salesOrderPaymentList,
    ...payments
  ]
  // 3 如果已支付完成
  orderData.value.orderPayStatus = OrderPayStatusEnum.PAID;
  orderData.value.verifiedAmount = orderData.value.totalNetAmount;
  orderData.value.remainAmount = 0;
  orderData.value.cashAmount = getTotalByType(PaymentMethodEnum.CASH);
  orderData.value.bankAmount = getTotalByType(PaymentMethodEnum.BANK);
  orderData.value.changeAmount = changeAmount.value;
  

  // TODO:调用支付接口 -> 更新订单信息、支付信息、库存扣减
  completePayment(orderData.value).then(() => {
    // TODO:通知父级组件付款完成 -> 初始化订单表单数据
    console.log('付款完成:----订单数据',orderData.value)
    emit('paymentComplete')
    handleClose()
  }).catch(error => {
    resetPaymentForm()
    ElMessage.error(error.message);
  });

  
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
    orderId: orderData.value.orderId,
    orderInitNo: orderData.value.orderInitNo,
    orderNo: orderData.value.orderNo,
    payMethod: method,
    payAmount: amount,
    payTime: new Date(),
    transactionNo: null
  }
}

//
const handleDeleteRow = (index) => {
  orderData.value.salesOrderPaymentList.splice(index, 1); // 删除指定行
}


// 根据支付方式获取总金额
const getTotalByType = (method) => {
  return (orderData.value.salesOrderPaymentList || [])
    .filter(p => p.payMethod == method)
    .reduce((sum, p) => sum + (Number(p.payAmount) || 0), 0)
}


// 重置表单
const resetPaymentForm = () => {
  paymentForm.value = {
    cashAmount: 0,
    bankAmount: 0,
  }
}

/**
 * 取消收款
 */
const handleClose = () => {
  paymentDialogVisible.value = false
  resetPaymentForm()
}

/**
 * 继续修改订单
 */
const handleContinueUpdateOrder = () => {
  // TODO: 通知父级组件继续修改订单
  emit('continueUpdateOrder', orderData.value)
  handleClose()
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
</style>