<template>
  <el-table ref="tableRef" :data="tableData" border show-summary :summary-method="getSummaries" :stripe="true"
    size="small" style="width: 100%; height: 100%;" @cell-click="handleCellClick" :row-class-name="setRowClassName">
    <!-- 动态控制展开列显示 -->
    <el-table-column v-if="hasComboItems" type="expand" width="50">
      <template #default="scope">
        <div class="combo-details" v-if="scope.row.skuType == 2">
          <h3>套餐明细</h3>
          <el-table :data="scope.row.detailComboList" border size="small" table-layout="auto" :stripe="true">
            <el-table-column prop="skuCode" label="SKU条码" />
            <el-table-column prop="skuName" label="SKU名称" />
            <el-table-column prop="price" label="单价" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="amount" label="金额" />
          </el-table>
        </div>
      </template>
    </el-table-column>

    <!-- 正常显示的列 -->
    <el-table-column type="index" label="序号" align="center" width="55" />
    <el-table-column prop="skuCode" label="商品编码" align="center" min-width="120" show-overflow-tooltip>
      <template v-slot="scope">
        <el-link type="primary" :underline="false" @click="handleClickChangeImage(scope.row)">{{ scope.row.skuCode ||
          '--' }}</el-link>
      </template>
    </el-table-column>
    <el-table-column prop="skuName" label="商品名称" align="center" min-width="120" show-overflow-tooltip>
      <template #default="scope">
        <span>
          {{ scope.row.skuName || '' }}{{ scope.row.skuName && scope.row.assistName ? ' *** ' : '' }}{{
          scope.row.assistName || '' }}
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="skuValue" align="center" label="规格属性" show-overflow-tooltip>
      <template #default="scope">
        <div style="display: flex;">
          <div v-if="getSkuValue(scope.row.skuValue) === 'default'">
            -- <!-- 直接显示默认 SKU -->
          </div>
          <div v-else v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
            <strong>{{ item[0] }}:</strong>
            <span>{{ item[1] }} ,&nbsp; </span>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="detailPrice" align="center" label="单价">
      <template #default="scope">
        <el-input v-if="isEditing(scope.row, 'detailPrice')" :ref="(el) => setInputRef(el, scope.row, 'detailPrice')"
          v-model.number="scope.row.detailPrice" size="small" @blur="handleBlur(scope.row, 'detailPrice')"
          @focus="handleFocus" @change="updateAmount(scope.$index, scope.row, OperateLogTypeEnum.EDIT_PRICE)" style="width: 100%;" type="number"
          :disabled="editPrice != canEditPriceEnum.ALLOW" />
        <span v-else>{{ formatTwo(scope.row.detailPrice) + ' €' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailQuantity" align="center" label="数量">
      <template #default="scope">
        <el-input v-if="isEditing(scope.row, 'detailQuantity')"
          :ref="(el) => setInputRef(el, scope.row, 'detailQuantity')" v-model.number="scope.row.detailQuantity"
          size="small" @blur="handleBlur(scope.row, 'detailQuantity')" @focus="handleFocus"
          @change="updateAmount(scope.$index, scope.row, OperateLogTypeEnum.EDIT_QUANTITY)" style="width: 100%;" type="number" />
        <span v-else>{{ scope.row.detailQuantity || 0 }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailDiscountRate" align="center" label="折扣">
      <template #default="scope">
        <el-input v-if="isEditing(scope.row, 'detailDiscountRate')"
          :ref="(el) => setInputRef(el, scope.row, 'detailDiscountRate')" v-model.number="scope.row.detailDiscountRate"
          size="small" @blur="handleBlur(scope.row, 'detailDiscountRate')" @focus="handleFocus"
          @change="updateAmount(scope.$index, scope.row, OperateLogTypeEnum.EDIT_DISCOUNT_RATE)" style="width: 100%;" type="number" :disabled="editDiscountRate != canEditDiscountRateEnum.ALLOW" />
        <span v-else>{{ scope.row.detailDiscountRate || 0 }} %</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailSalesAmount" align="center" label="金额">
      <template #default="scope">
        <span>{{ formatTwo(scope.row.detailSalesAmount) + ' €' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailSn" align="center" label="机器码" show-overflow-tooltip>
      <template #default="scope">
        <el-input v-if="isEditing(scope.row, 'detailSn')" :ref="(el) => setInputRef(el, scope.row, 'detailSn')"
          v-model="scope.row.detailSn" size="small" @blur="handleBlur(scope.row, 'detailSn')" @focus="handleFocus"
          @change="updateAmount(scope.$index, scope.row, OperateLogTypeEnum.EDIT_SN)" style="width: 100%;" type="text" :maxlength="20" />
        <span v-else>{{ scope.row.detailSn }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="promotionName" align="center" label="促销活动">
      <template #default="scope">
        <span>{{ scope.row.promotionName ?? '--' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="skuType" align="center" label="商品类型">
      <template #default="scope">
        <dict-tag :options="erp_product_sku_type" :value="scope.row.skuType" />
      </template>
    </el-table-column>
    <el-table-column prop="inTax" align="center" label="是否含税">
      <template #default="scope">
        <el-switch v-model="scope.row.inTax" :active-value="OrderInTaxEnum.TAX" :inactive-value="OrderInTaxEnum.NO_TAX"
          active-text="含税" inactive-text="不含税" inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; margin: 0px;padding: 0px;" disabled
          v-hasPermi="['sales:salesCaja:admin']" />
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" width="50">
      <template #default="scope">
        <el-button type="danger" size="small" :icon="Delete" circle @click="handleDeleteRow(scope.$index, scope.row)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import ImageNormal from '@/components/ImageNormal/index.vue';
import { OrderInTaxEnum } from './cashOperationEnum.js';
import { Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import {canEditPriceEnum, canEditDiscountRateEnum} from './tenantConfigEnum.js';
import { OperateLogTypeEnum } from "./operateLogTypeEnum.js"
import { cloneDeep } from 'lodash';

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
    default: () => [],
  },
  editPrice: {
    type: String,
    default: false,
  },
  editDiscountRate: {
    type: String,
    default: false,
  },
});

// 添加计算属性判断是否有套餐商品
const hasComboItems = computed(() => {
  return props.tableData.some(item => item.skuType == 2)
})

const setRowClassName = ({ row }) => {
  // 如果是普通商品（skuType=1），添加一个类名隐藏展开按钮
  return row.skuType === 1 ? 'no-expand-row' : '';
};


const emit = defineEmits(['handleClickChangeImage', 'deleteRow', 'addLog']);

/**
 * 点击更新展示图片
 */
const handleClickChangeImage = (row) => {
  emit('handleClickChangeImage', row);
};

/**
 * 删除行
 */
const handleDeleteRow = (index,row) => {
  emit('deleteRow', index, row); // 通知父组件删除指定行
};

/**
 * 添加日志
 */
const handleAddLog = (logType, row, index) => {
  emit('addLog', logType, row, index);
};


// 计算合计行
const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }
    if (column.property === 'detailQuantity') {
      // 计算数量合计
      sums[index] = data.reduce((sum, row) => sum + (Number(row.detailQuantity) || 0), 0) ;
    } else if (column.property === 'detailSalesAmount') {
      // 计算金额合计
      sums[index] = data.reduce((sum, row) => sum + (Number(row.detailSalesAmount) || 0), 0).toFixed(2) + ' €';
    } else {
      // 其他列不合计
      sums[index] = '';
    }
  });

  return sums;
};

/** 计算含税和不含税的金额 */
function calculateAmounts(detailPrice, taxRate, inTax) {
  const rateValue = (taxRate || 0)/100;
  let detailBaseAmount, detailTaxAmount, detailNetAmount;

  if (inTax === 0) {
    // 含税
    detailBaseAmount = detailPrice / (1 + rateValue);
    detailTaxAmount = detailPrice - detailBaseAmount;
    detailNetAmount = detailPrice;
  } else {
    // 不含税
    detailBaseAmount = detailPrice;
    detailTaxAmount = detailPrice * (rateValue);
    detailNetAmount = detailPrice + detailTaxAmount;
  }

  return { detailBaseAmount, detailTaxAmount, detailNetAmount };
}


/**
 * 更新行数据
 * @param index 索引
 * @param row 行数据
 * @param logType 数据类型
 */
const updateAmount = (index, row, logType) => {
  // 存在orderId说明是存入后台确认后的修改
  if (row.orderId) {
    handleAddLog(logType, row, index)
  }


  const price = Number(row.detailPrice) || 0;
  const quantity = Number(row.detailQuantity) || 0;
  const discount = Number(row.detailDiscountRate) || 0;
  
  row.detailAmount = +(price * quantity).toFixed(2);
  row.detailDiscountAmount = +((price * quantity) * discount / 100).toFixed(4);
  row.detailSalesAmount = row.detailAmount - row.detailDiscountAmount;

  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.inTax
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailNetAmount = detailNetAmount;
  
};

const tableRef = ref(null); // 表格实例
const inputRef = ref(null); // 输入框实例
const editingCell = ref(null); // 当前编辑的单元格 { row, prop, rowIndex, colIndex }

// 可编辑的列
const editableColumns = ['detailPrice', 'detailQuantity', 'detailDiscountRate', 'detailSn'];

// 判断是否正在编辑
const isEditing = (row, prop) => {
  return editingCell.value?.row === row && editingCell.value?.prop === prop;
};

// 设置输入框引用
const setInputRef = (el, row, prop) => {
  if (el && isEditing(row, prop)) {
    inputRef.value = el; // 只设置当前正在编辑的输入框的引用
  }
};

// 处理单元格点击
const handleCellClick = (row, column) => {
  if (editableColumns.includes(column.property)) {
    editingCell.value = { row, prop: column.property, rowIndex: props.tableData.indexOf(row), colIndex: editableColumns.indexOf(column.property) };
    nextTick(() => {
      if (inputRef.value) {
        const inputEl = inputRef.value.$el.querySelector('input'); // 获取内部的 input 元素
        if (inputEl) {
          inputEl.focus(); // 聚焦输入框
          setTimeout(() => {
            inputEl.setSelectionRange(0, inputEl.value.length); // 选中全部内容
          }, 100); // 增加延迟时间
        }
      }
    });
  }
};

// 处理输入框失焦
const handleBlur = (row, prop) => {
  // 20250409 updateAmount(row)
  editingCell.value = null;
};

// 处理输入框聚焦
const handleFocus = (event) => {
  event.target.select(); // 选中输入框内容
};

// 键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, { passive: true });
});

const handleKeyDown = (event) => {
  if (!tableRef.value || !editingCell.value) return;

  const { key } = event;
  const { rowIndex, colIndex } = editingCell.value;

  let newRowIndex = rowIndex;
  let newColIndex = colIndex;

  switch (key) {
    case 'ArrowUp': // 上移
      newRowIndex = Math.max(rowIndex - 1, 0);
      break;
    case 'ArrowDown': // 下移
      newRowIndex = Math.min(rowIndex + 1, props.tableData.length - 1);
      break;
    case 'ArrowLeft': // 左移
      newColIndex = Math.max(colIndex - 1, 0);
      break;
    case 'ArrowRight': // 右移
      newColIndex = Math.min(colIndex + 1, editableColumns.length - 1);
      break;
    default:
      return; // 忽略其他按键
  }

  // 移动到新的单元格
  const newRow = props.tableData[newRowIndex];
  const newProp = editableColumns[newColIndex];
  editingCell.value = { row: newRow, prop: newProp, rowIndex: newRowIndex, colIndex: newColIndex };

  nextTick(() => {
     if (inputRef.value) {
      const inputEl = inputRef.value.$el.querySelector('input'); // 获取内部的 input 元素
      if (inputEl) {
        inputEl.focus(); // 聚焦输入框
        setTimeout(() => {
          inputEl.select(); // 延迟选中内容
        }, 50); // 延迟 50ms
      }
    }
  });
};

// 滚动到底部方法
const scrollToBottom = () => {
  if (tableRef.value) {
    nextTick(() => {
      tableRef.value.setScrollTop(Number.MAX_SAFE_INTEGER);
    });
  }
};

// 监听数据变化，新增数据时滚动到底部
watch(() => props.tableData.length, () => {
  scrollToBottom();
});

// 组件加载完成时滚动到底部
onMounted(() => {
  scrollToBottom();
});

// 暴露方法 - 聚焦到最后一行的输入框
const focusLastRowQuantity = () => {
  if (props.tableData.length > 0) {
    const lastRow = props.tableData[props.tableData.length - 1];
    if (lastRow) {
      handleCellClick(lastRow, { property: 'detailQuantity' });
    }
  }
}

defineExpose({
  focusLastRowQuantity,
});


</script>

<style lang="scss" scoped>
.combo-details{
  width: 100%;
  padding: 5px 50px;
}
/* 非 scoped 模式测试 */
:deep(.el-table__body tr.no-expand-row td.el-table__expand-column) {
  visibility: collapse;
}
</style>