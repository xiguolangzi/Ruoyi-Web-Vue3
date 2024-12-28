<template>
  <div class="ap-verification">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="font-bold">应付核销</span>
        </div>
      </template>
      
      <!-- 供应商选择 -->
      <el-form :model="queryForm" label-width="100px" class="mb-4">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="供应商">
              <el-select v-model="queryForm.supplierId" clearable placeholder="请选择供应商" class="w-full">
                <el-option label="供应商A" value="1" />
                <el-option label="供应商B" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单据日期">
              <el-date-picker 
                v-model="queryForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </el-form>

      <!-- 待核销应付单据列表 -->
      <div class="mb-4">
        <div class="font-bold mb-2">待核销应付单据</div>
        <el-table :data="invoiceList" height="250" @selection-change="handleInvoiceSelect">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="invoiceNo" label="应付单号" />
          <el-table-column prop="invoiceDate" label="单据日期" />
          <el-table-column prop="amount" label="应付金额" />
          <el-table-column prop="verifiedAmount" label="已核销金额" />
          <el-table-column prop="remainAmount" label="未核销金额" />
        </el-table>
      </div>

      <!-- 待核销付款单据列表 -->
      <div class="mb-4">
        <div class="font-bold mb-2">付款单据</div>
        <el-table :data="paymentList" height="250" @selection-change="handlePaymentSelect">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="paymentNo" label="付款单号" />
          <el-table-column prop="paymentDate" label="付款日期" />
          <el-table-column prop="amount" label="付款金额" />
          <el-table-column prop="verifiedAmount" label="已核销金额" />
          <el-table-column prop="remainAmount" label="未核销金额" />
        </el-table>
      </div>

      <!-- 核销明细 -->
      <div class="mb-4">
        <div class="font-bold mb-2">核销明细</div>
        <el-table :data="verificationList" height="200">
          <el-table-column prop="invoiceNo" label="应付单号" />
          <el-table-column prop="paymentNo" label="付款单号" />
          <el-table-column prop="verifyAmount" label="核销金额">
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.verifyAmount" 
                :min="0" 
                :max="scope.row.maxAmount"
                :precision="2"
                @change="handleAmountChange(scope.$index)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" link @click="removeVerification(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 汇总信息 -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <span class="mr-4">应付总额：{{ totalInvoiceAmount }}</span>
          <span class="mr-4">付款总额：{{ totalPaymentAmount }}</span>
          <span>本次核销总额：{{ totalVerificationAmount }}</span>
        </div>
        <div>
          <el-button type="primary" @click="handleSave">保存核销</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 查询条件
const queryForm = ref({
  supplierId: '',
  dateRange: []
})

// 数据列表
const invoiceList = ref([])
const paymentList = ref([])
const verificationList = ref([])

// 选中的数据
const selectedInvoices = ref([])
const selectedPayments = ref([])

// 查询方法
const handleQuery = () => {
  // TODO: 调用后端API获取数据
}

const resetQuery = () => {
  queryForm.value = {
    supplierId: '',
    dateRange: []
  }
}

// 选择事件处理
const handleInvoiceSelect = (selection) => {
  selectedInvoices.value = selection
  updateVerificationList()
}

const handlePaymentSelect = (selection) => {
  selectedPayments.value = selection
  updateVerificationList()
}

// 更新核销明细
const updateVerificationList = () => {
  verificationList.value = []
  selectedInvoices.value.forEach(invoice => {
    selectedPayments.value.forEach(payment => {
      verificationList.value.push({
        invoiceNo: invoice.invoiceNo,
        paymentNo: payment.paymentNo,
        verifyAmount: 0,
        maxAmount: Math.min(invoice.remainAmount, payment.remainAmount)
      })
    })
  })
}

// 金额变更处理
const handleAmountChange = (index) => {
  const item = verificationList.value[index]
  if (item.verifyAmount > item.maxAmount) {
    item.verifyAmount = item.maxAmount
    ElMessage.warning('核销金额不能超过可核销金额')
  }
}

// 删除核销明细
const removeVerification = (index) => {
  verificationList.value.splice(index, 1)
}

// 计算汇总金额
const totalInvoiceAmount = computed(() => {
  return selectedInvoices.value.reduce((sum, item) => sum + item.remainAmount, 0)
})

const totalPaymentAmount = computed(() => {
  return selectedPayments.value.reduce((sum, item) => sum + item.remainAmount, 0)
})

const totalVerificationAmount = computed(() => {
  return verificationList.value.reduce((sum, item) => sum + (item.verifyAmount || 0), 0)
})

// 保存核销
const handleSave = async () => {
  if (verificationList.value.length === 0) {
    ElMessage.warning('请选择需要核销的单据')
    return
  }
  
  if (totalVerificationAmount.value === 0) {
    ElMessage.warning('请输入核销金额')
    return
  }

  try {
    // TODO: 调用后端API保存核销数据
    ElMessage.success('核销成功')
  } catch (error) {
    ElMessage.error('核销失败')
  }
}
</script>
