<template>
  <div ref="tableContainer" class="table-container">
    <el-table-v2
      :columns="columns"
      :data="tableData"
      :width="tableWidth"
      :height="tableHeight"
      :row-height="40"
      fixed
    >
      <template #cell="{ column, row, rowIndex }">
        <template v-if="column.key === 'operation'">
          <el-button 
            v-if="orderStatus === OrderStatusEnum.EDIT"
            type="danger" 
            circle 
            @click="removeItem(rowIndex)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>

        <template v-else-if="column.key === 'index'">
          {{ rowIndex + 1 }}
        </template>

        <template v-else-if="column.key === 'productCode'">
          <el-autocomplete
            v-model="row.productCode"
            :fetch-suggestions="queryProducts"
            placeholder="输入商品编码或名称"
            @select="(item) => handleProductSelect(item, rowIndex)"
          >
            <template #default="{ item }">
              <div class="product-item">
                <div>{{ item.productCode }} - {{ item.productName }}</div>
                <small>->库存: {{ item.skuStock }}</small>
              </div>
            </template>
          </el-autocomplete>
        </template>

        <template v-else-if="column.key === 'skuValue'">
          <div v-for="(item, index) in getSkuValue(row.skuValue)" :key="index">
            <strong v-if="item[0] !== '' && item[0] !== 'skuName'">
              {{ item[0] }}:
            </strong>
            <span v-if="item[0] !== '' && item[1] !== 'skuValue'">
              {{ item[1] }}
            </span>
            <span v-if="item[0] == '' || item[0] == 'skuName'"> -- -- </span>
          </div>
        </template>

        <template v-else-if="column.key === 'skuUnit'">
          {{ getUnitCode(row.skuUnit) }}
        </template>

        <template v-else-if="column.key === 'quantity'">
          <el-input-number 
            v-model="row.quantity" 
            :precision="0" 
            :min="0"
            :max="999999"
            :controls="false"
            style="width: 100%"
            class="price-input"
            @change="calculateRowAmount(rowIndex)"
          />
        </template>

        <template v-else-if="column.key === 'unitPrice'">
          <el-input-number 
            v-model="row.unitPrice" 
            :precision="2" 
            :min="0"
            :max="99999"
            :controls="false"
            style="width: 100%"
            class="price-input"
            @change="calculateRowAmount(rowIndex)"
          >
            <template #suffix>€</template>
          </el-input-number>
        </template>

        <template v-else-if="['totalAmount', 'discountAmount', 'taxAmount', 'finalAmount'].includes(column.key)">
          {{ formatAmount(row[column.key]) }} €
        </template>

        <template v-else-if="['discountRate', 'taxRate'].includes(column.key)">
          <el-input-number 
            v-model="row[column.key]" 
            :precision="0" 
            :min="0"
            :max="100"
            :controls="false"
            style="width: 100%"
            class="price-input"
            @change="calculateRowAmount(rowIndex)"
          >
            <template #suffix>%</template>
          </el-input-number>
        </template>

        <template v-else>
          {{ row[column.key] }}
        </template>
      </template>
    </el-table-v2>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useResizeObserver } from '@vueuse/core'

// 订单状态枚举
const OrderStatusEnum = {
  EDIT: '0',
  SAVE: '1',
  SUBMIT_APPROVAL: '2',
  APPROVE: '3',
  IN_PROGRESS: '4',
  COMPLETED: '5',
  CLOSE_FOR_STOP: '6',
}

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  orderStatus: {
    type: String,
    required: true
  },
  maxLength: {
    type: Number,
    default: 100
  },
  queryProducts: {
    type: Function,
    required: true
  },
  handleProductSelect: {
    type: Function,
    required: true
  },
  getUnitCode: {
    type: Function,
    required: true
  },
  calculateRowAmount: {
    type: Function,
    required: true
  },
  formatAmount: {
    type: Function,
    required: true
  },
  getSkuValue: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['remove-item'])

// 表格容器引用
const tableContainer = ref(null)
const tableWidth = ref(0)
const tableHeight = ref(400)

// 定义列配置
const columns = [
  { key: 'operation', title: '', width: 60, align: 'center', fixed: true },
  { key: 'index', title: '序号', width: 55, align: 'center', fixed: true },
  { key: 'productCode', title: '商品编码', width: 180, align: 'center' },
  { key: 'productName', title: '商品名称', width: 150, align: 'center' },
  { key: 'skuCode', title: '规格编码', width: 180, align: 'center' },
  { key: 'skuValue', title: '规格属性', width: 100, align: 'center' },
  { key: 'skuStock', title: '现存量', width: 70, align: 'right' },
  { key: 'skuUnit', title: '单位', width: 60, align: 'center' },
  { key: 'quantity', title: '数量', width: 100, align: 'center' },
  { key: 'unitPrice', title: '单价', width: 100, align: 'center' },
  { key: 'totalAmount', title: '金额', width: 100, align: 'right' },
  { key: 'discountRate', title: '折扣率%', width: 100, align: 'right' },
  { key: 'discountAmount', title: '折扣额', width: 100, align: 'right' },
  { key: 'taxRate', title: '税率%', width: 100, align: 'right' },
  { key: 'taxAmount', title: '税额', width: 100, align: 'right' },
  { key: 'finalAmount', title: '采购总金额', width: 120, align: 'right' }
]

// 计算表格数据
const tableData = computed(() => props.data)
console.log('tableData', tableData.value[0])

// 删除行
const removeItem = (index) => {
  emit('remove-item', index)
}

// 自动调整表格大小
const updateTableSize = () => {
  if (tableContainer.value) {
    const { width, height } = tableContainer.value.getBoundingClientRect()
    tableWidth.value = width
    tableHeight.value = height
  }
}

// 监听容器大小变化
useResizeObserver(tableContainer, () => {
  updateTableSize()
})

// 组件挂载时初始化尺寸
onMounted(() => {
  updateTableSize()
  window.addEventListener('resize', updateTableSize, {passive: true})
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', updateTableSize, {passive: true})
})
</script>

<style scoped>
.table-container {
  width: 100%;
  height: calc(100vh - 400px);
  min-height: 300px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.price-input :deep(.el-input__inner) {
  text-align: right;
  padding-right: 3px;
}
</style>