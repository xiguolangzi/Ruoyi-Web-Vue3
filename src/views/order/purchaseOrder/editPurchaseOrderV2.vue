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
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleUnapprove" :loading="loading">
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
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" :disabled="form.orderStatus !== OrderStatusEnum.EDIT"  >

        <!-- 基本信息 -->
        <el-row :gutter="20">
            <el-form-item label="订单编号:" prop="orderNo" label-position="left">
              <el-input v-model="form.orderNo" placeholder="系统自动生成" disabled />
            </el-form-item>
            <el-form-item label="供应商：" prop="supplierId">
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
                    <span>{{ item.supplierName }}</span>
                    <span class="supplier-code">{{ item.supplierCode }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="采购人员:" prop="expectedDate">
              <el-select v-model="form.buyerId" placeholder="请选择采购员" clearable>
                <el-option v-for="item in buyerList" :key="item.userId" :label="item.userName" :value="item.userId" />
              </el-select>
            </el-form-item>
            <el-form-item label="下单日期:" prop="expectedDate">
              <el-date-picker v-model="form.orderDate" type="date" placeholder="选择日期" />
            </el-form-item>
            <el-form-item label="备注信息:" prop="remark">
              <el-input v-model="form.remark"  placeholder="请输入备注" />
            </el-form-item>
        </el-row>
        

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


        <div class="table-operations" v-if="form.orderStatus === OrderStatusEnum.EDIT && form.items.length < maxLength">
          <el-button type="primary" @click="addItem">
            <el-icon><Plus /></el-icon>   
            <span> 添加商品 (限制最多 {{ maxLength }} 条流水)</span>
          </el-button>
        </div>

        <!-- 合计信息 -->
        <el-form-item label="合计金额">
          <span class="final-total-amount">{{ formatAmount(finalTotalAmount) }} € </span>
        </el-form-item>
      </el-form>
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
        <el-form-item label="审核意见 ：" v-if="currentAction == 'approve'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入审核意见" />
        </el-form-item>
        <el-form-item label="驳回原因 ：" v-if="currentAction == 'reject'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入驳回原因" />
        </el-form-item>
        <el-form-item label="反审核原因 ：" v-if="currentAction == 'unapprove'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入反审核原因" />
        </el-form-item>
        <el-form-item label="关闭订单原因 ：" v-if="currentAction == 'closeForStop'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入关闭订单原因" />
        </el-form-item>
      </el-form>
      <span v-if="currentAction == 'edit' || currentAction == 'save' || currentAction == 'delete' || currentAction == 'submitApproval'"> 您确认要 {{ dialogTitle }} 吗？</span>
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


//*******************************   虚拟表格 数据部分  start *************************
const columns = computed(() => [
  {
    key: 'actions',
    title: '删除',
    width: 60,
    align: 'center',
    fixed:'left',
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
            form.value.items[rowIndex].productCode = value
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
      defaulu: () => h('div', {style: {
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
          form.value.items[rowIndex].quantity = value
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
          form.value.items[rowIndex].unitPrice = value
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
        step:0,
        align:'right'
      },{suffix:() => h('span', {style:{marginLeft:'5px',color:'#909399'}},' €') }))
    }
  },
  {
    key: 'totalAmount',
    title: '金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.totalAmount)} €`
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
          form.value.items[rowIndex].discountRate = value
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
          form.value.items[rowIndex].taxRate = value
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
    key: 'finalAmount',
    title: '采购总金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatAmount(rowData.finalAmount)} €`
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

const tableData = computed(() => form.value.items)

// 绑定 虚拟表格，用于滚动事件
const tableRef = ref(false)
/** 处理失去焦点后 清除焦点问题 */
const isKeyScrolling = ref(true); // 用于标记是否是键盘触发的滚动
// 用于引用隐藏的输入框
const hiddenInput = ref(null); 
/** 虚拟表格 - 现存量字段 排序 */
const sortState = ref({
  key: 'column-0',
  order: TableV2SortOrder.ASC,
})
/** 虚拟表格 - 现存量字段 排序 */
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
    backgroundColor: isFocused ? 'rgba(250, 11, 11, 0.1)' : 'transparent',
    transition: 'background-color 0.2s',
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
        nextRowIndex = Math.max(currentRowIndex - 1, 0)
      }
      break
      
    case 'ArrowDown':
      if (currentRowIndex < tableData.value.length - 1) {
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
      }
      break
      
    case 'ArrowLeft':
      if (currentColIndex > 0) {
        nextColumnKey = editableColumns[currentColIndex - 1]
      }
      break
      
    case 'ArrowRight':
      if (currentColIndex < editableColumns.length - 1) {
        nextColumnKey = editableColumns[currentColIndex + 1]
      }
      break
      
    case 'Enter':
      if (currentRowIndex < tableData.value.length - 1) {
        nextRowIndex = Math.min(currentRowIndex + 1, totalRows - 1)
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
        ElMessage.error(`重新聚焦到：${rowIndex}`)
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

// 允许订单最大条数
const maxLength = 1000

// 表单数据
const form = ref({
  orderId: '',
  orderNo: '',
  supplierId: '',
  buyerId: '',
  totalAmount:0,
  discountAmount:0,
  taxAmount:0,
  finalAmount:0,
  orderDate: new Date(),
  orderStatus: OrderStatusEnum.EDIT,
  remark: '',
  items: [],
  operateLog: '',
})

// 表单校验规则
const rules = {
  orderDate: [{ required: true, message: '请选择订单日期' }],
}


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

  const item = form.value.items[index]
  item.orderId = sku.orderId
  item.orderNo = sku.orderNo
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
  //console.log("商品实际真是的结果：",form.value.items[index])
  const matchedSku = skuList.value.find(sku => sku.skuCode === form.value.items[index].skuCode);
  //console.log("商品实际-- 匹配 --的结果：",matchedSku)
  if(!matchedSku){
    //console.log("提示：输入的商品编码不存在，未选中或未回车确认，清空输入框内容！");
    form.value.items[index] = {}
    ElMessage.error('提示：输入的内容不存在，清空输入框内容！');
    return;
  }
  if (matchedSku.productCode !== form.value.items[index].productCode) {
    //console.log("提示：输入的商品编码与列表不匹配，未选中或回车确认，清空输入框内容！");
    form.value.items[index] = {}
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
  const newItems = Array.from({ length: 100 }, () => ({
    detailId: '',
    orderId: form.value.orderId,
    orderNo: form.value.orderCode,
    skuId: '',
    productName: '',
    productCode: '',
    skuCode: '',
    skuValue: '',
    skuStock: 0,
    unitPrice: null,
    quantity: null,
    totalAmount: null,
    discountRate: null,
    discountAmount: null,
    taxRate: null,
    taxAmount: null,
    finalAmount: null,
    shortageQuantity: null,
  }))
  // 将新记录数组添加到现有数组中
  form.value.items.push(...newItems)
  
}

/** 移除商品行 */ 
const removeItem = (index) => {
  form.value.items.splice(index, 1)
}
// **********************  商品 数据模糊查询处理 end ********************

// ***************************  计算逻辑 start *******************************
/** 计算金额*/
const calculateRowAmount = (index) => {
  const item = form.value.items[index]
  item.totalAmount = item.unitPrice * item.quantity
  item.discountAmount = item.totalAmount * item.discountRate * 0.01
  item.taxAmount = (item.totalAmount - item.discountAmount) * item.taxRate * 0.01
  item.finalAmount = item.totalAmount - item.discountAmount + item.taxAmount
}

/** 合计金额 */ 
const finalTotalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.finalAmount || 0), 0)
})

// ***************************  计算逻辑 end *******************************

// **************************    操作  start ********************************

// 继续编辑订单
const handleEdit = () => {
 openApprovalDialog('编辑订单', 'edit')
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + form.value.orderNo + '"的数据项？').then(function() {
    return delPurchaseOrder(form.value.orderId);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 保存订单
const handleSave = () => {
  openApprovalDialog('保存订单', 'save')
}



// 提交审核
const handleSubmitApproval = () => {
  openApprovalDialog('提交审核', 'submitApproval')
}

// 审核通过
const handleApprove = () => {
  openApprovalDialog('审核通过', 'approve')
}

// 驳回
const handleReject = () => {
   openApprovalDialog('驳回', 'reject')
}

// 反审核
const handleUnapprove = () => {
  openApprovalDialog('反审核', 'unapprove')
}

// 关闭订单
const handleCloseForStop = () => {
   openApprovalDialog('关闭订单', 'closeForStop')
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 刷新现存量 */
const handleRefreshStock = async () => {
  await Promise.all(
    form.value.items.map(async (item) => {
      if (item.skuId){
        const res = await selectStockBySkuId(item.skuId)
        console.log("查询结果：*-******",res)
        console.log("查询结果：*-******2",res.data)
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
// 状态和加载
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentAction = ref('')

// 审核表单
const approvalForm = ref({
  remark: ''
})

/** 打开操作提示弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}

/** 添加订单操作记录 */ 
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

// 获取时间线项目类型
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

// 提交审批
const submitApproval = () => {
  if (currentAction.value == 'approve' && !approvalForm.value.remark) {
    ElMessage.warning('请输入审核意见')
    return
  }

  if (currentAction.value == 'reject' && !approvalForm.value.remark) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  if (currentAction.value == 'unapprove' && !approvalForm.value.remark) {
    ElMessage.warning('请输入反审核原因')
    return
  }

  if (currentAction.value == 'closeForStop' && !approvalForm.value.remark) {
    ElMessage.warning('请输入关闭订单原因')
    return
  }

  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    const actions = {
      save: {
        status: OrderStatusEnum.SAVE,
        message: '保存成功'
      },
      edit: {
        status: OrderStatusEnum.EDIT,
        message: '开始编辑'
      },
      submitApproval: {
        status: OrderStatusEnum.SUBMIT_APPROVAL,
        message: '提交审核 成功!'
      },
      approve: {
        status: OrderStatusEnum.APPROVE,
        message: '审核通过!'
      },
      reject: {
        status: OrderStatusEnum.SAVE,
        message: '驳回 成功!'
      },
      unapprove: {
        status: OrderStatusEnum.SAVE,
        message: '反审核 成功!'
      },
      closeForStop: {
        status: OrderStatusEnum.CLOSE_FOR_STOP,
        message: '关闭订单 成功!'
      }
    }

    const currentActionConfig = actions[currentAction.value]
    form.value.orderStatus = currentActionConfig.status
    addApprovalLog(
      dialogTitle.value,
      currentActionConfig.status,
      approvalForm.value.remark
    )

    ElMessage.success(currentActionConfig.message)
    dialogVisible.value = false
    loading.value = false
  }, 800)
}

// ************************** 审核记录 + 提示弹窗 end ******************

getUnitList()
getSkuList()
getBuyers()
getSuppliers()

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


// 商品搜索展示框
.product-item {
  display: flex;
  //justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  color: rgba(250, 11, 11, 0.1);
}

// 金额合计
.final-total-amount {
  font-size: 18px;
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