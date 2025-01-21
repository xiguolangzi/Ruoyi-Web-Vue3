<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="供应商名称:" prop="supplierId">
        <el-select
          v-model="queryParams.supplierId"
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
      <el-form-item label="发票号码:" prop="invoiceNo">
        <el-input
          v-model="queryParams.invoiceNo"
          placeholder="请输入发票号码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号码:" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票状态:" prop="invoiceStatus">
        <el-select v-model="queryParams.invoiceStatus" placeholder="请选择发票状态:未核销、已核销" clearable>
          <el-option
            v-for="dict in erp_purchase_invoice_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:purchaseInvoice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:purchaseInvoice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Stamp"
          :disabled="multiple"
          @click="handleAudited"
          v-hasPermi="['order:purchaseInvoice:audited']"
        >
          {{ '批量审核' }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Stamp"
          :disabled="multiple"
          @click="handleUnAudited"
          v-hasPermi="['order:purchaseInvoice:audited']"
        >
          {{ '批量反审核' }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:purchaseInvoice:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:purchaseInvoice:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseInvoiceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="50"/>
      <el-table-column label="发票号码" align="left" header-align="center" prop="invoiceNo"  min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <el-link :underline="false" type="primary" @click="handleView(scope.row)">{{ scope.row.invoiceNo }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="订单号码" align="left" header-align="center" prop="orderNo"  min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <el-link :underline="false" type="danger"  @click="handleView(scope.row)">{{ scope.row.orderNo }}</el-link>
         </template>
      </el-table-column>
      <el-table-column label="供应商" align="left" header-align="center" prop="supplierId" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ getSuppliersName(scope.row.supplierId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开票日期" align="center" prop="invoiceDate" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.invoiceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发票金额" align="right" header-align="center" prop="invoiceTotalBaseAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalBaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="发票税额" align="right" header-align="center" prop="invoiceTotalTaxAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalTaxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="发票总额" align="right" header-align="center" prop="invoiceTotalNetAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalNetAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="发票状态" align="center" prop="invoiceStatus">
        <template #default="scope">
          <dict-tag :options="erp_purchase_invoice_status" :value="scope.row.invoiceStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="入库单金额" align="right" header-align="center" prop="accountsPayable" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.accountsPayable) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="付款日期" align="center" prop="paymentDueDate" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.paymentDueDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已付金额" align="right" header-align="center" prop="paymentAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.paymentAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" header-align="center" prop="remark" min-width="100" show-overflow-tooltip/>
      <el-table-column label="上传附件" align="left" header-align="center" prop="uploadedFile" min-width="150" show-overflow-tooltip>
        <template v-slot="scope">
          <el-text class="el-icon-document" truncated type="primary">{{ getFileName(scope.row.uploadedFile) }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" min-width="100" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" min-width="100" show-overflow-tooltip/>
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改采购发票对话框 -->
    <el-dialog :title="title" v-model="open" width="50%" append-to-body :show-close="false" :close-on-click-modal="false">
      <template #header="{ titleId, titleClass }">
        <div class="header-content">
          <div class="header-title">
            <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
            <dict-tag :options="erp_purchase_invoice_status" :value="form.invoiceStatus" />
          </div>
          <div class="header-actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="mr-4">
              <!-- 草稿状态 -->
              <el-button type="primary" 
                @click="submitForm" :loading="loading" v-if="form.invoiceStatus == InvoiceStatusEnum.INVOICE_STATUS_DRAFT"
                v-hasPermi="['order:purchaseInvoice:edit']"
              >
                保存
              </el-button>
              <el-button type="danger" 
                @click="handleDialogDelete" :loading="loading" v-if="form.invoiceStatus == InvoiceStatusEnum.INVOICE_STATUS_DRAFT && insertStatus == false"
                v-hasPermi="['order:purchaseInvoice:remove']"
              >
                删除
              </el-button>

              <!-- 未审核状态 -->
              <el-button type="primary" 
                @click="handleDialogAudited" :loading="loading" v-if="form.invoiceStatus == InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED"
                v-hasPermi="['order:purchaseInvoice:audited']"
              >
                审核
              </el-button>
              <el-button type="warning" 
                @click="handleDialogContinueEdit" :loading="loading" v-if="form.invoiceStatus == InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED"
                v-hasPermi="['order:purchaseInvoice:edit']"
              >
                继续编辑
              </el-button>

              <!-- 审核状态 -->
               <el-button type="danger" 
                @click="handleDialogUnAudited" :loading="loading" v-if="form.invoiceStatus == InvoiceStatusEnum.INVOICE_STATUS_AUDITED"
                v-hasPermi="['order:purchaseInvoice:audited']"
              >
                反审核
              </el-button>

            </el-button-group>
            <el-button type="danger" @click="cancel">
              <el-icon class="el-icon--left">
                <CircleCloseFilled />
              </el-icon>
              退出
            </el-button>
          </div>
        </div>
        
      </template>
      <el-form ref="purchaseInvoiceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="供应商ID" prop="supplierId">
          <el-select
            v-model="form.supplierId"
            filterable
            clearable
            placeholder="请选中供应商"
            style="width: 150px"
            :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"
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
        <el-form-item label="发票号码" prop="invoiceNo" style="width: 80%;">
          <el-input v-model="form.invoiceNo" placeholder="请输入发票号码" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"/>
        </el-form-item>
        <el-form-item label="订单号码" prop="orderNo" style="width: 80%;">
          <el-input v-model="form.orderNo" placeholder="请输入订单号码" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"/>
        </el-form-item>
        <el-row>
          <el-form-item label="开票日期" prop="invoiceDate">
            <el-date-picker 
              clearable
              v-model="form.invoiceDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开票日期"
              :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="付款日期" prop="paymentDueDate">
            <el-date-picker 
              clearable
              v-model="form.paymentDueDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择付款日期"
              :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"
            >
            </el-date-picker>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="发票金额" prop="invoiceTotalBaseAmount" >
            <el-input-number v-model="form.invoiceTotalBaseAmount" placeholder="请输入发票金额" :controls="false" :precision="2" @change="calculateTotalAmount" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT">
              <template #suffix >
                <span> €</span>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="发票税额" prop="invoiceTotalTaxAmount">
            <el-input-number v-model="form.invoiceTotalTaxAmount" placeholder="请输入发票税额" :controls="false" :precision="2" @change="calculateTotalAmount" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT">
              <template #suffix >
                <span> €</span>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="发票总额" prop="invoiceTotalNetAmount">
            <el-input-number v-model="form.invoiceTotalNetAmount" placeholder="请输入发票总额" disabled :controls="false" :precision="2" >
              <template #suffix >
                <span> €</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-row>
        
        
       
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" show-word-limit :maxlength="30" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT"/>
        </el-form-item>
        <el-form-item label="上传附件" prop="uploadedFile" :disabled="form.invoiceStatus !== InvoiceStatusEnum.INVOICE_STATUS_DRAFT">
          <file-upload v-model="form.uploadedFile" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup name="PurchaseInvoice">
import { listPurchaseInvoice, getPurchaseInvoice, delPurchaseInvoice, addPurchaseInvoice, updatePurchaseInvoice, auditPurchaseInvoice, unAuditPurchaseInvoice, continueEditPurchaseInvoice } from "@/api/order/purchaseInvoice";
import useUserStore from "@/store/modules/user";
import { listSupplier } from "@/api/order/supplier"
import { ref } from "vue";
import { ElMessage } from "element-plus";



// 租户ID字段过滤使用
const userStore = useUserStore();
const { proxy } = getCurrentInstance();
const { erp_purchase_invoice_status } = proxy.useDict('erp_purchase_invoice_status');

const purchaseInvoiceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const insertStatus = ref(false);

/** 自定义校验规则 */ 
const validateOneRequired = (rule, value, callback) => {
  const { invoiceNo, orderNo } = form.value
  if (!invoiceNo && !orderNo) {
    callback(new Error('发票号和订单号必须至少填写一个!'))
  } else {
    callback()
  }
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    supplierId: null,
    invoiceNo: null,
    orderNo: null,
    invoiceStatus: null,
    tenantId: null,
  },
  rules: {
    invoiceNo: [
      { validator: validateOneRequired, trigger: "blur" }
    ],
    orderNo: [
      { validator: validateOneRequired, trigger: "blur" }
    ],
    supplierId: [
      { required: true, message: "供应商ID不能为空", trigger: "blur" }
    ],
    invoiceDate: [
      { required: true, message: "开票日期不能为空", trigger: "blur" }
    ],
    invoiceTotalBaseAmount: [
      { required: true, message: "发票金额不能为空", trigger: "blur" }
    ],
    paymentDueDate: [
      { required: true, message: "付款日期不能为空", trigger: "blur" }
    ],
  
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 发票状态 */ 
const InvoiceStatusEnum = {
  // 草稿
  INVOICE_STATUS_DRAFT: '1',
  // 待审核
  INVOICE_STATUS_WAIT_AUDITED: '2',
  // 已审核
  INVOICE_STATUS_AUDITED: '3',
  // 已核销
  INVOICE_STATUS_WRITE: '4',
}

/** 查询采购发票列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listPurchaseInvoice(queryParams.value).then(response => {
    purchaseInvoiceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取文件名称 */ 
function getFileName(filePaths) {
  // 如果是url那么取最后的名字 如果不是直接返回
  if (filePaths != null) {
    return filePaths.split(",").map((path) => path.split("/").pop());
  } else {
    return filePaths;
  }
}

/** 查看发票详情 */
const handleView = (row) =>{
  reset();
  const _invoiceId = row.invoiceId || ids.value
  getPurchaseInvoice(_invoiceId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "查看采购发票详情";
  });
}

// **************************** 获取供应商数据 start ****************************************
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
const getSuppliersName = (id) => {
  return supplierList.value.find(supplier => supplier.supplierId === id)?.supplierName || '--'
 }

 // **************************** 获取供应商数据 end ****************************************

 // **************************** 操作 start ****************************************

// 表单重置
function reset() {
  form.value = {
    invoiceId: null,
    supplierId: null,
    invoiceNo: null,
    invoiceDate: null,
    invoiceTotalBaseAmount: null,
    invoiceTotalTaxAmount: null,
    invoiceTotalNetAmount: null,
    invoiceStatus: '1',
    accountsPayable: null,
    paymentDueDate: null,
    paymentAmount: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    uploadedFile: null
  };
  proxy.resetForm("purchaseInvoiceRef");
}

/** 金额计算 */
const calculateTotalAmount = () => {
  form.value.invoiceTotalNetAmount = form.value.invoiceTotalBaseAmount + form.value.invoiceTotalTaxAmount;
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.invoiceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  insertStatus.value = true;
  title.value = "添加采购发票";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _invoiceId = row.invoiceId || ids.value
  getPurchaseInvoice(_invoiceId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购发票";
  });
}

/** 批量审核操作 */
function handleAudited(row) {
  const _invoiceIds = row.invoiceId || ids.value
  proxy.$modal.confirm('是否确认 批量审核 所选中的数据?')
  .then(function() {
    return auditPurchaseInvoice(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("审核成功");
  }).catch(()=> {});
}

/** 批量反审核操作 */
function handleUnAudited(row) {
  const _invoiceIds = row.invoiceId || ids.value
  proxy.$modal.confirm('是否确认 批量反审核 所选中的数据?')
  .then(function() {
    return unAuditPurchaseInvoice(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("审核成功");
  }).catch(()=> {});
}

/** 批量删除按钮操作 */
function handleDelete(row) {
  const _invoiceIds = row.invoiceId || ids.value;
  proxy.$modal.confirm('是否确认 批量删除 所选中的数据?')
  .then(function() {
    return delPurchaseInvoice(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/purchaseInvoice/export', {
    ...queryParams.value
  }, `purchaseInvoice_${new Date().getTime()}.xlsx`)
}

 // **************************** 操作 end ****************************************

// **************************** dialog操作 start ****************************************
 /** /** 编辑界面 - 保存 */
function submitForm() {
  proxy.$refs["purchaseInvoiceRef"].validate(valid => {
    if (valid) {
      form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED
      if (form.value.invoiceId != null) {
        updatePurchaseInvoice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseInvoice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

// 退出按钮
function cancel() {
  open.value = false;
  insertStatus.value = false;
  reset();
}

/** 编辑界面 - 删除 */
const handleDialogDelete = () => {
  const nowNo = form.value.invoiceNo ? '是否确认删除 发票号 为 "' + form.value.invoiceNo  + '" 的采购发票？' : '是否确认删除 订单号 为 "' + form.value.orderNo + '" 的采购订单？';
  proxy.$modal.confirm(nowNo).then(function() {
    return delPurchaseInvoice(form.value.invoiceId);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
    open.value = false;
    getList();
  }).catch(() => {});

}

/** 编辑界面 - 审核 */
const handleDialogAudited = () => {
  if(form.value.invoiceId){
    auditPurchaseInvoice(form.value.invoiceId)
      .then(response => {
        ElMessage.success("审核成功")
        getList();
        form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_AUDITED
      })
      .catch(error => {
        ElMessage.error(error.message ? error.message : '操作失败');
      });
  }

}

/** 编辑界面 - 反审核 */
const handleDialogUnAudited = () => {
  if(form.value.invoiceId){
    unAuditPurchaseInvoice(form.value.invoiceId)
      .then(response => {
        ElMessage.success("反审核成功")
        getList();
        form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED
      })
      .catch(error => {
        ElMessage.error(error.message ? error.message : '操作失败');
      });
  }
}

/** /** 编辑界面 - 继续编辑 */ 
const handleDialogContinueEdit = () => {
  if(form.value.invoiceId){
    continueEditPurchaseInvoice(form.value.invoiceId)
      .then(response => {
        ElMessage.success("继续编辑成功")
        getList();
        form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_DRAFT
      })
      .catch(error => {
        ElMessage.error(error.message ? error.message : '操作失败');
      });
  } 
}


// **************************** dialog操作 end ****************************************

getList();
</script>

<style lang="scss" scoped>
 /* 头部样式 */
.header-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
}
</style>
