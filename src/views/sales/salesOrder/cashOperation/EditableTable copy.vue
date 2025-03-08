<template>
  <el-table
    ref="tableRef"
    :data="tableData"
    border
    show-summary
    :summary-method="getSummaries"
    :stripe="true"
    size="small"
    style="width: 100%; height: 100%;"
    @cell-click="handleCellClick"
  >
    <el-table-column type="index" label="序号" align="center" width="55" />
    <el-table-column prop="skuCode" label="商品编码" align="center" min-width="150" show-overflow-tooltip>
      <template v-slot="scope">
        <el-popover trigger="hover" placement="left">
          <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
          <template #reference>
            <el-link type="primary" :underline="false">{{ scope.row.skuCode || '--' }}</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column prop="skuName" label="商品名称" align="center" min-width="150" show-overflow-tooltip>
      <template #default="scope">
        <span>
          {{ scope.row.skuName || '' }}{{ scope.row.skuName && scope.row.assistName ? ' *** ' : '' }}{{ scope.row.assistName || '' }}
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="skuValue" align="center" label="规格属性" />
    <el-table-column prop="detailPrice" align="center" label="单价">
      <template #default="scope">
        <el-input
          v-if="isEditing(scope.row, 'detailPrice')"
          :ref="(el) => setInputRef(el, scope.row, 'detailPrice')"
          v-model="scope.row.detailPrice"
          size="small"
          @blur="handleBlur(scope.row, 'detailPrice')"
          @focus="handleFocus"
          @change="updateAmount(scope.row)"
          @input="handleInput(scope.row, 'detailPrice', event.target.value)"
          style="width: 100%;"
        />
        <span v-else>{{ scope.row.detailPrice }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailQuantity" align="center" label="数量">
      <template #default="scope">
        <el-input
          v-if="isEditing(scope.row, 'detailQuantity')"
          :ref="(el) => setInputRef(el, scope.row, 'detailQuantity')"
          v-model="scope.row.detailQuantity"
          size="small"
          @blur="handleBlur(scope.row, 'detailQuantity')"
          @focus="handleFocus"
          @change="updateAmount(scope.row)"
          @input="handleInput(scope.row, 'detailQuantity', event.target.value)"
          style="width: 100%;"
        />
        <span v-else>{{ scope.row.detailQuantity }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailDiscountRate" align="center" label="折扣">
      <template #default="scope">
        <el-input
          v-if="isEditing(scope.row, 'detailDiscountRate')"
          :ref="(el) => setInputRef(el, scope.row, 'detailDiscountRate')"
          v-model="scope.row.detailDiscountRate"
          size="small"
          @blur="handleBlur(scope.row, 'detailDiscountRate')"
          @focus="handleFocus"
          @change="updateAmount(scope.row)"
          @input="handleInput(scope.row, 'detailDiscountRate', event.target.value)"
          style="width: 100%;"
        />
        <span v-else>{{ scope.row.detailDiscountRate }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailSalesAmount" align="center" label="金额">
      <template #default="scope">
        <span>{{ scope.row.detailSalesAmount }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="promotionName" align="center" label="活动名称" />
    <el-table-column prop="skuType" align="center" label="商品类型" />
    <el-table-column prop="detailSn" align="center" label="机器码" />
  </el-table>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// 处理输入事件
const handleInput = (row, prop, value) => {

  // 确保 value 不是 undefined
  if (value === undefined || value === null) {
    return;
  }
  
  const inputValue = value.toString();

  // 只允许数字和小数点
  const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');

  // 如果输入内容被修改，则更新值
  if (sanitizedValue !== inputValue) {
    row[prop] = sanitizedValue;
  }

  // 确保小数点只能输入一次
  const dotCount = (sanitizedValue.match(/\./g) || []).length;
  if (dotCount > 1) {
    row[prop] = sanitizedValue.replace(/\.+$/, ''); // 去掉多余的小数点
  }
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
      sums[index] = data.reduce((sum, row) => sum + (Number(row.detailQuantity) || 0), 0);
    } else if (column.property === 'detailSalesAmount') {
      // 计算金额合计
      sums[index] = data.reduce((sum, row) => sum + (Number(row.detailSalesAmount) || 0), 0).toFixed(2);
    } else {
      // 其他列不合计
      sums[index] = '';
    }
  });

  return sums;
};

// 计算金额
const updateAmount = (row) => {
  const price = Number(row.detailPrice) || 0;
  const quantity = Number(row.detailQuantity) || 0;
  const discount = Number(row.detailDiscountRate) || 0;
  
  row.detailSalesAmount = ((price * quantity) * (1 - discount / 100)).toFixed(2);
};

// 计算表格数据（确保 detailSalesAmount 计算正确）
const computedTableData = computed(() => {
  return props.tableData.map(row => ({
    ...row,
    detailSalesAmount: ((Number(row.detailPrice) || 0) * (Number(row.detailQuantity) || 0) * (1 - (Number(row.detailDiscountRate) || 0) / 100)).toFixed(2),
  }));
});

const tableRef = ref(null); // 表格实例
const inputRef = ref(null); // 输入框实例
const editingCell = ref(null); // 当前编辑的单元格 { row, prop, rowIndex, colIndex }

// 可编辑的列
const editableColumns = ['detailPrice', 'detailQuantity', 'detailDiscountRate'];

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
            inputEl.select(); // 选中内容
          }, 100); // 增加延迟时间
        }
      }
    });
  }
};

// 处理输入框失焦
const handleBlur = (row, prop) => {
  editingCell.value = null;
};

// 处理输入框聚焦
const handleFocus = (event) => {
  event.target.select(); // 选中输入框内容
};

// 键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
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

</script>