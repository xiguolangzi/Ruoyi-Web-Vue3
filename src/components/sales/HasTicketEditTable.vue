<template>
  <el-table 
    ref="tableRef" 
    :data="tableData"  
    show-summary :summary-method="getSummaries" 
    :stripe="true"
    size="small" border style="width: 100%; height: 100%;" 
    @cell-click="handleCellClick" 
    :row-class-name="setRowClassName"
  >
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
    <el-table-column type="index" label="序号" align="center" width="50" />
    <el-table-column label="SKU 条码" prop="skuCode" align="center" width="150"  show-overflow-tooltip>
      <template #default="scope">
        <SkuSelect 
          :ref="(el) => setInputRef(el, scope.row, 'skuCode')"
          v-model="scope.row.skuCode"
          @selectedData="(data) => handleSkuSelected(data, scope.row)"
          style="width: 100%"
          :teleported="true"
        />
      </template>
    </el-table-column>
    <el-table-column prop="skuName" label="商品名称" align="center" min-width="120" show-overflow-tooltip>
      <template v-slot="scope">
        <el-popover trigger="hover" placement="left">
          <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
          <template #reference>
            <el-link type="primary" :underline="false">
              <span>
                {{ scope.row.skuName || '' }}{{ scope.row.skuName && scope.row.assistName ? ' *** ' : '' }}{{
                scope.row.assistName || '' }}
              </span>
            </el-link>
          </template>
        </el-popover>
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
    <el-table-column prop="unitCode" align="center" label="单位" width="55"/>
    <el-table-column prop="currentStock" align="center" label="现存量" width="55"/>
    <el-table-column prop="detailPrice" align="center" label="单价">
      <template #default="scope">
        <el-input-number 
          v-if="isEditing(scope.row, 'detailPrice')" 
          v-model.number="scope.row.detailPrice" :controls="false" :min="0" :max="9999999" :step="0"
          :ref="(el) => setInputRef(el, scope.row, 'detailPrice')"
          @blur="handleBlur(scope.row, 'detailPrice')"
          @change="updateAmount(scope.row)" 
          style="width: 100%;" type="number" size="small" 
          v-focusSelect
        />
        <span v-else>{{ formatTwo(scope.row.detailPrice) + ' €' }}</span>
      </template>
    </el-table-column>
    
    <el-table-column prop="detailQuantity" align="center" label="数量">
      <template #default="scope">
        <el-input-number 
          v-if="isEditing(scope.row, 'detailQuantity')"
          v-model.number="scope.row.detailQuantity" :controls="false" :min="-9999999" :max="9999999" :step="0"
          :ref="(el) => setInputRef(el, scope.row, 'detailQuantity')" 
          @blur="handleBlur(scope.row, 'detailQuantity')" 
          @change="updateAmount(scope.row)" style="width: 100%;" size="small" 
          v-focusSelect
        />
        <span v-else>{{ scope.row.detailQuantity || 0 }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailDiscountRate" align="center" label="折扣">
      <template #default="scope">
        <el-input-number 
          v-if="isEditing(scope.row, 'detailDiscountRate')"
          v-model.number="scope.row.detailDiscountRate" :controls="false" :min="0" :max="100" :step="0"
          :ref="(el) => setInputRef(el, scope.row, 'detailDiscountRate')" 
          @blur="handleBlur(scope.row, 'detailDiscountRate')" 
          @change="updateAmount(scope.row)" 
          style="width: 100%;" size="small"  
          v-focusSelect
        />
        <span v-else>{{ showDetailDiscountRate(scope.row) || 0 }} %</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailSalesAmount" align="center" label="金额">
      <template #default="scope">
        <span>{{ formatTwo(scope.row.detailSalesAmount) + ' €' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailTaxRate" align="center" label="税率" width="50">
      <template #default="scope">
        <span>{{ scope.row.detailTaxRate || 0 }} %</span>
      </template>
    </el-table-column>
    <el-table-column prop="detailNetAmount" label="总金额"  align="center" width="70">
      <template #default="scope">
        <span> {{ formatTwo(scope.row.detailNetAmount)}} €</span>
      </template>
    </el-table-column> 
    <el-table-column prop="detailSn" align="left" header-align="center" label="机器码" show-overflow-tooltip>
      <template #default="scope">
        <el-input 
          v-if="isEditing(scope.row, 'detailSn')" 
          v-model="scope.row.detailSn" 
          :ref="(el) => setInputRef(el, scope.row, 'detailSn')"
          @blur="handleBlur(scope.row, 'detailSn')" 
          @change="updateAmount(scope.row)" 
          style="width: 100%;" size="small"  type="text" :maxlength="20" 
          v-focusSelect
        />
        <span v-else>{{ scope.row.detailSn ?? '--'}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="promotionName" align="left" header-align="center" label="促销活动" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.promotionName ?? '--' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="isGift" align="center" label="赠品" width="60">
      <template #default="scope">
        <span :style="{color: scope.row.isGift == 1 ? 'red' : ''}">{{ scope.row.isGift == 1 ? "是" : '否' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="skuType" align="center" label="商品类型">
      <template #default="scope">
        <dict-tag :options="erp_product_sku_type" :value="scope.row.skuType" />
      </template>
    </el-table-column>
    <el-table-column prop="refundedQuantity" label="已退数量" align="center" width="70"/>
    <el-table-column label="可退数量" align="center" width="70">
      <template #default="{ row }">
        <span :style="{color : (row.refundedAvailableQuantity - row.refundedCurrentQuantity) <= 0 ? 'red' : 'green'}">{{  row.refundedAvailableQuantity || 0 }}</span>
      </template>
    </el-table-column>
    <el-table-column label="退货数量"  align="center" width="150">
      <template #default="{ row }">
        <el-input-number
          v-model="row.refundedCurrentQuantity"
          :min="0"
          :max="row.refundedAvailableQuantity || 0"
          size="small"
          @change="validateReturnQuantity(row)"
          :disabled="(row.refundedAvailableQuantity || 0) <= 0"
          style="width: 100%"
          v-focusSelect
        />
      </template>
    </el-table-column>
    <el-table-column label="退货金额" align="center" width="80">
      <template #default="{ row }">
        <span> {{ formatTwo(row.detailNetAmount / row.detailQuantity * row.refundedCurrentQuantity)}} €</span>
      </template>
    </el-table-column>
  </el-table>

  <!-- 套餐确认 对话框 -->
  <ComboConfirmDialog ref="comboDialog" @add-combo-details="handleAddComboDetails" />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { initOrderDetailData } from '@/views/sales/salesOrder/cashOperationUtil/cashOperationEnum.js';
import { Delete } from '@element-plus/icons-vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import ComboConfirmDialog from '@/views/sales/salesOrder/cashOperationUtil/ComboConfirmDialog.vue';
import { orderInTaxEnum} from '@/views/sales/salesOrder/cashOperationUtil/tenantConfigEnum.js';
import { CustomerNormalEnum, CustomerRegimenEnum, CustomerCalificacionEnum } from "@/views/order/customer/customerEnum.js"

const { proxy } = getCurrentInstance();
const {  erp_product_sku_type } = proxy.useDict('erp_product_sku_type');

const comboDialog = ref(null);  // 套餐组件
const maxLength = 200; // 允许最大订单条数
const onceAddItemLength = 1;  // 每次添加新增的条数
const tableRef = ref(null); // 表格实例
const inputRef = ref(null); // 输入框实例
const editingCell = ref(null); // 当前编辑的单元格 { row, prop, rowIndex, colIndex }
const editableColumns = ['skuCode', 'detailPrice', 'detailQuantity', 'detailDiscountRate', 'detailSn']; // 可编辑的列

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
    default: () => [],
  },
  inTax: {
    type: String,
    required: true,
    default: orderInTaxEnum.IN_Tax,
  },
  customerPriceLevel:{
    type: [Number],
    default: 1
  },
  customerDiscountRate:{
    type: [Number],
    default: 0
  },
  customerRegimen :{
    type: String,
    default: CustomerNormalEnum.CUSTOMER_REGIMEN_NORMAL
  },
  customerCalificacion :{
    type: String,
    default: CustomerNormalEnum.CUSTOMER_CALIFICACION_NORMAL
  },

});

/** 当前订单明细的行数 */ 
const salesOrderDetailLength = computed(()=>{
  return props.tableData.length || 0;
})

/** 添加计算属性判断是否有套餐商品 */ 
const hasComboItems = computed(() => {
  return props.tableData.some(item => item.skuType == 2)
})

/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => (
    initOrderDetailData()
  ))
  // 将新记录数组添加到现有数组中
  props.tableData.push(...newItems)
  // 切换焦点
  focusLastRowQuantity()
}

// 聚焦到最后一行的输入框
const focusLastRowQuantity = () => {
  if (props.tableData.length > 0) {
    const lastRow = props.tableData[props.tableData.length - 1];
    if (lastRow) {
      handleCellClick(lastRow, { property: 'skuCode' });
    }
  }
}

/** 移除商品行 */ 
const removeItem = (index) => {
  props.tableData.splice(index, 1)
}



// 修改handleSkuSelected，添加自动失去焦点逻辑
const handleSkuSelected = (data, row) => {
  if(!data){
    Object.assign(row, initOrderDetailData());
    return;
  }
  console.log("获取的sku数据",data)
  console.log("当前行：", row)
  const { skuId, skuCode, skuImage, skuName, assistName, skuType, comboId, skuValue, batchNo, unitCode, productRateVo, currentStock, rateValue, rateRe, skuPrice, skuPrice2, skuPrice3, skuPrice4, skuPrice5, skuPrice6, packQuantity} = data;
  row.detailMainSkuId = null;
  row.skuId = skuId;
  row.skuCode = skuCode;
  row.skuImage = skuImage;
  row.skuName = skuName;
  row.assistName = assistName;
  row.skuType = skuType;
  row.comboId = comboId;
  row.skuValue = skuValue;
  row.batchNo = batchNo;
  row.detailSn = '';
  row.unitCode = unitCode;
  row.skuPrice = skuPrice || 0;
  row.skuPrice2 = skuPrice2 || 0;
  row.skuPrice3 = skuPrice3 || 0;
  row.skuPrice4 = skuPrice4 || 0;
  row.skuPrice5 = skuPrice5 || 0;
  row.skuPrice6 = skuPrice6 || 0;
  row.currentStock = currentStock || 0;
  row.packQuantity = packQuantity || 0;

  // 根据客户等级 价格/折扣转换
  const levelPriceMap = {
    1: skuPrice,
    2: skuPrice2,
    3: skuPrice3,
    4: skuPrice4,
    5: skuPrice5,
    6: skuPrice6,
  };

  // 2 数量和金额计算
  row.detailPrice = levelPriceMap[props.customerPriceLevel] || skuPrice;
  row.detailQuantity = 1;
  row.detailAmount = row.detailPrice * row.detailQuantity;
  row.detailDiscountRate = props.customerDiscountRate || 0;
  row.promotionDiscountRate = 0;
  row.activityDiscountRate = 0;
  row.detailDiscountAmount = 0;
  row.detailSalesAmount = data.skuPrice *  row.detailQuantity;
  row.detailTaxRate = rateValue || 0;
  row.detailReRate = rateRe || 0;
  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.detailReRate
    
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailReAmount = detailReAmount;
  row.detailNetAmount = detailNetAmount;
  
  // 4 套餐确认
  if (skuType == 2) {
    comboDialog.value.showComboDialog(row) 
  } 

  // 5 新增一行
  if(salesOrderDetailLength.value < maxLength){
    addItem()
  }
  // 选择后自动退出编辑模式
  console.log("更新后的行数据：",row)
  console.log("当前表单数据：",props.tableData)
};

/** 添加套餐处理套餐明细回调 */ 
const handleAddComboDetails = (data, row) => {
  row.detailComboList  = data.detailComboList;
}


// -------------------- 样式区域 start --------------------
/**
 * 展示折扣
 * @param row 
 */
const showDetailDiscountRate = (row) => {
  const { detailDiscountRate, promotionDiscountRate, activityDiscountRate } = row;
  const rates = [];
  
  if (detailDiscountRate > 0) rates.push(detailDiscountRate);
  if (promotionDiscountRate > 0) rates.push(promotionDiscountRate);
  if (activityDiscountRate > 0) rates.push(activityDiscountRate);
  
  return rates.length > 0 ? rates.join('+') : 0;
};

const setRowClassName = ({ row }) => {
  // 如果是普通商品（skuType=1），添加一个类名隐藏展开按钮
  return row.skuType === 1 ? 'no-expand-row' : '';
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

// -------------------- 样式区域 end --------------------

/** 计算含税和不含税的金额 */
function calculateAmounts(detailSalesAmount, detailTaxRate, detailReRate) {
  const rateValue = (detailTaxRate || 0)/100;
  const reRate = props.customerRegimen == CustomerRegimenEnum.CUSTOMER_REGIMEN_RE ? (detailReRate || 0) / 100 : 0;
  let detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount;

  if (props.inTax == orderInTaxEnum.IN_Tax) {
    // 含税
    detailBaseAmount = detailSalesAmount / (1 + rateValue);
    // 是否免税
    if (props.customerCalificacion != CustomerCalificacionEnum.CUSTOMER_CALIFICACION_NORMAL) {
      // 免税
      detailTaxAmount = 0
      detailReAmount = 0
      detailNetAmount = detailBaseAmount;
    } else {
      // 非免税
      detailTaxAmount = detailBaseAmount * rateValue;
      detailReAmount = detailBaseAmount * reRate;
      detailNetAmount = detailBaseAmount + detailTaxAmount + detailReAmount;
    }

  } else {
    // 不含税
    detailBaseAmount = detailSalesAmount;
    // 是否免税
    if (props.customerCalificacion != CustomerCalificacionEnum.CUSTOMER_CALIFICACION_NORMAL) {
      // 免税
      detailTaxAmount = 0
      detailReAmount = 0
      detailNetAmount = detailBaseAmount;
    } else {
      // 非免税
      detailTaxAmount = detailBaseAmount * rateValue;
      detailReAmount = detailBaseAmount * reRate;
      detailNetAmount = detailBaseAmount + detailTaxAmount + detailReAmount;
    }
  }

  return { detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount };
}


/**
 * 更新行数据
 * @param row 行数据
 */
const updateAmount = (row) => {
  const price = Number(row.detailPrice) || 0;
  const quantity = Number(row.detailQuantity) || 0;
  const discount = Number(row.detailDiscountRate) || 0;
  
  row.detailAmount = +(price * quantity).toFixed(2);
  row.detailDiscountAmount = +((price * quantity) * discount / 100).toFixed(4);
  row.detailSalesAmount = row.detailAmount - row.detailDiscountAmount;

  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.detailReTate,
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailReAmount = detailReAmount;
  row.detailNetAmount = detailNetAmount;
  
};



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
          // setTimeout(() => {
          //   inputEl.setSelectionRange(0, inputEl.value.length); // 选中全部内容
          // }, 100); // 增加延迟时间
        }
      }
    });
  }
};




// ---------------------------------  键盘事件 start ---------------------------------
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

// 处理输入框失焦
const handleBlur = (row, prop) => {
  editingCell.value = null;
};

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
// ---------------------------------  键盘事件 end ---------------------------------


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