<template>
  <el-dialog v-model="comboDialogVisible" title="套餐确认:" width="700" style="margin-top: 150px !important;"
    :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false"
    @keyup.enter.prevent="handleAddDetailConfirmCombo" ref="comboDialogRef">

    <!-- 套餐明细 -->
    <el-card v-for="(item, index) in currentCombo.productComboItemList" :key="index" class="mb-4" shadow="always"
      :header="`${item.itemName} : ${getItemTypeText(item)}`" style="margin-bottom: 10px;">

      <el-table :data="item.productComboItemDetailList" border style="width: 100%" :ref="(el) => setTableRef(el, index)"
        @selection-change="(selection) => handleSelectionChange(selection, item)">
        <el-table-column type="selection" :selectable="(row) => selectable(row, item)" width="55" />
        <el-table-column label="SKU 条码" prop="skuCode" align="center" min-width="120px" />
        <el-table-column label="SKU 名称" align="center" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.skuName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU 规格" align="center" show-overflow-tooltip>
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
        <el-table-column label="单价" prop="detailPrice" align="center" min-width="70px" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ formatTwo(scope.row.detailPrice) }} € </span>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" align="center" min-width="120">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :disabled="item.isOptional == ComboItemIsOptionalEnum.NoOptional || item.setType == ComboItemSetTypeEnum.maxOption" 
            v-focusSelect size="small" style="width: 100%;" 
            @change="() => handleQuantityChange(item,scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="detailAmount" align="center">
          <template #default="scope">
            <span>{{ formatTwo(scope.row.detailAmount) }} € </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 提示信息 -->
      <div v-if="item.isOptional == ComboItemIsOptionalEnum.Optional" class="optional-tip">
        <template v-if="item.setType == ComboItemSetTypeEnum.maxOption">
          可选数量: {{ getSelectedCount(item) }}/{{ item.isOptionalQuantity }}
        </template>
        <template v-else-if="item.setType == ComboItemSetTypeEnum.maxQuantity">
          已选总数量: {{ getTotalSelectedQuantity(item) }}/{{ item.maxQuantity }}
        </template>
      </div>
    </el-card>

    <template #footer>
      <el-button @click="handleCancelConfirmCombo">取消</el-button>
      <el-button type="primary" @click="handleAddDetailConfirmCombo">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { getProductCombo } from "@/api/product/productCombo";
import { ComboItemIsOptionalEnum, ComboItemSetTypeEnum } from "@/views/product/productCombo/productComboEnum.js"
import { ElNotification } from 'element-plus';


const props = defineProps({
  notificationContainer: {
    type: [String, Object],
    default: 'body'
  }
})

const emit = defineEmits(['addComboDetails'])

// 状态管理
const comboDialogVisible = ref(false)                     // 控制弹窗显示
const selectedDetails = ref({})                           // 存储选中的明细
const currentCombo = ref({ productComboItemList: [] })    // 套餐数据
const orderDetail = ref(null)                             // 订单明细
const isInComboConfirm = ref(false)                       // 控制回车事件
const productComboItemDetailList = ref([])                // 添加表格引用数组
const tableRefs = ref([])                                 // 改用对象存储表格引用
const comboDialogRef = ref(null)

// 设置表格引用
const setTableRef = (el, index) => {
  if (el) {
    tableRefs.value[index] = el
  }
}

// 9. 重置状态
const resetState = () => {
  comboDialogVisible.value = false
  selectedDetails.value = {}
  isInComboConfirm.value = false
  tableRefs.value = []
}
// 1 获取套餐项类型文本
const getItemTypeText = (item) => {
  if (item.isOptional == ComboItemIsOptionalEnum.NoOptional){
    return '固定项'
  }
  if(item.isOptional == ComboItemIsOptionalEnum.Optional){
    if (item.setType == ComboItemSetTypeEnum.maxOption) {
      return '可选项(最大选项：' + item.isOptionalQuantity + ' 项)'
    }
    if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
      return '可选项(最多数量：' + item.maxQuantity + ' 个)'
    }
  }
  return '';
}

// 2 控制行是否可选
const selectable = (row, item) => {
  // 固定项默认全部可选
  if (item.isOptional == ComboItemIsOptionalEnum.NoOptional) return false

  // 可选项逻辑：
  if (item.setType == ComboItemSetTypeEnum.maxOption) {
    // 最大选项模式
    const selected = selectedDetails.value[item.itemId] || []
    const isSelected = selected.some(selectedRow => selectedRow.skuId === row.skuId)
    return isSelected || selected.length < item.isOptionalQuantity
  } else if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
    // 最大数量模式 - 所有行都可选，数量可以调整
    return true
  }
  
  return true
}

// 获取已选数量（用于最大选项模式）
const getSelectedCount = (item) => {
  return selectedDetails.value[item.itemId]?.length || 0
}

// 获取已选总数量（用于最大数量模式）
const getTotalSelectedQuantity = (item) => {
  const selected = selectedDetails.value[item.itemId] || []
  return selected.reduce((total, row) => total + (row.quantity || 0), 0)
}

// 数量变化处理
const handleQuantityChange = (item,row) => {
  row.detailAmount = row.detailPrice * row.quantity ;
  if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
    // 对于最大数量模式，更新选中状态
    const details = item.productComboItemDetailList.filter(row => row.quantity > 0)
    selectedDetails.value[item.itemId] = details
  }
}

// 选择变化处理
const handleSelectionChange = (selection, item) => {
  // 如果是固定项，强制保持全选状态
  if (item.isOptional == 1) {
    selectedDetails.value[item.itemId] = [...item.productComboItemDetailList]
    return
  }

  // 可选项处理
  if (item.setType == ComboItemSetTypeEnum.maxOption) {
    // 最大选项模式
    selectedDetails.value[item.itemId] = selection
  } else if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
    // 最大数量模式 - 选择所有数量大于0的项
    const detailsWithQuantity = item.productComboItemDetailList.filter(row => row.quantity > 0)
    selectedDetails.value[item.itemId] = detailsWithQuantity
  }
  
  console.log("当前套餐选中的内容：", selectedDetails.value)
}

const showComboDialog = (obj) => {
  comboDialogVisible.value = true
  orderDetail.value = obj
  getProductCombo(obj.comboId).then((res) => {
    currentCombo.value = res.data
    // 初始化选择状态
    nextTick(() => {
      selectedDetails.value = {}
      currentCombo.value.productComboItemList.forEach((item, index) => {
        if (item.isOptional == ComboItemIsOptionalEnum.NoOptional) {
          // 固定项自动全选
          selectedDetails.value[item.itemId] = [...item.productComboItemDetailList]
          // 同步表格选中状态
          const tableRef = tableRefs.value[index]
          if (tableRef) {
            tableRef.clearSelection()
            item.productComboItemDetailList.forEach(row => {
              tableRef.toggleRowSelection(row, true)
            })
          }
        } else if (item.isOptional == ComboItemIsOptionalEnum.Optional) {
          // 可选项初始化
          if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
            // 最大数量模式 - 默认选中所有数量大于0的项
            const detailsWithQuantity = item.productComboItemDetailList.filter(row => row.quantity > 0)
            selectedDetails.value[item.itemId] = detailsWithQuantity
          }
        }
      })
    })
  }).catch((e) => {
    console.error("获取套餐失败！：", e)
    resetState()
    // 处理套餐明细失败后，不影响添加订单明细
    emit('addComboDetails', obj);
  })
  
}

const handleCancelConfirmCombo = () => {
  resetState()
}

const handleAddDetailConfirmCombo = () => {
  // 1 控制回车促发事件
  if (!isInComboConfirm.value) {
    isInComboConfirm.value = true;
    return;
  }

  // 2. 收集所有选中的明细
  const allSelectedDetails = [];
  currentCombo.value.productComboItemList.forEach(item => {
    const selected = selectedDetails.value[item.itemId] || []
    allSelectedDetails.push(...selected)
  });

  // 3 验证选择
  if (!validateSelection()) return

  // 4. 构建返回数据
  const comboDetailData = {
    ...orderDetail.value, // 保留基础信息
    detailComboList: allSelectedDetails.map(detail => ({
      comboId: detail.comboId,
      itemId: detail.itemId,
      skuId: detail.skuId,
      skuType: detail.skuType,
      skuCode: detail.skuCode,
      skuName: detail.skuName,
      assistName: detail.assistName,
      skuValue: detail.skuValue,
      skuImage: detail.skuImage,
      price: detail.detailPrice,
      quantity: detail.quantity,
      amount: detail.detailAmount,
    }))
  };
  console.log("添加套餐明细：", comboDetailData)

  // 6. 触发事件通知父组件
  emit('addComboDetails', comboDetailData, orderDetail.value)

  // 7. 重置状态
  resetState()
}

// 8. 验证选择
const validateSelection = () => {
  let isValid = true
  currentCombo.value.productComboItemList.forEach(item => {
     if (item.isOptional == ComboItemIsOptionalEnum.Optional) {
      if (item.setType == ComboItemSetTypeEnum.maxOption) {
        // 最大选项模式验证
        const selectedCount = getSelectedCount(item)
        if (selectedCount === 0 || selectedCount > item.isOptionalQuantity) {
          isValid = false
          ElNotification({
            title: 'Error',
            message: `"${item.itemName}" 必须选择1-${item.isOptionalQuantity}个选项`,
            type: 'error',
            position: 'bottom-right',
            // appendTo 挂载到 全屏组件上
            appendTo: props.notificationContainer
          })
          console.log(`"${item.itemName}" 必须选择1-${item.isOptionalQuantity}个选项`)
        }
      } else if (item.setType == ComboItemSetTypeEnum.maxQuantity) {
        // 最大数量模式验证
        const totalQuantity = getTotalSelectedQuantity(item)
        if (totalQuantity === 0 || totalQuantity > item.maxQuantity) {
          isValid = false
          ElNotification({
            title: 'Error',
            message: `"${item.itemName}" 总数量必须在1-${item.maxQuantity}之间`,
            type: 'error',
            position: 'bottom-right',
            // appendTo 挂载到 全屏组件上
            appendTo: props.notificationContainer
          })
          console.log(`"${item.itemName}" 总数量必须在1-${item.maxQuantity}之间`)
        }
      }
    }
  })
  return isValid
}


defineExpose({ showComboDialog })
</script>

<style scoped>
.optional-tip {
  margin: 10px;
  color: #666;
  font-size: 14px;
  text-align: right;
}
</style>