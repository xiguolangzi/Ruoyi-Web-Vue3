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
            <el-button @click="handleClose" type="danger" >取消收款</el-button>
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
            <el-button 
              type="primary" 
              @click="handlePrintTicket"
              :disabled="isCompletedPayment"
            >
              打印小票
            </el-button>
          </el-button-group>
        </div>
      
      
      <!-- 支付历史 -->
      <el-divider v-if="orderData.salesOrderPaymentList?.length > 0" content-position="left" >
        <span >支付历史</span>
      </el-divider>

        <el-table :data="orderData.salesOrderPaymentList" border size="small" style="width: 100%" 
        show-summary :summary-method="getSummaries" v-if="orderData.salesOrderPaymentList?.length > 0">
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
import { ElMessage, ElNotification } from 'element-plus';
import {PaymentMethodEnum, OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import { Delete } from '@element-plus/icons-vue';
import {completePayment} from '@/api/sales/salesOrder.js';
import {paymentAutoPrintEnum, canRemainAmountEnum} from "./tenantConfigEnum.js"


const { proxy } = getCurrentInstance();
const {sales_order_pay_method} = proxy.useDict("sales_order_pay_method")

const props = defineProps({
  orderData: {
    type: Object,
    required: true,
    default: () => {},
  },
  paymentAutoPrint: {
    type: String,
    default: false,
  },
  canRemainAmount: {
    type: String,
    default: false,
  },
  notificationContainer: {
    type: [String, Object],
    default: 'body'
  }
});

const emit = defineEmits(['paymentComplete'])



// 对话框状态
const paymentDialogVisible = ref(false)

// 支付表单
const paymentForm = ref({
  cashAmount: 0,
  bankAmount: 0,
})
const paymentFormRef = ref(null)

// 计算属性 - 已核销金额
const verifiedAmount = computed(() => {
  return (props.orderData.salesOrderPaymentList || []).reduce((sum, payment) => {
    return sum + (Number(payment.payAmount) || 0 )
  }, 0) + props.orderData.zeroAmount
})

// 当前收款金额
const currentPaymentAmount = computed(() => {
  return (Number(paymentForm.value.cashAmount) || 0) + 
         (Number(paymentForm.value.bankAmount) || 0)
})

// 未核销金额
const remainAmount = computed(() => {
  const total = Number(props.orderData.totalNetAmount) || 0
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
  // 欠款收银配置
  if(props.canRemainAmount == canRemainAmountEnum.OPEN && props.orderData.totalNetAmount > 0){
    return false
  }
  if(remainAmount.value <= 0 && props.orderData.totalNetAmount > 0){
    return false
  }else{
    return true
  }
})


// 打开支付对话框
const openPaymentDialog = () => {
  paymentDialogVisible.value = true
  resetPaymentForm()
}

/**
 * 部分收款处理
 */
const handlePartialPayment = () => {

  // 1 将收款表单数据添加到收款记录
  if (paymentForm.value.cashAmount > 0) {
    props.orderData.salesOrderPaymentList.push(createPaymentRecord(PaymentMethodEnum.CASH, paymentForm.value.cashAmount))
  }
  if (paymentForm.value.bankAmount > 0) {
    props.orderData.salesOrderPaymentList.push(createPaymentRecord(PaymentMethodEnum.BANK, paymentForm.value.bankAmount))
  }
  // 2 重置收款表单
  resetPaymentForm()
  // 3 更新订单统计金额数据
  props.orderData.verifiedAmount = verifiedAmount.value; 
  props.orderData.remainAmount = props.orderData.totalNetAmount - verifiedAmount.value;
  props.orderData.cashAmount = getTotalByType(PaymentMethodEnum.CASH);
  props.orderData.bankAmount = getTotalByType(PaymentMethodEnum.BANK);
  props.orderData.changeAmount = changeAmount.value;
  ElMessage.success('部分收款已记录，请继续收款')
  ElNotification({
    title: 'Success',
    message: '部分收款已记录，请继续收款',
    type: 'success',
    position: 'bottom-right',
    // appendTo 挂载到 全屏组件上
    appendTo: props.notificationContainer
  })
  console.log('部分收款:----订单数据',props.orderData)
}

/**
 * 完成收款处理
 */
const handleCompletedPayment = () => {
  // 1 更新支付记录列表
  if (paymentForm.value.cashAmount > 0) {
    props.orderData.salesOrderPaymentList.push(toRaw(createPaymentRecord(PaymentMethodEnum.CASH, paymentForm.value.cashAmount)))
  }
  if (paymentForm.value.bankAmount > 0) {
    props.orderData.salesOrderPaymentList.push(toRaw(createPaymentRecord(PaymentMethodEnum.BANK, paymentForm.value.bankAmount)))
  }
  // 2 重置收款表单
  resetPaymentForm()
  // 3 更新订单统计金额数据
  props.orderData.verifiedAmount = verifiedAmount.value - changeAmount.value;
  props.orderData.remainAmount = remainAmount.value <= 0 ? 0 : remainAmount.value;
  props.orderData.cashAmount = getTotalByType(PaymentMethodEnum.CASH);
  props.orderData.bankAmount = getTotalByType(PaymentMethodEnum.BANK);
  props.orderData.changeAmount = changeAmount.value;
  if(remainAmount.value <= 0){
    props.orderData.orderPayStatus = OrderPayStatusEnum.PAID;
  } else {
   props.orderData.orderPayStatus = OrderPayStatusEnum.NOT_COMPLETED;
   // 存在未收欠款的订单需要绑定客户
   if(!props.orderData.customerId){
    ElNotification({
      title: 'Error',
      message: "欠款订单需要绑定客户信息！当前订单未绑定客户信息，请检查！",
      type: 'error',
      position: 'bottom-right',
      // appendTo 挂载到 全屏组件上
      appendTo: props.notificationContainer
    })
    return;
   }
  }
  // 4 调用支付接口 -> 更新订单信息、支付信息、库存扣减
  completePayment(props.orderData).then(() => {
    // 是否自动打印
    if (props.paymentAutoPrint == paymentAutoPrintEnum.OPEN) {
      // 打印功能
      handlePrintTicket()
    }
    // 通知父级组件付款完成 -> 初始化订单表单数据
    console.log('付款完成:----订单数据',props.orderData)
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
    orderId: props.orderData.orderId,
    orderInitNo: props.orderData.orderInitNo,
    orderNo: props.orderData.orderNo,
    payMethod: method,
    payAmount: amount,
    payTime: null, // 存储为字符串而非Date对象
    transactionNo: null
  }
}

// 删除行
const handleDeleteRow = (index) => {
  props.orderData.salesOrderPaymentList.splice(index, 1); // 删除指定行
}

// 根据支付方式获取总金额
const getTotalByType = (method) => {
  return (props.orderData.salesOrderPaymentList || [])
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
 * 打印小票
 */
const handlePrintTicket = () => {
  // TODO: 打印小票
  console.log('打印小票',props.orderData)
}

// 计算合计行
const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }
    if (column.property === 'payAmount') {
      // 计算金额合计
      sums[index] = data.reduce((sum, row) => sum + (Number(row.detailSalesAmount) || 0), 0).toFixed(2) + ' €';
    } else {
      // 其他列不合计
      sums[index] = '';
    }
  });

  return sums;
};

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