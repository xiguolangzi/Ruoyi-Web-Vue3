<!-- PurchaseOrderDetail.vue -->
<template>
  <div class="app-container">
    <el-card class="card-data">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>采购订单详情</h2>
            <el-tag :type=OrderStatusColor[form.orderStatus] >{{OrderStatusName[form.orderStatus]}}</el-tag>
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="ml-4" >
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleSave" v-hasPermi="['order:purchaseOrder:add','order:purchaseOrder:edit']" >
                保存
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleDelete" v-hasPermi="['order:purchaseOrder:add','order:purchaseOrder:edit']" >
                删除
              </el-button>
              
              <!-- 已保存状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleSubmitApproval"  v-hasPermi="['order:purchaseOrder:add','order:purchaseOrder:edit']">
                提交审核
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleEdit"  v-hasPermi="['order:purchaseOrder:add','order:purchaseOrder:edit']" >
                继续编辑
              </el-button>

              <!-- 待审核状态 -->
              <el-button type="success" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleApprove"  v-hasPermi="['order:purchaseOrder:approve']" >
                审核通过
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleReject"  v-hasPermi="['order:purchaseOrder:approve']" >
                驳回
              </el-button>

              <!-- 已审核状态 -->
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleUnApprove"  v-hasPermi="['order:purchaseOrder:approve']" >
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleCloseForStop"  v-hasPermi="['order:purchaseOrder:close']" >
                关闭订单
              </el-button>

              <!-- 进行中状态，生成对应的入库单 -->
               <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS" @click="handleUnApprove"  v-hasPermi="['order:purchaseOrder:approve']" >
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS" @click="handleCloseForStop"  v-hasPermi="['order:purchaseOrder:close']" >
                关闭订单
              </el-button>

              <!-- 关闭状态，重启启用 -->
              <el-button type="info" v-if="form.orderStatus === OrderStatusEnum.CLOSE_FOR_STOP" @click="handleReStart"  v-hasPermi="['order:purchaseOrder:close']" >
                重新启用
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
          <el-form-item label="供应商：" prop="supplierId">
            <el-select
              v-model="form.supplierId"
              filterable
              clearable
              placeholder="请选中供应商"
              style="width: 150px"
            >
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option
              v-for="item in supplierList"
              :key="item.supplierId"
              :label="item.supplierName"
              :value="item.supplierId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="采购人员:" prop="buyerId">
            <el-select
              v-model="form.buyerId"
              filterable
              clearable
              placeholder="请选中采购员"
              style="width: 150px"
            >
              <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
              <el-option
              v-for="item in buyerList"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
              />
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
        <el-button type="primary" size="small" icon="Refresh" @click="handleRefreshStock" v-if="form.orderStatus == OrderStatusEnum.EDIT">刷新现存量</el-button>
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
              size="small"
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
              <span > 合计采购额: {{ formatTwo(form.totalPurchaseAmount) }} € </span>
          </div>
          <div>
              <span >合计折扣额: {{ formatTwo(form.totalDiscountAmount) }} €  </span>
          </div>
          <div>
            <span > 合计税额: {{ formatTwo(form.totalTaxAmount) }} € </span>
          </div>
          <div>
            <strong class="total-net-amount"> 实际金额: {{ formatTwo(form.totalNetAmount) }} € </strong>
          </div>
        </div>
      </template>
    </el-card>
  
    <!-- 订单操作记录 -->
    <el-card class="card-operation-log">
      <template #header>
        <div class="card-header">
          <span>订单操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
          :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
          {{ activity.operator }} - {{ activity.action }}
          <span v-if="activity.remark"> - -  描述 : </span>
          <span class="remark">{{ activity.remark }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <!-- 强制填写备注 -->
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
      </el-form>
      <!-- 不强制填写备注 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted  } from 'vue'
import { ElAutocomplete, ElButton, ElIcon, ElInputNumber, ElMessage, ElTooltip } from 'element-plus'
import { listSupplier } from "@/api/order/supplier"
import { listSkuByAddOrder, selectStockBySkuId } from "@/api/product/sku"
import { listBuyer } from "@/api/system/user"
import useUserStore from "@/store/modules/user"
import { h } from 'vue'
import { nextTick } from 'vue'
import { debounce } from 'lodash'
import { TableV2SortOrder } from 'element-plus'
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder, updatePurchaseOrderStatus } from "@/api/order/purchaseOrder";
import { useRouter, useRoute } from "vue-router";
import { getSkuValue } from '@/utils/ruoyi.js';

const router = useRouter();
const route = useRoute();

// *****************************  供应商 数据获取 start *****************************
// 供应商 - 初始化列表
const supplierList = ref([])
/** 供应商 - 获取列表 */
const getSuppliers = async () => {
    listSupplier()
      .then(response => {
        supplierList.value = response.rows || []
      })
      .catch(error => {
        ElMessage.error("获取供应商列表时出错:",error)
      })
};
getSuppliers()

// ******************************  供应商 数据获取 end *****************************
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
          size: 'small',
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
      const getTooltipContent = () => {return rowData.productSkuVo?.productCode || '';}
      if (form.value.orderStatus === OrderStatusEnum.EDIT) {
        return h(ElAutocomplete, {
          id: inputId,
          modelValue: rowData.productSkuVo?.productCode || '',
          'onUpdate:modelValue': (value) => {
            form.value.details[rowIndex].productSkuVo.productCode = value
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
            h('div', `${item.skuCode} - ${item.skuName}`),
            h('small',{style:{color:'#909399',marginLeft:'5px'}} ,`库存: ${item.averageCostBySkuVo?.currentStock || 0}`)
          ])
        })
      }
      // 非编辑状态，显示商品编码
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
      }
      )  
    }
  },
  {
    key: 'skuName',
    title: 'SKU名称',
    width: 150,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const getTooltipContent = () => {return rowData.productSkuVo?.skuName || '';}
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
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
      const getTooltipContent = () => {return rowData.productSkuVo?.skuCode || '';}
      return h(ElTooltip, {
        content: getTooltipContent(),
        placement: 'top'
      },{
        default: () => h('div', {style: {
          overflow: 'hidden',       // 隐藏溢出部分
          textOverflow: 'ellipsis', // 使用省略号
          whiteSpace: 'nowrap',     // 禁止换行
          cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } }, getTooltipContent())
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
      const skuValueArr =  getSkuValue(rowData.productSkuVo?.skuValue || [])
      if (skuValueArr === "default"){
        return h('span', ' -- -- ')
      } 
      return h('div', {}, skuValueArr.map(([key, value]) => {
        if (key !== '' && key !== 'skuName') {
          return h('div', [
            h('strong', `${key}:`),
            h('span', ` ${value}`)
          ])
        }
      }))
    }
  },
  {
    key: 'skuStock',
    title: '现存量',
    width: 75,
    align: 'right',
    sortable: true,  // 启用排序
    sortMethod: (a, b) => a.productSkuVo.skuStock - b.productSkuVo.skuStock, // 定义排序逻辑
    hidden: form.value.orderStatus !== OrderStatusEnum.EDIT,  // 控制列是否可见
    cellRenderer: ({ rowData }) => {
      return h('div', {style: {
        overflow: 'hidden',       // 隐藏溢出部分
        textOverflow: 'ellipsis', // 使用省略号
        whiteSpace: 'nowrap',     // 禁止换行
        cursor: 'pointer'         // 鼠标变成指针，增加交互提示
        } },rowData.productSkuVo?.skuStock || 0)  
    }
  },
  {
    key: 'skuUnit',
    title: '单位',
    width: 60,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      return rowData.unit?.unitCode || '--'
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
    cellRenderer: ({ rowData }) => `${formatTwo(rowData.purchaseAmount)} €`
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
    cellRenderer: ({ rowData }) => `${formatTwo(rowData.discountAmount)} €`
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
    cellRenderer: ({ rowData }) => `${formatTwo(rowData.taxAmount)} €`
  },
  {
    key: 'netAmount',
    title: '采购总金额',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }) => `${formatTwo(rowData.netAmount)} €`
  },
  {
    key: 'receivedQuantity',
    title: '入库数量',
    width: 100,
    align: 'right',
    hidden: form.value.orderStatus !== OrderStatusEnum.IN_PROGRESS && 
            form.value.orderStatus !== OrderStatusEnum.CLOSE_FOR_STOP,
    cellRenderer: ({ rowData }) => rowData.receivedQuantity
  },
  {
    key: 'shortageQuantity',
    title: '缺货数量',
    width: 100,
    align: 'right',
    hidden: form.value.orderStatus !== OrderStatusEnum.IN_PROGRESS && 
            form.value.orderStatus !== OrderStatusEnum.CLOSE_FOR_STOP,
    cellRenderer: ({ rowData }) => rowData.shortageQuantity
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
  isKeyScrolling.value = false;
}, 2);

/** 鼠标滚动 焦点处理 */
const handleScroll = () => {
    if (isKeyScrolling.value) {
      debouncedScroll()  
    } else {
      // 手动滚动才移除焦点
      hiddenInput.value.focus(); 
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
  if (!container) return;
  container.addEventListener('touchstart', addTouchClass, { passive: true });
  container.addEventListener('touchend', removeTouchClass, { passive: true });
};
const removeTouchEventListeners = () => {
  const container = document.querySelector('#touch-scroll-container');
  if (!container) return;
  container.removeEventListener('touchstart', addTouchClass);
  container.removeEventListener('touchend', removeTouchClass);
};
//**************************** 解决虚拟表格 触屏滚动的问题 end 备用 ****************/

/** 组件挂载后初始化设置 */ 
onMounted(() => {
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

// 订单状态颜色
const OrderStatusColor = {
  '0':'info',
  '1':'primary',
  '2':'warning',
  '3':'success',
  '4':'warning',
  '5':'success',
  '6':'danger',
}

// 订单状态描述
const OrderStatusName = {
  '0':'草稿',
  '1':'已保存',
  '2':'待审核',
  '3':'已审核',
  '4':'进行中',
  '5':'已完成',
  '6':'已关闭',
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
  RESTART: 'restart'
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    edit: 'info',
    save: 'primary',
    submitApproval: 'warning',
    approve: 'success',
    reject: 'danger',
    unApprove: 'danger',
    closeForStop: 'danger',
    restart:'warning'
  }
  return typeMap[actionValue] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OrderOperateType.APPROVE]: '审核意见',
    [OrderOperateType.REJECT]: '驳回原因',
    [OrderOperateType.UN_APPROVE]: '反审核原因',
    [OrderOperateType.CLOSE_FOR_STOP]: '关闭原因',
    [OrderOperateType.RESTART]: '重启原因'
  };
  return messages[action] || '备注';
}

// 允许最大订单条数
const maxLength = 500
// 每次添加新增的条数
const onceAddItemLength = 5

const data = reactive({
  form:{
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
    operateType: '',
    remark: '',
    details: [],
    operateLog: '',
  },
  rules:{
    orderDate: [
    { required: true, message: '请选择订单日期' , trigger: ['blur','change'] }
    ],
    supplierId: [
      { required: true, message: '请选择供应商' , trigger: ['blur','change'] }
    ],
    buyerId: [
      { required: true, message: '请选择采购员' , trigger: ['blur','change'] }
    ],
  }
})

const {form, rules} = toRefs(data)

const resetForm = () => ({
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
    operateType: '',
    remark: '',
    details: [],
    operateLog: '',
})

// ******************************  数据展示  start **************************
/** 格式化金额 - 通过Math.round处理小数点精度(5不进位的BUG) */ 
function formatTwo(value) {
  // 首先检查是否为有效的有限数字
  if (!Number.isFinite(Number(value))) {
    return "0.00";
  }
  // 然后进行四舍五入和格式化
  return (Math.round(Number(value) * 100) / 100).toFixed(2);
};

// 采购员 - 初始化列表
const buyerList = ref([])
/** 采购员 - 获取列表 */
const getBuyers = () => {
  listBuyer().then(response => {
    buyerList.value = response.rows || []
  })
}

// ******************************  数据展示  end ****************************

// **********************  商品 数据模糊查询处理 start ********************
// 商品 - 初始化商品列表
const skuList = ref([])
/** 商品 - 获取列表 */
const getSkuList = () => {
  listSkuByAddOrder().then(response => {
    skuList.value = response.rows || []
    console.log("----------商品列表：",skuList.value)
    
  })
}
/** 商品 -  自动补全输入框的返回值 */
const queryProducts = (queryString, cb) => {
  const results = queryString ? skuList.value.filter(sku =>
      (sku.skuCode && sku.skuCode.toLowerCase().includes(queryString.toLowerCase())) ||
      (sku.skuName && sku.skuName.toLowerCase().includes(queryString.toLowerCase())) ||
      (sku.productCode && sku.productCode.toLowerCase().includes(queryString.toLowerCase()))
    ) : []
    console.log("商品搜索结果：",results)
  cb(results || [])
}
/** 商品 -  选择后调用的赋值操作 */
const handleProductSelect = (sku, index) => {
  // 切换 自动聚焦单元格的编辑状态
  isAutocompleteEdit.value = false;

  const item = form.value.details[index]
  item.skuId = sku.skuId
  item.productSkuVo = {
    skuId: sku.skuId,
    skuCode: sku.skuCode,
    skuValue: sku.skuValue,
    skuName: sku.skuName,
    productCode: sku.productCode,
    unitId: sku.unitId,
    skuStock: sku.averageCostBySkuVo?.currentStock || 0,
  }
  item.unit = sku.unitVo
  console.log("选择的结果：",item)
}
/** 商品 -  失去焦点后 判断输入框中的内容与列表是否匹配 不匹配说明只修改没有选择操作 所以清空 */ 
const handleProductOnBlur = (index) => {
  // 移除焦点
  currentFocus.value = null;
  isAutocompleteEdit.value = true;
  if(skuList.value.length === 0){
    initializeEmptyDetail(index);
    return;
  }
  const matchedSku = skuList.value.find(sku => sku.productCode === form.value.details[index].productSkuVo?.productCode || '');
  if(!matchedSku){
    initializeEmptyDetail(index);
    ElMessage.error('提示：输入的内容不存在，清空输入框内容！');
    return;
  }
  if (matchedSku.productCode !== form.value.details[index].productSkuVo.productCode) {
    initializeEmptyDetail(index);
    ElMessage.error('提示：没有选择或回车确认，清空输入框内容！');
    return;
  }
};
// 初始化
const initializeEmptyDetail = (index) => {
  form.value.details[index].skuId = ''
  form.value.details[index].productSkuVo = {
    skuId: null,
    skuCode: null,
    skuValue: null,
    skuName: null,
    productCode: null,
    unitId: null,
    skuStock: 0,
  }
  form.value.details[index].unit = {
    unitId: null,
    unitCode: null,
  }
  form.value.details[index].unitPrice = 0
  form.value.details[index].quantity = 0
  form.value.details[index].purchaseAmount = 0
  form.value.details[index].discountRate = 0
  form.value.details[index].discountAmount = 0
  form.value.details[index].taxRate = 0
  form.value.details[index].taxAmount = 0
  form.value.details[index].netAmount = 0
  form.value.details[index].shortageQuantity = 0
  form.value.details[index].receivedQuantity = 0
}

/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => ({
    detailId: '',
    skuId: '',
    productSkuVo : {
      skuId: null,
      skuCode: null,
      skuValue: null,
      skuName: null,
      productCode: null,
      unitId: null,
      skuStock: 0,
    },
    unit:{
      unitId: null,
      unitCode: null,
    },
    unitPrice: 0,
    quantity: 0,
    purchaseAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    netAmount: 0,
    shortageQuantity: 0,
    receivedQuantity: 0,
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
  item.shortageQuantity = item.quantity - item.receivedQuantity  // 更新缺货数量
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
    console.log(form.value.details)
    if(form.value.details.length === 0){
      ElMessage.error("请输入采购商品信息!")
      return;
    }
    
    // 2 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.details)) {
      return;
    }
    
    // 3 检查是否存在相同的skuId+unitPrice  true存在相同的skuId
    if (checkHaveSameSkuIdAndPrice(form.value.details)) {
      return;
    }
    

    // 4 提交表单
    openApprovalDialog('保存订单', OrderOperateType.SAVE)
  })
  
}
/** 检查采购条目的必输项 */
const validateItems = (submitItems) => {
  for (const item of submitItems) {
    if (item.quantity == null) {
      ElMessage.error("采购明细 数量不能为空!");
      return false;
    }
    
    if (item.unitPrice == null) {
      ElMessage.error("采购明细 采购单价不能为空!");
      return false;
    }
    
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

/** 检查采购条目是否有相同的skuId+unitPrice */
const checkHaveSameSkuIdAndPrice = (submitItems) => {
  const skuChecker = new Set();
  const skuPriceChecker = new Set();

  for (const item of submitItems) {
    // 检查价格大于0的只能由唯一的sku
    if (item.unitPrice > 0) {
      let skuKey = item.skuId.toString();
      if (skuChecker.has(skuKey)) {
        ElMessage.error("价格大于 0 的商品明细 sku 重复，请检查！");
        return true;
      }
      skuChecker.add(skuKey);
    }

    // 检查采购明细是否重复(只有价格为0的skuId可以重复)
    let skuPriceKey = item.skuId.toString() + item.unitPrice.toString();
    if (skuPriceChecker.has(skuPriceKey)) {
      ElMessage.error("商品明细 sku 单价 重复，请检查！");
      return true;
    }
    skuPriceChecker.add(skuPriceKey);
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

const handleReStart = () => {
  openApprovalDialog('重新启用订单', OrderOperateType.RESTART)
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 导出 */
const handleExport = () => {
  console.log("************* 点击导出 ")
}

/** 刷新现存量 */
const handleRefreshStock = async () => {
  await Promise.all(
    form.value.details.map(async (item) => {
      if (item.skuId){
        const res = await selectStockBySkuId(item.skuId)
        item.productSkuVo.skuStock = res.data || 0
      } else {
        item.skuStock = 0
      }
    })
  );
  ElMessage.success('刷新现存量成功！')
};

// **************************    操作  end ********************************

// ************************** 审核记录 + 提示弹窗 start ******************
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
// 订单操作记录
const orderOperateLog = ref([])
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue: actionValue || ''
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

/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = orderOperateLog.value
}

 /** 提交数据预处理 */ 
const prepareData = () => {
  form.value.operateLog = JSON.stringify(orderOperateLog.value);
};

/** 提交数据错误处理函数 */ 
const handleError = (message = "操作失败") => {
  // 恢复 operateLog 的Json格式
  parseJson();
  ElMessage.error(message);
  // 关闭对话框和加载状态
  dialogVisible.value = false;
  RefreshTab()
};

const actionRequiresRemark = [OrderOperateType.APPROVE, OrderOperateType.REJECT, OrderOperateType.UN_APPROVE, OrderOperateType.CLOSE_FOR_STOP, OrderOperateType.RESTART];
const actionRequiresNoRemark = [OrderOperateType.EDIT, OrderOperateType.SAVE, OrderOperateType.DELETE, OrderOperateType.SUBMIT_APPROVAL];
/** 采购订单提交操作 */ 
const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 3 定义动作及相应状态
  const actions = {
    [OrderOperateType.SAVE]: {
      status: OrderStatusEnum.SAVE,
      message: '保存成功',
      actionValue: OrderOperateType.SAVE
    },
    [OrderOperateType.EDIT]: {
      status: OrderStatusEnum.EDIT,
      message: '开始编辑',
      actionValue: OrderOperateType.EDIT
    },
    [OrderOperateType.SUBMIT_APPROVAL]: {
      status: OrderStatusEnum.SUBMIT_APPROVAL,
      message: '提交审核 成功!',
      actionValue: OrderOperateType.SUBMIT_APPROVAL
    },
    [OrderOperateType.APPROVE]: {
      status: OrderStatusEnum.APPROVE,
      message: '审核通过!',
      actionValue: OrderOperateType.APPROVE
    },
    [OrderOperateType.REJECT]: {
      status: OrderStatusEnum.SAVE,
      message: '驳回 成功!',
      actionValue: OrderOperateType.REJECT
    },
    [OrderOperateType.UN_APPROVE]: {
      status: OrderStatusEnum.SAVE,
      message: '反审核 成功!',
      actionValue: OrderOperateType.UN_APPROVE
    },
    [OrderOperateType.CLOSE_FOR_STOP]: {
      status: OrderStatusEnum.CLOSE_FOR_STOP,
      message: '关闭订单 成功!',
      actionValue: OrderOperateType.CLOSE_FOR_STOP
    },
    [OrderOperateType.RESTART]: {
      status: OrderStatusEnum.IN_PROGRESS,
      message: '重新启用订单 成功!',
      actionValue: OrderOperateType.RESTART
    }
  }

  const currentActionConfig = actions[currentAction.value]

  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.operateType = currentActionConfig.actionValue;
  form.value.orderStatus = currentActionConfig.status;
  form.value.operateLog = JSON.stringify(orderOperateLog.value);

  try {
    // 1 数据预处理 转json格式
    prepareData();

    // 4 后端 API调用
    if (currentAction.value === OrderOperateType.SAVE) {
      if (!form.value.orderId) {
        // 新增操作
        await addPurchaseOrder(form.value)
          .then( (res) => {
            form.value.orderId = res.data.orderId
            form.value.orderNo = res.data.orderNo
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("新增操作失败"));
      } else {
        // 修改操作
        await updatePurchaseOrder(form.value)
          // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("修改操作失败"));
      }
    } else {
      // 非保存操作
      await updatePurchaseOrderStatus(form.value)
        // 修改状态更新操作日志
        .then( () => {
          parseJson();
          ElMessage.success(currentActionConfig.message)
          RefreshTab()
        })
        .catch(() => handleError("修改操作失败"));
    }
  } catch (error) {
    console.log("API 调用异常:", error);
    ElMessage.error("API 调用异常，请重试");
  } finally {
    // 关闭对话框和加载状态
    dialogVisible.value = false;
  }
    
}

// 当前要关闭的 tabs
const view = {
  path: route.path,
  name: route.name,
  meta: route.meta,
};

/** 返回上一页 */
const goBack = () => {
  // 关闭当前 tab
  proxy.$tab.closePage(view).then(() => {
    // 跳转页面
    router.push({path: "/purchaseManage/purchaseOrder",});
  })
  
};

const RefreshTab = () => {
  // 刷新当前页
  getInfoById()
}

/** 通过修改传递的 orderId 获取商品信息 */
const getInfoById = async () => {
  // 获取修改传递的参数 productId
  const _orderId = route.query.orderId;
  console.log("获取到传递过来的ID_orderId", _orderId)
  if (!_orderId) {
    console.error("orderId 不能为空");
    return;
  }

  try {
    // 获取订单信息
    const response = await getPurchaseOrder(_orderId);
    form.value = response?.data || resetForm();

    // 处理 operateLog
    if (form.value.operateLog) {
      try {
        const parsedLog = JSON.parse(form.value.operateLog);
        orderOperateLog.value = parsedLog;
      } catch (error) {
        console.error("operateLog 解析失败:", error);
        orderOperateLog.value = [];
      }
    }

    console.log("初始化数据正常：", form.value);
  } catch (error) {
    console.error("获取订单信息失败:", error);
  }
}

onMounted(() => {
  getInfoById()
  addItem()
  // 组件挂载后设置初始焦点
  // if (tableData.value.length > 0) {
  //   moveFocus(0, 'productCode')
  // }
});

// ************************** 审核记录 + 提示弹窗 end ******************

getInfoById()
getSkuList()
getBuyers()
getSuppliers()

</script>

<style scoped lang="scss">
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许滚动 */
  padding: 0px;
  margin: 0px;

  .card-data{
    width: 100%;
    height: 100%;
    flex: 1;
    overflow-y: auto; /* 允许滚动 */
  }

  .card-operation-log{
    width: 100%;
    height: 150px;
    flex-shrink: 0;
    overflow-y: auto; /* 允许滚动 */

  }
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