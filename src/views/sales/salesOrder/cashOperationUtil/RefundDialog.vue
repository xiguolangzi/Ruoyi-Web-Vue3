<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="退货处理" 
    style="margin-top: 100px !important;"
    width="1000px"
    :before-close="handleClose"
    class="return-dialog"
  >
    <!-- 订单查询区域 -->
    <div class="order-search">
      <el-input 
        v-model="orderInitNo" 
        placeholder="扫描原始订单条码" 
        @keyup.enter="fetchOriginalOrder"
        clearable
      >
        <template #append>
          <el-button :icon="Search" @click="fetchOriginalOrder" />
        </template>
      </el-input>
    </div>
    
    <!-- 订单信息展示 -->
    <div v-if="originalOrder" class="order-info">
      <h3>原始订单信息</h3>
      <el-descriptions border :column="4" size="small">
        <el-descriptions-item label="原始订单号">{{ originalOrder.orderInitNo }}</el-descriptions-item>
        <el-descriptions-item label="订单时间">{{ originalOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">{{ originalOrder.orderPayStatus }}</el-descriptions-item>
        <el-descriptions-item label="客户信息">{{ originalOrder.customerId }}</el-descriptions-item>
      </el-descriptions>
    </div>
    
    <!-- 退货商品选择 - 双表格方案 -->
    <div v-if="originalOrder" class="return-goods-container">
      <div class="goods-tables-wrapper">
        <!-- 可退商品表格 -->
        <div class="goods-table-wrapper-left">
          <h4>可退商品</h4>
          <el-table
            ref="availableTable"
            :data="availableGoods"
            height="400"
            style="width: 100%"
            @selection-change="handleAvailableSelection"
            row-key="detailId"
            border
            size="small"
          >
            <el-table-column type="selection" width="30" />
            <el-table-column prop="skuCode" label="商品编码"  show-overflow-tooltip/>
            <el-table-column prop="skuName" label="商品名称" show-overflow-tooltip/>
            <el-table-column prop="detailNetAmount" label="总金额" width="70">
              <template #default="{row}">{{ row.detailPrice }}元</template>
            </el-table-column>
            <el-table-column prop="detailQuantity" label="购买数量"  width="70"/>
            <el-table-column prop="refundedQuantity" label="已退数量"  width="70"/>
            <el-table-column label="可退数量" width="75">
              <template #default="{row}">
                <el-tag type="success">{{ row.availableQuantity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 操作按钮 -->
        <div class="transfer-buttons">
          <el-button 
            type="primary" 
            :icon="ArrowRight" 
            @click="addSelectedToReturn"
            :disabled="availableSelected.length === 0"
            size="small"
          />
          <el-button 
            type="danger" 
            :icon="ArrowLeft" 
            @click="removeSelectedFromReturn"
            :disabled="returnSelected.length === 0"
            size="small"
          />
        </div>
        
        <!-- 已选退货商品表格 -->
        <div class="goods-table-wrapper-right">
          <h4>已选退货商品 ({{ selectedGoods.length }})</h4>
          <el-table
            ref="returnTable"
            :data="selectedGoods"
            height="400"
            style="width: 100%"
            @selection-change="handleReturnSelection"
            row-key="detailId"
            border
            size="small"
          >
            <el-table-column type="selection" width="30" />
            <el-table-column prop="skuCode" label="商品编码" show-overflow-tooltip/>
            <el-table-column prop="skuName" label="商品名称" show-overflow-tooltip/>
            <el-table-column label="退货数量" width="100">
              <template #default="{row}">
                <el-input-number 
                  v-model="returnQuantities[row.detailId]" 
                  :min="1" 
                  :max="row.availableQuantity"
                  size="small"
                  @change="validateReturnQuantity(row)"
                  style="width: 100%;"
                />
              </template>
            </el-table-column>
            <el-table-column label="退货金额" width="70">
              <template #default="{row}">
                {{ (row.detailPrice * returnQuantities[row.detailId]).toFixed(2) }}元
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <!-- 退货汇总 -->
      <div class="return-summary">
        <div class="summary-item">
          <span>退货商品总数:</span>
          <span class="value">{{ totalReturnQuantity }}件</span>
        </div>
        <div class="summary-item">
          <span>退货总金额:</span>
          <span class="value">{{ formatTwo(totalReturnAmount)  + ' €'}}</span>
        </div>
      </div>
    </div>
    
    <!-- 退货原因 -->
    <div v-if="selectedGoods.length > 0" class="return-reason">
      <el-form label-width="100px">
        <el-form-item label="退货原因:">
          <el-select v-model="returnReason" placeholder="请选择退货原因" style="width: 300px">
            <el-option label="商品质量问题" value="QUALITY_ISSUE" />
            <el-option label="商品描述不符" value="DESCRIPTION_MISMATCH" />
            <el-option label="七天无理由退货" value="NO_REASON" />
            <el-option label="其他原因" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明:" v-if="returnReason === 'OTHER'">
          <el-input
            v-model="returnRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的退货原因说明"
            style="width: 80%"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作按钮 -->
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="primary" 
        @click="submitReturn" 
        :disabled="selectedGoods.length <= 0 || !returnReason"
        :loading="submitting"
      >
        提交退货
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, ArrowRight, ArrowLeft, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesOrderByOrderInitNo, returnGoods } from '@/api/sales/salesOrder.js'

const dialogVisible = ref(false)
const orderInitNo = ref('')
const originalOrder = ref(null)
const returnQuantities = ref({})
const returnReason = ref('')
const returnRemark = ref('')
const submitting = ref(false)

// 表格相关引用
const availableTable = ref(null)
const returnTable = ref(null)
const availableSelected = ref([])
const returnSelected = ref([])

// 计算可退商品列表
const availableGoods = computed(() => {
  if (!originalOrder.value) return []
  return originalOrder.value.salesOrderDetailList
    .map(item => ({
      ...item,
      availableQuantity: item.detailQuantity - (item.refundedQuantity || 0)
    }))
    .filter(item => item.availableQuantity > 0)
    .filter(item => !selectedGoods.value.some(selected => selected.detailId === item.detailId))
})

// 已选退货商品列表
const selectedGoods = ref([])

// 计算退货总数量
const totalReturnQuantity = computed(() => {
  return selectedGoods.value.reduce((total, item) => {
    return total + (returnQuantities.value[item.detailId] || 0)
  }, 0)
})

// 计算退货总金额
const totalReturnAmount = computed(() => {
  return selectedGoods.value.reduce((total, item) => {
    return total + (item.detailPrice * (returnQuantities.value[item.detailId] || 0))
  }, 0)
})

// 处理可退商品表格选择变化
const handleAvailableSelection = (selection) => {
  availableSelected.value = selection
}

// 处理退货商品表格选择变化
const handleReturnSelection = (selection) => {
  returnSelected.value = selection
}

// 添加选中商品到退货列表
const addSelectedToReturn = () => {
  availableSelected.value.forEach(item => {
    if (!selectedGoods.value.some(selected => selected.detailId === item.detailId)) {
      selectedGoods.value.push(item)
      returnQuantities.value[item.detailId] = item.availableQuantity
    }
  })
  
  // 清空选择
  availableTable.value.clearSelection()
  availableSelected.value = []
}

// 从退货列表移除选中商品
const removeSelectedFromReturn = () => {
  const idsToRemove = returnSelected.value.map(item => item.detailId)
  selectedGoods.value = selectedGoods.value.filter(
    item => !idsToRemove.includes(item.detailId)
  )
  // 清空选择
  returnTable.value.clearSelection()
  returnSelected.value = []
}

// 移除单个商品
const removeSingleItem = (detailId) => {
  selectedGoods.value = selectedGoods.value.filter(item => item.detailId !== detailId)
}

// 验证退货数量
const validateReturnQuantity = (row) => {
  if (returnQuantities.value[row.detailId] > row.availableQuantity) {
    returnQuantities.value[row.detailId] = row.availableQuantity
    ElMessage.warning(`退货数量不能超过可退数量 ${row.availableQuantity}`)
  }
}

// 获取原始订单
const fetchOriginalOrder = async () => {
  if (!orderInitNo.value) {
    ElMessage.warning('请输入原始订单号')
    return
  }
  
  try {
    const res = await getSalesOrderByOrderInitNo(orderInitNo.value)
    if (res.data) {
      originalOrder.value = res.data
      selectedGoods.value = []
      returnQuantities.value = {}
      returnReason.value = ''
      returnRemark.value = ''
      availableSelected.value = []
      returnSelected.value = []
      ElMessage.success('订单信息加载成功')
    } else {
      ElMessage.error(`原始订单号 "${orderInitNo.value}" 不存在`)
    }
  } catch (error) {
    ElMessage.error('获取订单失败: ' + error.message)
  }
}

// 提交退货
const submitReturn = async () => {
  try {
    submitting.value = true
    
    const returnDetails = selectedGoods.value.map(item => ({
      originalDetailId: item.detailId,
      skuId: item.skuId,
      skuCode: item.skuCode,
      skuName: item.skuName,
      skuType: item.skuType,
      returnQuantity: returnQuantities.value[item.detailId],
      returnPrice: item.detailPrice,
      returnAmount: item.detailPrice * returnQuantities.value[item.detailId],
      isGift: item.skuType === 'GIFT',
      remark: returnReason.value === 'OTHER' ? returnRemark.value : returnReason.value
    }))
    
    const payload = {
      originalOrderId: originalOrder.value.orderId,
      originalOrderNo: originalOrder.value.orderNo,
      returnDetails,
      returnReason: returnReason.value,
      returnRemark: returnReason.value === 'OTHER' ? returnRemark.value : '',
      totalReturnAmount: totalReturnAmount.value,
      totalReturnQuantity: totalReturnQuantity.value
    }
    
    await returnGoods(payload)
    ElMessage.success('退货申请提交成功')
    handleClose()
    // 触发父组件刷新
    emit('return-success')
  } catch (error) {
    ElMessage.error('退货失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true
  orderInitNo.value = ''
  originalOrder.value = null
  selectedGoods.value = []
  returnQuantities.value = {}
  returnReason.value = ''
  returnRemark.value = ''
  availableSelected.value = []
  returnSelected.value = []
}

// 关闭对话框
const handleClose = () => {
  if (selectedGoods.value.length > 0) {
    ElMessageBox.confirm('确定要取消退货吗? 已选择的数据将丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dialogVisible.value = false
      resetForm()
    }).catch(() => {})
  } else {
    dialogVisible.value = false
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  orderInitNo.value = ''
  originalOrder.value = null
  selectedGoods.value = []
  returnQuantities.value = {}
  returnReason.value = ''
  returnRemark.value = ''
  availableSelected.value = []
  returnSelected.value = []
}

const emit = defineEmits(['return-success'])

defineExpose({ openDialog })
</script>

<style scoped>
.order-search {
  margin-bottom: 20px;
}

.order-info {
  margin-bottom: 20px;
}

.return-goods-container {
  margin-bottom: 20px;
}

.goods-tables-wrapper {
  display: flex;
  width: 100%;
  gap: 20px;
  margin-bottom: 20px;
}

.goods-table-wrapper-left {
  width: 50%;
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.goods-table-wrapper-right {
  width: 40%;
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.goods-table-wrapper h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.transfer-buttons {
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.transfer-buttons .el-button {
  margin-left: 0;
}

.return-summary {
  display: flex;
  justify-content: flex-end;
  gap: 30px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.summary-item .value {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
}

.return-reason {
  margin-top: 20px;
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
</style>