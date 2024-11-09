<!-- PurchaseOrderDetail.vue -->
<template>
  <div class="purchase-order-detail">
    <el-card class="purchase-order">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>采购订单详情</h2>
            <el-tag type="info"    v-if="form.orderStatus === OrderStatusEnum.EDIT">草稿</el-tag>
            <el-tag type="primary" v-if="form.orderStatus === OrderStatusEnum.SAVE">已保存</el-tag>
            <el-tag type="warning" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL">待审核</el-tag>
            <el-tag type="success" v-if="form.orderStatus === OrderStatusEnum.APPROVE">已审核</el-tag>
            <el-tag type="warning" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS">进行中</el-tag>
            <el-tag type="success" v-if="form.orderStatus === OrderStatusEnum.COMPLETED">已完成</el-tag>
            <el-tag type="danger"  v-if="form.orderStatus === OrderStatusEnum.CLOSE_FOR_STOP">已关闭</el-tag>

          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="mr-4">
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleSave" :loading="loading">
                保存
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleDelete" :loading="loading">
                删除
              </el-button>
              
              <!-- 已保存状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleSubmitApproval" :loading="loading">
                提交审核
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleEdit" :loading="loading">
                继续编辑
              </el-button>

              <!-- 待审核状态 -->
              <el-button type="success" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleApprove" :loading="loading">
                审核通过
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleReject" :loading="loading">
                驳回
              </el-button>

              <!-- 已审核状态 -->
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleUnApprove" :loading="loading">
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleCloseForStop"
                :loading="loading">
                关闭订单
              </el-button>

              <!-- 进行中状态，生成对应的入库单 -->
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS" @click="handleCloseForStop"
                :loading="loading">
                关闭订单
              </el-button>

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
              <el-tooltip content="退出编辑" effect="dark" placement="bottom">
                <el-button icon="Close" type="info" @click="goBack" > 退出编辑 </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="purchaseOrderRef" :model="form" :rules="rules" label-width="120px" :disabled="form.orderStatus !== OrderStatusEnum.EDIT"  >

        <!-- 基本信息 -->
        <el-row :gutter="20">
          <el-form-item label="订单编号:" prop="orderNo" >
            <el-input v-model="form.orderNo" placeholder="系统自动生成" disabled />
          </el-form-item>
          <el-form-item label="供应商：" prop="supplierName">
            <el-autocomplete 
            v-model="form.supplierName" 
            :fetch-suggestions="querySuppliers" 
            placeholder="供应商编码/名称搜索"
            style="width: 100%" 
            highlight-first-item
            @select="handleSupplierSelect"              
            @blur="handleSupplierOnBlur"
            >
            <template #default="{ item }">
              <div class="supplier-item" >
                <div>{{ item.supplierName }}</div>
                <small class="supplier-code"> - 编码: {{ item.supplierCode }}</small>
              </div>
            </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="采购人员:" prop="buyerId">
            <el-select v-model="form.buyerId" placeholder="请选择采购员" clearable style="width: 150px;">
              <el-option v-for="item in buyerList" :key="item.userId" :label="item.userName" :value="item.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="下单日期:" prop="orderDate" >
            <el-date-picker v-model="form.orderDate" type="date" placeholder="选择日期" style="width: 150px;"/>
          </el-form-item>
          <el-form-item label="备注信息:" prop="remark">
            <el-input v-model="form.remark"  placeholder="请输入备注" />
          </el-form-item>
        </el-row>
      </el-form> 

      <!-- 分割线 -->
      <el-divider content-position="left">
        <strong style="margin-right: 30px;">商品明细</strong>
        <el-button type="info" size="small" icon="Refresh" @click="handleRefreshStock" v-if="form.orderStatus == OrderStatusEnum.EDIT">刷新现存量</el-button>
      </el-divider>

      <!-- 商品明细 -->
      <div id="touch-scroll-container" style="height:400px" >
        <!-- 隐藏输入框 -->
        <input ref="hiddenInput" style="opacity: 0; position: absolute;" /> 
        <el-auto-resizer >
          <template #default="{ height, width }">
            <el-table-v2
              ref="tableRef"
              :columns="columns"
              :data="tableData"
              :sort-by="sortState"
              :width="width"
              :height="height"
              :row-height="50"
              
              fixed
              class="custom-table"
              @scroll="handleScroll"
              @column-sort="onSort"
              >
            </el-table-v2>
          </template>
        </el-auto-resizer>
      </div>

      <div class="table-operations" v-if="form.orderStatus === OrderStatusEnum.EDIT && form.details.length < maxLength">
        <el-button type="primary" @click="addItem">
          <el-icon><Plus /></el-icon>   
          <span> 添加商品 (限制最多 {{ maxLength }} 条流水)</span>
        </el-button>
      </div>

      <!-- 合计信息 -->
      <template #footer>
        <div style="display: flex; justify-content: space-evenly; align-items: center;">
          <div>
              <span > 合计采购额: {{ formatAmount(form.totalPurchaseAmount) }} € </span>
          </div>
          <div>
              <span >合计折扣额: {{ formatAmount(form.totalDiscountAmount) }} €  </span>
          </div>
          <div>
            <span > 合计税额: {{ formatAmount(form.totalTaxAmount) }} € </span>
          </div>
          <div>
            <strong class="total-net-amount"> 实际金额: {{ formatAmount(form.totalNetAmount) }} € </strong>
          </div>
        </div>
      </template>
    </el-card>
  
    <!-- 订单操作记录 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>订单操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
          :type="getTimelineItemType(activity.status)" :timestamp="activity.time" placement="top">
          {{ activity.operator }} - {{ activity.action }}
          <span v-if="activity.remark"> - -  描述 : </span>
          <span class="remark">{{ activity.remark }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="currentAction == OrderOperateType.APPROVE">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="currentAction == OrderOperateType.REJECT">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)"  />
        </el-form-item>
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="currentAction == OrderOperateType.UN_APPROVE">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)"  />
        </el-form-item>
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="currentAction == OrderOperateType.CLOSE_FOR_STOP">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)"  />
        </el-form-item>
      </el-form>
      <span v-if="currentAction == OrderOperateType.EDIT || currentAction == OrderOperateType.SAVE || currentAction == OrderOperateType.DELETE || currentAction == OrderOperateType.SUBMIT_APPROVAL"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" :loading="loading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed  } from 'vue'
import { ElAutocomplete, ElButton, ElIcon, ElInputNumber, ElMessage, ElTooltip } from 'element-plus'
import { listSupplier } from "@/api/order/supplier"
import { listSku, selectStockBySkuId } from "@/api/product/sku"
import { listBuyer } from "@/api/system/user"
import { listUnit } from "@/api/product/unit"
import useUserStore from "@/store/modules/user"
import { h } from 'vue'
import { nextTick } from 'vue'
import { debounce } from 'lodash'
import { TableV2SortOrder } from 'element-plus'
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder, updatePurchaseOrderStatus } from "@/api/order/purchaseOrder";
import { useRouter, useRoute } from "vue-router";


const router = useRouter();
const route = useRoute();
//*******************************   虚拟表格 数据部分  start *************************
const columns = computed(() => [
  {
    key: 'actions',
    title: '删除',
    width: 60,
    align: 'center',
    fixed:'left',
    hidden: form.value.orderStatus !== OrderStatusEnum.EDIT,  // 控制列是否可见
    cellRenderer: ({ rowIndex }) => {
      if (form.value.orderStatus === OrderStatusEnum.EDIT) {
        return h(ElButton, {
          type: 'danger',
          circle: true,
          icon: 'Delete',
          onClick: () => removeItem(rowIndex),
        },)
      }
      return ''
    }
  },
  {
    key: 'index',
    title: '序号',
    width: 55,
    align: 'center',
    fixed:'left',
    cellRenderer: ({ rowIndex }) => rowIndex + 1
  },
  {
    key: 'productCode',
    title: '商品编码',
    width: 180,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex  }) => {
      const inputId = getInputId(rowIndex, 'productCode')
      if (form.value.orderStatus === OrderStatusEnum.EDIT) {
        return h(ElAutocomplete, {
          id: inputId,
          modelValue: rowData.productCode,
          'onUpdate:modelValue': (value) => {
            form.value.details[rowIndex].productCode = value
          },
          fetchSuggestions: queryProducts,
          placeholder: '输入商品编码或名称',
          highlightFirstItem: true,
          onSelect: (item) => handleProductSelect(item, rowIndex),
          onBlur: () => handleProductOnBlur(rowIndex),
          onKeydown: (e) => handleAutocompleteKeydown(e, rowIndex, 'productCode'),
          onFocus: () => {
            currentFocus.value = { rowIndex, columnKey: 'productCode' };
            isAutocompleteEdit.value = true;
          },
        }, {
          default: ({ item }) => h('div', { style: { display: 'flex', justifyContent:'space-between', alignItems: 'center' } }, [
            h('div', `${item.productCode} - ${item.productName}`),
            h('small',{style:{color:'#909399',marginLeft:'5px'}} ,`库存: ${item.skuStock}`)
          ])
        })
      }
      // 非编辑状态，显示商品编码
      return h(ElTooltip, {
        content: rowData.productCode,
        placement: 'top'
      },[
        h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } },rowData.productCode)
        ]
      )  
    }
  },
  {
    key: 'productName',
    title: '商品名称',
    width: 150,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      return h(ElTooltip, {
        content: rowData.productName,
        placement: 'top'
      },{
      default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } },rowData.productName)
      }
      )   
    }
  },
  {
    key: 'skuCode',
    title: '规格编码',
    width: 180,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      return h(ElTooltip, {
        content: rowData.skuCode,
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } },rowData.skuCode)
      }
      )   
    }
  },
  {
    key: 'skuValue',
    title: '规格属性',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const skuValueArr =  getSkuValue(rowData.skuValue)
      return h('div', {}, skuValueArr.map(([key, value]) => {
        if (key !== '' && key !== 'skuName') {
          return h('div', [
            h('strong', `${key}:`),
            h('span', ` ${value}`)
          ])
        }
        return h('span', ' -- -- ')
      }))
    }
  },
  {
    key: 'skuStock',
    title: '现存量',
    width: 75,
    align: 'right',
    sortable: true,  // 启用排序
    sortMethod: (a, b) => a.skuStock - b.skuStock, // 定义排序逻辑
    hidden: form.value.orderStatus !== OrderStatusEnum.EDIT,  // 控制列是否可见
    cellRenderer: ({ rowData }) => {
      return h('div', {style: {
        overflow: 'hidden',       // 隐藏溢出部分
        textOverflow: 'ellipsis', // 使用省略号
        whiteSpace: 'nowrap',     // 禁止换行
        cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } },rowData.skuStock)  
    }
  },
  {
    key: 'skuUnit',
    title: '单位',
    width: 60,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      if (getUnitCode(rowData.skuUnit)) {
        return getUnitCode(rowData.skuUnit)
      } else {
        return '--'
      }
    }
  },
  {
    key: 'quantity',
    title: '数量',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'quantity')
      return h('div',{style: {...getCellStyle(rowIndex, 'quantity'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.quantity,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].quantity = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'quantity'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'quantity' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 999999,
        controls: false,
        step:0,
        valueOnClear: 0,
        disabled: form.value.orderStatus !== OrderStatusEnum.EDIT
      }))
        
    } 
  },
  {
    key: 'unitPrice',
    title: '单价',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'unitPrice')
      return h('div',{style: {...getCellStyle(rowIndex, 'unitPrice'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.unitPrice,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].unitPrice = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'unitPrice'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'unitPrice' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 2,
        min: 0,
        max: 99999,
        controls: false,
        valueOnClear: 0, 
        disabled: form.value.orderStatus !== OrderStatusEnum.EDIT,
        step:0,
        align:'right'
      },{suffix:() => h('span', {style:{marginLeft:'5px',color:'#909399'}},' €') }))
    }
  },
  {
    key: 'purchaseAmount',
    title: '金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.purchaseAmount)} €`
  },
  {
    key: 'discountRate',
    title: '折扣率%',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'discountRate')
      return h('div',{style: {...getCellStyle(rowIndex, 'discountRate'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.discountRate,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].discountRate = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'discountRate'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'discountRate' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 100,
        controls: false,
        disabled: form.value.orderStatus !== OrderStatusEnum.EDIT,
        step:0,
      },{suffix: () => '%'}))
    }
  },
  {
    key: 'discountAmount',
    title: '折扣额',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.discountAmount)} €`
  },
  {
    key: 'taxRate',
    title: '税率%',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData, rowIndex }) => {
      const inputId = getInputId(rowIndex, 'taxRate')
      return h('div',{style: {...getCellStyle(rowIndex, 'taxRate'),width:'100%',display:'flex'}},h(ElInputNumber, {
        id: inputId,
        modelValue: rowData.taxRate,
        'onUpdate:modelValue': (value) => {
          form.value.details[rowIndex].taxRate = value
          calculateRowAmount(rowIndex)
        },
        onKeydown: (e) => handleKeyNavigation(e, rowIndex, 'taxRate'),
        onFocus: () => {
          currentFocus.value = { rowIndex, columnKey: 'taxRate' }
        },
        onBlur: () => {
          currentFocus.value = null
        },
        precision: 0,
        min: 0,
        max: 100,
        controls: false,
        disabled: form.value.orderStatus !== OrderStatusEnum.EDIT,
        step:0,
      },{suffix: () => '%'}))
    }
  },
  {
    key: 'taxAmount',
    title: '税额',
    width: 100,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.taxAmount)} €`
  },
  {
    key: 'netAmount',
    title: '采购总金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.netAmount)} €`
  },
  {
    key: 'shortageQuantity',
    title: '缺货数量',
    width: 100,
    align: 'right',
    hidden: form.value.orderStatus !== OrderStatusEnum.IN_PROGRESS && 
            form.value.orderStatus !== OrderStatusEnum.CLOSE_FOR_STOP
  }
])

const tableData = computed(() => form.value.details)

// 绑定 虚拟表格，用于滚动事件
const tableRef = ref(false)
/** 处理失去焦点后 清除焦点问题 */
const isKeyScrolling = ref(true); // 用于标记是否是键盘触发的滚动
// 用于引用隐藏的输入框
const hiddenInput = ref(null); 
/** 虚拟表格 - 现存量字段 排序 01 */
const sortState = ref({
  key: 'column-0',
  order: TableV2SortOrder.ASC,
})
/** 虚拟表格 - 现存量字段 排序 02 */
const onSort = (sortBy) => {
  console.log(sortBy)
  tableData.value = tableData.value.reverse()
  sortState.value = sortBy
}

//*******************************   虚拟表格 数据部分  end *************************

//***********************   虚拟表格 自动填充组件的键盘操作  start ***********************
// 自动填充单元格 编辑状态
const isAutocompleteEdit = ref(true);
const handleAutocompleteKeydown = (event,rowIndex,columnKey) => {
  // 如果 非 自动填充单元格 编辑状态 -> 触发全局键盘移动事件
  if (!isAutocompleteEdit.value) {
    // 阻止事件冒泡，避免触发虚拟表格的上移逻辑
    event.stopPropagation();  
    handleKeyNavigation(event,rowIndex,columnKey)
    isAutocompleteEdit.value = true
  }
};

//***********************   虚拟表格 自动填充组件的键盘操作  end *************************


// ******************************  控制键盘操作焦点事件  start *************************
// 当前焦点位置
const currentFocus = ref({
  rowIndex: 0,
  columnKey: 'productCode' // 当前聚焦的列key
})

// 可编辑的列keys（需要根据你的实际情况修改）
const editableColumns = [
  'productCode',
  'quantity',
  'unitPrice',
  'discountRate',
  'taxRate'
]

/** 获取表格数据总行数 */ 
const getTableRowCount = () => {
  return tableData.value?.length || 0
}

/** 检查行索引是否有效 */ 
const isValidRowIndex = (rowIndex) => {
  const totalRows = getTableRowCount()
  return rowIndex >= 0 && rowIndex <= totalRows
}

/** 更新焦点状态 */ 
const updateFocusState = async (rowIndex, columnKey) => {
  currentFocus.value = { ...currentFocus.value, rowIndex, columnKey }
}

/** 生成输入框的唯一ID */ 
const getInputId = (rowIndex, columnKey) => `input-${rowIndex}-${columnKey}`

/** 获取单元格样式 */ 
const getCellStyle = (rowIndex, columnKey) => {
  if (rowIndex == null) return {}
  if (currentFocus.value?.rowIndex == null) return {}
  const isFocused = rowIndex === currentFocus.value.rowIndex && 
                   columnKey === currentFocus.value.columnKey
  return {
    backgroundColor: isFocused ? 'rgba(11, 15, 250, 0.918)' : 'transparent',
    transition: 'background-color 0.1s',
    padding: '0 4px',
  }
}
/** 键盘导航 */ 
const handleKeyNavigation = (e, currentRowIndex, currentColumnKey) => {
  // 返回列名所在的索引(控制列之间的切换)
  const currentColIndex = editableColumns.indexOf(currentColumnKey)
  const totalRows = getTableRowCount()
  let nextRowIndex = currentRowIndex
  let nextColumnKey = currentColumnKey

  // 先阻止默认行为，避免数字框的上下键行为
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()  // 添加这行以彻底阻止事件冒泡
  }

  switch (e.key) {
    case 'ArrowUp':
      if (currentRowIndex > 0) {
        hiddenInput.value.focus();  // bug处理
        nextRowIndex = Math.max(currentRowIndex - 1, 0)
      }
      break
      
    case 'ArrowDown':
      if (currentRowIndex < tableData.value.length - 1) {
        hiddenInput.value.focus();  // bug处理
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
      }
      break
      
    case 'ArrowLeft':
      if (currentColIndex > 0) {
        hiddenInput.value.focus();  // bug处理
        nextColumnKey = editableColumns[currentColIndex - 1]
      }
      break
      
    case 'ArrowRight':
      if (currentColIndex < editableColumns.length - 1) {
        hiddenInput.value.focus();  // bug处理
        nextColumnKey = editableColumns[currentColIndex + 1]
      }
      break
      
    case 'Enter':
      if (currentRowIndex < tableData.value.length - 1) {
        hiddenInput.value.focus();  // bug处理
        e.stopPropagation()
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
        nextColumnKey = editableColumns[0]
      }
      break

  }
  // 如果位置发生变化，则移动焦点
  if (nextRowIndex !== currentRowIndex || nextColumnKey !== currentColumnKey) {
    moveFocus(nextRowIndex, nextColumnKey)
  }
}


/** 移动焦点 */ 
const moveFocus = (rowIndex, columnKey) => {
  try {
    // 边界检查
    if (!isValidRowIndex(rowIndex)) {
      ElMessage.warning(`行索引 ${rowIndex} 超出范围`)
      return
    }

    // 先滚动到目标行
    if (tableRef.value) {
      //ElMessage.error(`移动焦点之前`)
      tableRef.value.scrollToRow(rowIndex)
      //ElMessage.error(`移动焦点到：${rowIndex}`)
    }

    // 更新焦点状态
    updateFocusState(rowIndex, columnKey)
    
    // 渲染之后触发
    nextTick(() => {
      const inputId = getInputId(rowIndex, columnKey)
      const targetInput = document.getElementById(inputId)
      if (targetInput) {
        // 标识键盘触发的滚动
        //ElMessage.error(`重新聚焦到：${rowIndex}`)
        isKeyScrolling.value = true;
        targetInput.focus()
        
        if (targetInput.tagName === 'INPUT') {
          targetInput.select()
        }
      } else {
        console.warn(`未找到目标输入框: ${inputId}`)
      }
    })

  } catch (error) {
    console.error('移动焦点时发生错误:', error)
  }
  
}

/** lodash防抖处理滚动 */ 
const debouncedScroll = debounce(() => {
  //ElMessage.error(`修改 键盘操作状态 ---   === false`)
  isKeyScrolling.value = false;
}, 2);

/** 鼠标滚动 焦点处理 */
const handleScroll = () => {
  // 可以根据 scrollTop 和 scrollLeft 来获取视图顶端的rowIndex 和 columnKey
  //ElMessage.error(`触发滚动事件 - 滚动位置：${scrollTop} - ${scrollLeft}`)
  // 检查当前是否是键盘滚动
    if (isKeyScrolling.value) {
      //ElMessage.error(`触发滚动事件 - 不做任何处理！ - 键盘滚动：${isKeyScrolling.value}`)
      // 重置 isKeyScrolling 状态
      // isKeyScrolling.value = false;
      // 修改成防抖处理，否则有时会连续触发滚动事件，导致无法聚焦移动
      debouncedScroll()
      
    } else {
      // 手动滚动才移除焦点
      hiddenInput.value.focus(); 
      //ElMessage.error(`触发滚动事件 - 移除焦点！  - 键盘滚动： ${isKeyScrolling.value}`)
    }
}


// ******************************  控制键盘操作焦点事件  end *************************

//**************************** 解决虚拟表格 触屏滚动的问题 start 备用 ****************/
const addTouchClass = () => {
  const tableBodyDiv = tableRef.value.$el.querySelector('.el-table-v2__body > div');
  tableBodyDiv.classList.add('is-touch');
};
const removeTouchClass = () => {
  const tableBodyDiv = tableRef.value.$el.querySelector('.el-table-v2__body > div');
  tableBodyDiv.classList.remove('is-touch');
};
const addTouchEventListeners = () => {
  const container = document.querySelector('#touch-scroll-container');
  container.addEventListener('touchstart', addTouchClass, { passive: true });
  container.addEventListener('touchend', removeTouchClass, { passive: true });
};
const removeTouchEventListeners = () => {
  const container = document.querySelector('#touch-scroll-container');
  container.removeEventListener('touchstart', addTouchClass);
  container.removeEventListener('touchend', removeTouchClass);
};
//**************************** 解决虚拟表格 触屏滚动的问题 end 备用 ****************/

/** 组件挂载后初始化设置 */ 
onMounted(() => {
  // 组件挂载后设置初始焦点
  if (tableData.value.length > 0) {
    moveFocus(0, 'quantity')
  }
  // 监听触屏滚动事件
  addTouchEventListeners();
})
/** 组件销毁前移除监听 */ 
onBeforeUnmount(() => {
  // 组件销毁前移除触屏滚动监听
  removeTouchEventListeners();
});


//**************************************   虚拟表格 - 数据部分   ***************************************/

const { proxy } = getCurrentInstance();
const userStore = useUserStore();
// 订单操作记录
const orderOperateLog = ref([])

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

// 订单操作类型
const OrderOperateType = {
  SAVE: 'save',
  EDIT: 'edit',
  SUBMIT_APPROVAL: 'submitApproval',
  APPROVE: 'approve',
  REJECT: 'reject',
  UN_APPROVE: 'unApprove',
  CLOSE_FOR_STOP: 'closeForStop',
  DELETE: 'delete'
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (orderStatus) => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'warning',
    3: 'success',
    6: 'danger'
  }
  return typeMap[orderStatus] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OrderOperateType.APPROVE]: '审核意见',
    [OrderOperateType.REJECT]: '驳回原因',
    [OrderOperateType.UN_APPROVE]: '反审核原因',
    [OrderOperateType.CLOSE_FOR_STOP]: '关闭订单原因'
  };
  return messages[action] || '备注';
}

// 允许最大订单条数
const maxLength = 1000
// 每次添加新增的条数
const onceAddItemLength = 100

// 表单数据
const form = ref({
  orderId: '',
  orderNo: '',
  supplierId: '',
  buyerId: '',
  totalPurchaseAmount:0,
  totalDiscountAmount:0,
  totalTaxAmount:0,
  totalNetAmount:0,
  orderDate: new Date(),
  orderStatus: OrderStatusEnum.EDIT,
  remark: '',
  details: [],
  operateLog: '',
})

// 表单校验规则
const rules = ref({
  orderDate: [
    { required: true, message: '请选择订单日期' , trigger: ['blur','change'] }
  ],
  supplierId: [
    { required: true, message: '请选择供应商' , trigger: ['blur','change'] }
  ],
  buyerId: [
    { required: true, message: '请选择采购员' , trigger: ['blur','change'] }
  ],
})


// ******************************  数据展示  start **************************
/** 格式化金额 - 通过Math.round处理小数点精度(5不进位的BUG) */ 
const formatAmount = (amount) => {
  return amount ? (Math.round(amount * 100) / 100).toFixed(2) : '0.00';
}

/**  skuValue 转化成表格数据 */
const getSkuValue = (skuValueList) => {
  if (!skuValueList) {
    return [];
  }
  // 将 skuValueList 转化成 [["型号","AA"] , ["尺寸","SS"]]
  const tableData = ref(Object.entries(skuValueList));
  return tableData.value;
};

// 默认选择计量单位
const baseUnit = "0";
const unitList = ref([]);
/** 获取计量单位code */
const getUnitCode = (unitId) => {
  if (!unitList.value) {
    return "";
  }
  if (!unitId) {
    return "";
  }
  let unitCode = "";
  unitList.value.forEach((item) => {
    if (item.unitId === unitId) {
      unitCode = item.unitCode;
    }
  });
  return unitCode;
};
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit({})
    .then((response) => {
      // 产品只赋值基础单位
      unitList.value = response.rows.filter((row) => row.unitType === baseUnit);
      if (unitList.value.length > 0) {
        form.value.unitId = unitList.value[0].unitId;
      } else {
        console.log("提示：请维护计量单位！！");
      }
    })
    .catch((error) => {
      console.error("获取计量单位列表时出错:", error);
    });
}

// 采购员 - 初始化列表
const buyerList = ref([])
/** 采购员 - 获取列表 */
const getBuyers = () => {
  listBuyer().then(response => {
    buyerList.value = response.rows || []
  })
}

// ******************************  数据展示  end ****************************

// *********************  供应商 数据模糊查询处理 start ***********************
// 供应商 - 初始化列表
const supplierList = ref([])
/** 供应商 - 获取列表 */
const getSuppliers = () => {
  listSupplier().then(response => {
    supplierList.value = response.rows || []
  })
}
/** 供应商 - 自动补全输入框的返回值 */
const querySuppliers = (queryString, cb) => {
  const suppliers  = queryString
    ? supplierList.value.filter(supplier =>
      supplier.supplierName.toLowerCase().includes(queryString.toLowerCase()) ||
      supplier.supplierCode.toLowerCase().includes(queryString.toLowerCase())
    )
    : []
  cb(suppliers  || [])
  console.log("模糊查询结果：",suppliers )
}
/** 供应商 -  选择后调用的赋值操作*/ 
const handleSupplierSelect = (supplier) => {
  form.value.supplierCode = supplier.supplierCode
  form.value.supplierName = supplier.supplierName
  form.value.supplierId = supplier.supplierId
  console.log("选择的结果：",form.value)
}
/** 供应商 -  失去焦点后 判断输入框中的内容与列表是否匹配 不匹配说明只修改没有选择操作 所以清空 */ 
const handleSupplierOnBlur = () => {
  const matchedSupplier = supplierList.value.find(supplier => supplier.supplierName === form.value.supplierName);
  if(!matchedSupplier){
    console.log("提示：输入的供应商名称与列表不匹配，未选中或回车确认，清空输入框内容！");
    form.value.supplierId = '';  // 无匹配供应商时清空 supplierId
    form.value.supplierCode = '';
    form.value.supplierName = '';
    ElMessage.error('提示：输入的内容不存在，清空输入框内容！');
    return;
  }
  if (matchedSupplier.supplierId !== form.value.supplierId) {
    console.log("提示：输入的供应商名称与列表不匹配，未选中或回车确认，清空输入框内容！");
    form.value.supplierId = '';  // 无匹配供应商时清空 supplierId
    form.value.supplierCode = '';
    form.value.supplierName = '';
    ElMessage.error('提示：没有选择或回车确认，清空输入框内容！');
    return;
  }
};

// *********************  供应商 数据模糊查询处理 end ***********************

// **********************  商品 数据模糊查询处理 start ********************
// 商品 - 初始化商品列表
const skuList = ref([])
/** 商品 - 获取列表 */
const getSkuList = () => {
  listSku().then(response => {
    skuList.value = response.rows || []
    if(skuList.value){
      // 转移 skuValue 的json格式
      skuList.value.map((item) => {
        item.skuValue = JSON.parse(item.skuValue);
      });
    }
    
  })
}
/** 商品 -  自动补全输入框的返回值 */
const queryProducts = (queryString, cb) => {
  const results = queryString
    ? skuList.value.filter(sku =>
      sku.skuCode.toLowerCase().includes(queryString.toLowerCase()) ||
      sku.productName.toLowerCase().includes(queryString.toLowerCase())
    )
    : []
    console.log("商品搜索结果：",results)
  cb(results || [])
}
/** 商品 -  选择后调用的赋值操作 */
const handleProductSelect = (sku, index) => {
  // 切换 自动聚焦单元格的编辑状态
  isAutocompleteEdit.value = false;

  const item = form.value.details[index]
  item.skuId = sku.skuId
  item.productName = sku.productName
  item.productCode = sku.productCode
  item.skuCode = sku.skuCode
  item.skuValue = sku.skuValue
  item.skuStock = sku.skuStock
  item.skuUnit = sku.skuUnit
  console.log("选择的结果：",item)
}
/** 商品 -  失去焦点后 判断输入框中的内容与列表是否匹配 不匹配说明只修改没有选择操作 所以清空 */ 
const handleProductOnBlur = (index) => {
  // 移除焦点
  currentFocus.value = null;
  isAutocompleteEdit.value = true;
  //console.log("商品索引：",index)
  //console.log("商品实际真是的结果：",form.value.details[index])
  const matchedSku = skuList.value.find(sku => sku.skuCode === form.value.details[index].skuCode);
  //console.log("商品实际-- 匹配 --的结果：",matchedSku)
  if(!matchedSku){
    //console.log("提示：输入的商品编码不存在，未选中或未回车确认，清空输入框内容！");
    form.value.details[index] = {}
    ElMessage.error('提示：输入的内容不存在，清空输入框内容！');
    return;
  }
  if (matchedSku.productCode !== form.value.details[index].productCode) {
    //console.log("提示：输入的商品编码与列表不匹配，未选中或回车确认，清空输入框内容！");
    form.value.details[index] = {}
    ElMessage.error('提示：没有选择或回车确认，清空输入框内容！');
    return;
  }
};

/** 添加商品行 */ 
const addItem = () => {
  // 初始化聚焦操作
  if (tableData.value.length == 0) {
    //ElMessage.error('提示：添加商品开始聚焦');
    moveFocus(currentFocus.value.rowIndex, currentFocus.value.columnKey)
  }
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => ({
    detailId: '',
    skuId: '',
    productName: '',
    productCode: '',
    skuCode: '',
    skuValue: '',
    skuStock: 0,
    skuUnit:'',
    unitPrice: null,
    quantity: null,
    purchaseAmount: null,
    discountRate: null,
    discountAmount: null,
    taxRate: null,
    taxAmount: null,
    netAmount: null,
    shortageQuantity: null,
  }))
  // 将新记录数组添加到现有数组中
  form.value.details.push(...newItems)
  
}

/** 移除商品行 */ 
const removeItem = (index) => {
  form.value.details.splice(index, 1)
}
// **********************  商品 数据模糊查询处理 end ********************


// ***************************  计算逻辑 start *******************************
/** 采购订单计算 */
const calculateRowAmount = (index) => {
  const item = form.value.details[index]
  item.purchaseAmount = item.unitPrice * item.quantity
  item.discountAmount = item.purchaseAmount * item.discountRate * 0.01
  item.taxAmount = (item.purchaseAmount - item.discountAmount) * item.taxRate * 0.01
  item.netAmount = item.purchaseAmount - item.discountAmount + item.taxAmount
  // 合计 采购金额
  form.value.totalPurchaseAmount = form.value.details.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
  // 合计 折扣额
  form.value.totalDiscountAmount = form.value.details.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  // 合计 税额
  form.value.totalTaxAmount = form.value.details.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
  // 合计 实际采购总金额
  form.value.totalNetAmount = form.value.details.reduce((sum, item) => sum + (item.netAmount || 0), 0)
}

// ***************************  计算逻辑 end *******************************


// **************************    操作  start ********************************

// 继续编辑订单
const handleEdit = () => {
 openApprovalDialog('编辑订单', OrderOperateType.EDIT)
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + form.value.orderNo + '"的数据项？').then(function() {
    return delPurchaseOrder(form.value.orderId);
  }).then(() => {
    ElMessage.success("删除成功");
    goBack();
  }).catch((e) => {
    ElMessage.error("删除失败：",e);
  });
}

/** 保存订单 */ 
const handleSave = () => {
  // 与校验表单提交校验一致，此处只做提交之前的预校验 */
  proxy.$refs["purchaseOrderRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.details = form.value.details.filter(item => item.skuId)
    // 2 检查是否存在相同的skuId  true存在相同的skuId
    if (checkHaveSameSkuId(form.value.details)) {
      return;
    }
    // 3 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.details)) {
      return;
    }

    // 4 提交表单
    openApprovalDialog('保存订单', OrderOperateType.SAVE)
  })
  
}
/** 检查采购条目的必输项 */
const validateItems = (submitItems) => {
  for (const item of submitItems) {
    if (item.quantity <= 0) {
      ElMessage.error("采购明细 数量必须大于 0 !");
      return false;
    }
    if (item.unitPrice < 0) {
      ElMessage.error("采购明细 采购单价必须大于等于 0 !");
      return false;
    }
  }
  return true;
};

/** 检查采购条目是否有相同的skuId */
const checkHaveSameSkuId = (submitItems) => {
  const skuIdSet = new Set();
  for (const item of submitItems) {
    if (skuIdSet.has(item.skuId)) {
      ElMessage.error("采购明细 sku 重复，请检查！");
      return true;
    }
    skuIdSet.add(item.skuId);
  }
  return false;
}

/** 提交审核 */ 
const handleSubmitApproval = () => {
  openApprovalDialog('提交审核', OrderOperateType.SUBMIT_APPROVAL)
}

/** 审核通过 */ 
const handleApprove = () => {
  openApprovalDialog('审核通过', OrderOperateType.APPROVE)
}

/** 驳回 */ 
const handleReject = () => {
   openApprovalDialog('驳回', OrderOperateType.REJECT)
}

/** 反审核 */ 
const handleUnApprove = () => {
  openApprovalDialog('反审核', OrderOperateType.UN_APPROVE)
}

/** 关闭订单 */ 
const handleCloseForStop = () => {
   openApprovalDialog('关闭订单', OrderOperateType.CLOSE_FOR_STOP)
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 刷新现存量 */
const handleRefreshStock = async () => {
  await Promise.all(
    form.value.details.map(async (item) => {
      if (item.skuId){
        const res = await selectStockBySkuId(item.skuId)
        item.skuStock = res.data
      } else {
        item.skuStock = 0
      }
    })
  );
  ElMessage.success('刷新现存量成功！')
};

// **************************    操作  end ********************************

// ************************** 审核记录 + 提示弹窗 start ******************
const loading = ref(false)        // 提交加载状态
const dialogVisible = ref(false)  // 提交弹窗状态
const dialogTitle = ref('')       // 提交弹窗标题
const currentAction = ref('')     // 当前操作类型

/** 提交弹窗参数 */ 
const approvalForm = ref({
  remark: ''
})

/** 打开提交操作的弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}

/** 添加采购订单操作记录 */ 
const addApprovalLog = (action, status, remark) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark
  }
  // 查找是否存在相同 operator 的记录
  const existingIndex = orderOperateLog.value.findIndex(
    log => log.action === action
  )
  if (existingIndex !== -1) {
    // 如果存在，先删除原有记录
    orderOperateLog.value.splice(existingIndex, 1)
  }
  
  // 添加新记录（无论是否存在都会添加到最后）
  orderOperateLog.value.push(newLog)
}

const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = orderOperateLog.value
  form.value.details.forEach(item => {
    item.skuValue = JSON.parse(item.skuValue)
  })
}

/** 采购订单提交操作 */ 
const submitApproval = () => {
  // 1 强制输入描述信息 检查
  const actionRequiresRemark = [OrderOperateType.APPROVE, OrderOperateType.REJECT, OrderOperateType.UN_APPROVE, OrderOperateType.CLOSE_FOR_STOP];
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }
  // 2 开启加载状态
  loading.value = true
  // 3 定义动作及相应状态
  const actions = {
    [OrderOperateType.SAVE]: {
      status: OrderStatusEnum.SAVE,
      message: '保存成功'
    },
    [OrderOperateType.EDIT]: {
      status: OrderStatusEnum.EDIT,
      message: '开始编辑'
    },
    [OrderOperateType.SUBMIT_APPROVAL]: {
      status: OrderStatusEnum.SUBMIT_APPROVAL,
      message: '提交审核 成功!'
    },
    [OrderOperateType.APPROVE]: {
      status: OrderStatusEnum.APPROVE,
      message: '审核通过!'
    },
    [OrderOperateType.REJECT]: {
      status: OrderStatusEnum.SAVE,
      message: '驳回 成功!'
    },
    [OrderOperateType.UN_APPROVE]: {
      status: OrderStatusEnum.SAVE,
      message: '反审核 成功!'
    },
    [OrderOperateType.CLOSE_FOR_STOP]: {
      status: OrderStatusEnum.CLOSE_FOR_STOP,
      message: '关闭订单 成功!'
    }
  }

  const currentActionConfig = actions[currentAction.value]

  // 4 后端 API调用
  try {
    // skuValue 转 json格式
    form.value.details.forEach(item => {
      item.skuValue = JSON.stringify(item.skuValue)
    })
    // 清洗数据 -> operateLog操作日志json转化
    form.value.operateLog = JSON.stringify(orderOperateLog.value)

    if (currentAction.value === OrderOperateType.SAVE) {
      if(!form.value.orderId){
        // 新增操作
        addPurchaseOrder(form.value)
          .then(res => {
            // 更新订单状态
            form.value.orderStatus = currentActionConfig.status;
            form.value.orderId = res.data.orderId
            // 更新操作记录
            addApprovalLog(
              dialogTitle.value,
              currentActionConfig.status,
              approvalForm.value.remark
            );
            // 清洗数据 -> operateLog操作日志json转化
            form.value.operateLog = JSON.stringify(orderOperateLog.value)
            // 5 修改订单状态及操作记录
            updatePurchaseOrderStatus(form.value)
              .then(() => {
                ElMessage.success(currentActionConfig.message);
                parseJson()
              })
              .catch(() => {
                parseJson()
                // 操作失败删除订单
                delPurchaseOrder(form.value.orderId)
                ElMessage.error("操作失败");
              });
          })
          .catch(() => {
            // 处理 API 返回的失败情况
             parseJson()
            ElMessage.error(response.msg || '新增操作失败');
          });

      } else {
        console.log('*****修改操作的数据是：',form.value);
        // 修改操作
        updatePurchaseOrder(form.value)
          .then(() => {
            // 更新订单状态
            form.value.orderStatus = currentActionConfig.status;
            // 更新操作记录
            addApprovalLog(
              dialogTitle.value,
              currentActionConfig.status,
              approvalForm.value.remark
            );
            // 清洗数据 -> operateLog操作日志json转化
            form.value.operateLog = JSON.stringify(orderOperateLog.value)
            // 5 修改订单状态及操作记录
            updatePurchaseOrderStatus(form.value)
              .then(() => {
                 parseJson()
                ElMessage.success(currentActionConfig.message);
              })
              .catch(() => {
                 parseJson()
                // 操作失败删除订单
                ElMessage.error("修改操作失败");
              });
          })
          .catch(() => {
            // 处理 API 返回的失败情况
             parseJson()
            ElMessage.error(response.msg || '新增操作失败');
          });

      }
      
    }

    if(currentAction.value !== OrderOperateType.SAVE){
      console.log("当前调用的操作：",currentAction.value)
      // 更新订单状态
      form.value.orderStatus = currentActionConfig.status;
      // 更新操作记录
      addApprovalLog(
        dialogTitle.value,
        currentActionConfig.status,
        approvalForm.value.remark
      );
      // 清洗数据 -> operateLog操作日志json转化
      form.value.operateLog = JSON.stringify(orderOperateLog.value)

      // 修改状态
      updatePurchaseOrderStatus(form.value)
        .then(() => {
          parseJson()
          ElMessage.success(currentActionConfig.message);
        })
        .catch(() => {
          // 操作失败删除订单
           parseJson()
          ElMessage.error("操作失败");
        });
    }
    
  } catch (error) {
    // 处理 API 调用异常
    console.log("****************",error);
    ElMessage.error('API 调用异常，请重试',error);
  } finally {
    
    // 关闭对话框和加载状态
    dialogVisible.value = false;
    loading.value = false;
  }
}

/** 返回上一页 */
const goBack = () => {
  // 当前要关闭的 tabs
  const view = {
    path: route.path,
    name: route.name,
    meta: route.meta,
  };
  // 关闭当前 tab
  proxy.$tab.closePage(view)
  router.push({
    path: "/purchaseManage/purchaseOrder",
  });
};

/** 通过修改传递的 orderId 获取商品信息 */
const getInfoById = () => {
  // 获取修改传递的参数 productId
  const _orderId = route.query.orderId;

  if (_orderId) {
    getPurchaseOrder(_orderId).then((response) => {
      form.value = response.data;
      // 还原数据
      if (form.value.operateLog) {
        orderOperateLog.value = JSON.parse(form.value.operateLog);
      }
      // 还原数据
      if (form.value.details) {
        form.value.details.forEach(item => {
          item.skuValue = JSON.parse(item.skuValue);
        });
      }
      
    });
  }
}


// ************************** 审核记录 + 提示弹窗 end ******************

getUnitList()
getSkuList()
getBuyers()
getSuppliers()
getInfoById() // 获取修改传递的 orderId 返回form数据

</script>

<style scoped lang="scss">
.purchase-order {
  margin: 0px 10px 0px 10px;
}

/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    h2 {
      margin: 0;
    }
  }
  .actions {
    display: flex;
    gap: 10px;
  }
}

.supplier-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 金额合计
.total-net-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.operation-card{
  margin: 0px 10px 0px 10px;
  .remark {
    color: #909399;
    font-size: 13px;
    margin: 4px 0 0;
  }
}


// 解决虚拟表格 触屏滚动的问题 - 方案一 控制内部滚动条
:deep(.el-table-v2__body) > div.is-touch {
  overflow: auto !important;
}

// 解决虚拟表格 触屏滚动的问题 - 方案2 设置overflow
// :deep(.el-table-v2__body) > div:nth-child(1) {
//   overflow: auto !important;
// }
/* 隐藏 el-table-v2 的内部滚动条 */
// :deep(.custom-table .el-scrollbar__thumb) {
//   display: none !important;
// }

:deep(.custom-table){
  content-visibility: auto;
}
</style>