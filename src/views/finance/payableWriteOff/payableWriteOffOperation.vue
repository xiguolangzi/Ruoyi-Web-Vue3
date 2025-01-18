<template>
  <div class="ap-writeoff-container">
    <!-- 查询条件 -->
    <el-form :inline="true" :model="queryForm" class="demo-form-inline">
      <el-form-item label="供应商">
        <el-select v-model="queryForm.supplierId" placeholder="请选择供应商">
          <el-option v-for="item in supplierOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 待核销列表 -->
    <div class="list-container">
      <el-row :gutter="20">
        <!-- 应付单列表 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>待核销应付单</span>
              </div>
            </template>
            <el-table
              :data="invoiceList"
              style="width: 100%"
              @selection-change="handleInvoiceSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="invoiceNo" label="应付单号" />
              <el-table-column prop="amount" label="金额" />
              <el-table-column prop="unpaidAmount" label="未核销金额" />
              <el-table-column prop="invoiceDate" label="单据日期" />
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 付款单列表 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>待核销付款单</span>
              </div>
            </template>
            <el-table
              :data="paymentList"
              style="width: 100%"
              @selection-change="handlePaymentSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="paymentNo" label="付款单号" />
              <el-table-column prop="amount" label="金额" />
              <el-table-column prop="unwriteoffAmount" label="未核销金额" />
              <el-table-column prop="paymentDate" label="付款日期" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 核销操作 -->
    <div class="operation-container">
      <el-button type="primary" @click="handleWriteoff" :disabled="!canWriteoff">
        核销
      </el-button>
    </div>

    <!-- 核销弹窗 -->
    <el-dialog v-model="writeoffDialogVisible" title="核销" width="500px">
      <el-form :model="writeoffForm" label-width="120px">
        <el-form-item label="核销金额">
          <el-input-number
            v-model="writeoffForm.writeoffAmount"
            :min="0"
            :max="maxWriteoffAmount"
            :precision="2"
          />
        </el-form-item>
        <el-form-item label="核销日期">
          <el-date-picker
            v-model="writeoffForm.writeoffDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="writeoffDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmWriteoff">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 查询条件
const queryForm = ref({
  supplierId: ''
})

// 供应商选项
const supplierOptions = ref([
  { value: '1', label: '供应商11' },
  { value: '2', label: '供应商22' }
])

// 应付单列表
const invoiceList = ref([])
const selectedInvoice = ref([])

// 付款单列表
const paymentList = ref([])
const selectedPayment = ref([])

// 是否可以核销
const canWriteoff = computed(() => {
  return selectedInvoice.value.length === 1 && selectedPayment.value.length === 1
})

// 最大核销金额
const maxWriteoffAmount = computed(() => {
  if (selectedInvoice.value.length === 0 || selectedPayment.value.length === 0) {
    return 0
  }
  return Math.min(
    selectedInvoice.value[0].unpaidAmount,
    selectedPayment.value[0].unwriteoffAmount
  )
})

// 核销弹窗
const writeoffDialogVisible = ref(false)
const writeoffForm = ref({
  writeoffAmount: 0,
  writeoffDate: new Date()
})

// 查询方法
const handleQuery = async () => {
  // TODO: 调用后端接口查询数据
}

// 选择应付单
const handleInvoiceSelectionChange = (selection) => {
  selectedInvoice.value = selection
}

// 选择付款单
const handlePaymentSelectionChange = (selection) => {
  selectedPayment.value = selection
}

// 点击核销按钮
const handleWriteoff = () => {
  writeoffForm.value.writeoffAmount = maxWriteoffAmount.value
  writeoffDialogVisible.value = true
}

// 确认核销
const confirmWriteoff = async () => {
  try {
    // TODO: 调用后端接口保存核销记录
    writeoffDialogVisible.value = false
    ElMessage.success('核销成功')
  } catch (error) {
    ElMessage.error('核销失败')
  }
}

</script>