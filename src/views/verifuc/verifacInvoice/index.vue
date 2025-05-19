<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" size="small">
      <el-form-item label="发票系列" prop="invoiceSerial">
        <el-input
          v-model="queryParams.invoiceSerial"
          placeholder="请输入发票系列"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票序号" prop="invoiceNumber">
        <el-input
          v-model="queryParams.invoiceNumber"
          placeholder="请输入发票序号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票类型" prop="invoiceType">
        <el-select v-model="queryParams.invoiceType" placeholder="请选择发票类型" clearable>
          <el-option
            v-for="dict in varifac_invoice_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发票状态" prop="invoiceStatus">
        <el-select v-model="queryParams.invoiceStatus" placeholder="请选择发票状态" clearable>
          <el-option
            v-for="dict in verifac_invoice_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开票日期" prop="issueDate">
        <el-date-picker clearable
          v-model="queryParams.issueDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开票日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="交易日期" prop="operationDate">
        <el-date-picker clearable
          v-model="queryParams.operationDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择交易日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="上传编号" prop="invoiceIdFactura">
        <el-input
          v-model="queryParams.invoiceIdFactura"
          placeholder="请输入上传编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户的Nif" prop="destinatarioNif">
        <el-input
          v-model="queryParams.destinatarioNif"
          placeholder="请输入客户的Nif"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="API处理状态" prop="invoiceEstado">
        <el-select v-model="queryParams.invoiceEstado" placeholder="请选择API处理状态" clearable>
          <el-option
            v-for="dict in verifac_invoice_status"
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
          v-hasPermi="['verifuc:verifacInvoice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['verifuc:verifacInvoice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button 
          type="warning" 
          plain 
          icon="Edit" 
          :disabled="multiple"
          @click="handleReSand"
          v-hasPermi="['rabbitmq:verifacInvoice:edit']"
        >重发</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['verifuc:verifacInvoice:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['verifuc:verifacInvoice:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="verifacInvoiceList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="订单号" align="center" prop="orderNo" min-width="120" show-overflow-tooltip/>
      <el-table-column label="发票类型" align="center" prop="invoiceTipo" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="varifac_invoice_type" :value="scope.row.invoiceTipo"/>
        </template>
      </el-table-column>
      <el-table-column label="发送状态" align="center" prop="invoiceStatus">
        <template #default="scope">
          <dict-tag :options="verifac_invoice_status" :value="scope.row.invoiceStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="发票系列" align="center" prop="invoiceSerie" />
      <el-table-column label="发票号" align="center" prop="invoiceNumero" />
      <el-table-column label="QR码" align="center" prop="invoiceQr" show-overflow-tooltip/>
      <el-table-column label="税额" align="center" prop="invoiceImporteImpuestos" />
      <el-table-column label="总金额(含税)" align="center" prop="invoiceImporteTotal" />
      <el-table-column label="API处理状态" align="center" prop="invoiceEstado"  />
      <el-table-column label="发票描述" align="center" prop="invoiceDescripcion" show-overflow-tooltip/>
      <el-table-column label="发票时间" align="center" prop="invoiceFecha" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ `${scope.row.invoiceFecha ?? ''} ${scope.row.invoiceHora ?? ''}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传编号" align="center" prop="invoiceIdFactura" />
      <el-table-column label="异常原因" align="center" prop="apiResponse"  show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template #default="scope">
          <el-button link type="primary" size="small" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['verifuc:verifacInvoice:edit']">修改</el-button>
          <el-button link type="primary" size="small" icon="Edit" @click="handleReSand(scope.row)" v-hasPermi="['rabbitmq:verifacInvoice:edit']" :disabled="invoiceIsSuccess(scope.row)">重发</el-button>
          <el-button link type="danger" size="small" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['verifuc:verifacInvoice:remove']">作废</el-button>
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

    <!-- 添加或修改verifac发票主对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="verifacInvoiceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联的订单ID" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入关联的订单ID" />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="发票编码" prop="invoiceCode">
          <el-input v-model="form.invoiceCode" placeholder="请输入发票编码" />
        </el-form-item>
        <el-form-item label="发票类型" prop="invoiceType">
          <el-select v-model="form.invoiceType" placeholder="请选择发票类型">
            <el-option
              v-for="dict in varifac_invoice_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发票前缀" prop="invoiceSerial">
          <el-input v-model="form.invoiceSerial" placeholder="请输入发票前缀" />
        </el-form-item>
        <el-form-item label="发票序号" prop="invoiceNumber">
          <el-input v-model="form.invoiceNumber" placeholder="请输入发票序号" />
        </el-form-item>
        <el-form-item label="发票状态" prop="invoiceStatus">
          <el-radio-group v-model="form.invoiceStatus">
            <el-radio
              v-for="dict in verifac_invoice_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="QR码" prop="qrUrl">
          <el-input v-model="form.qrUrl" placeholder="请输入QR码" />
        </el-form-item>
        <el-form-item label="发票描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入发票描述" />
        </el-form-item>
        <el-form-item label="开票日期" prop="issueDate">
          <el-date-picker clearable
            v-model="form.issueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择开票日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="交易日期" prop="operationDate">
          <el-date-picker clearable
            v-model="form.operationDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择交易日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="税额" prop="taxAmount">
          <el-input v-model="form.taxAmount" placeholder="请输入税额" />
        </el-form-item>
        <el-form-item label="总金额(含税)" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总金额(含税)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-divider content-position="center">verifac发票明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddVerifacInvoiceDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteVerifacInvoiceDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="verifacInvoiceDetailList" :row-class-name="rowVerifacInvoiceDetailIndex" @selection-change="handleVerifacInvoiceDetailSelectionChange" ref="verifacInvoiceDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="税务类型" prop="taxType" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.taxType" placeholder="请选择税务类型">
                <el-option
                  v-for="dict in verifac_tax_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="税率" prop="taxRate" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.taxRate" placeholder="请输入税率" />
            </template>
          </el-table-column>
          <el-table-column label="应税金额" prop="baseAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.baseAmount" placeholder="请输入应税金额" />
            </template>
          </el-table-column>
          <el-table-column label="税额" prop="taxAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.taxAmount" placeholder="请输入税额" />
            </template>
          </el-table-column>
          <el-table-column label="含税总额" prop="netAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.netAmount" placeholder="请输入含税总额" />
            </template>
          </el-table-column>
          <el-table-column label="租户ID" prop="tenantId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.tenantId" placeholder="请输入租户ID" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VerifacInvoice">
import { listVerifacInvoice, getVerifacInvoice, delVerifacInvoice, addVerifacInvoice, updateVerifacInvoice, resendApi } from "@/api/verifuc/verifacInvoice";
import useUserStore from "@/store/modules/user";
import { computed } from "vue";
import {InvoiceStatusEnum } from "./constants.js"
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { varifac_invoice_type, verifac_invoice_status, verifac_tax_type } = proxy.useDict('varifac_invoice_type', 'verifac_invoice_status', 'verifac_tax_type');

const verifacInvoiceList = ref([]);
const verifacInvoiceDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedVerifacInvoiceDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    orderNo: null,
    invoiceCode: null,
    invoiceType: null,
    invoiceSerial: null,
    invoiceNumber: null,
    invoiceStatus: null,
    issueDate: null,
    operationDate: null,
    tenantId: null
  },
  rules: {
    orderId: [
      { required: true, message: "关联的订单ID不能为空", trigger: "blur" }
    ],
    orderNo: [
      { required: true, message: "订单编号不能为空", trigger: "blur" }
    ],
    invoiceCode: [
      { required: true, message: "发票编码不能为空", trigger: "blur" }
    ],
    invoiceType: [
      { required: true, message: "发票类型不能为空", trigger: "change" }
    ],
    invoiceNumber: [
      { required: true, message: "发票序号不能为空", trigger: "blur" }
    ],
    issueDate: [
      { required: true, message: "开票日期不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "总金额(含税)不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 发票是否为成功状态 */
const invoiceIsSuccess = (row)=>{ 
  return row.invoiceStatus == InvoiceStatusEnum.SUCCESS;
};

/** 查询verifac发票主列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVerifacInvoice(queryParams.value).then(response => {
    verifacInvoiceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

/**
 * 重发按钮操作
*/ 
const handleReSand = (row) => {
  reset();
  const _id = row.id || ids.value
  resendApi(_id).then(response => {
    proxy.$modal.msgSuccess("重发成功");
    handleQuery();
  }).catch((e) => {
    proxy.$modal.msgError("重发失败", e.message);
    handleQuery();
  })
}

// 表单重置
function reset() {
  form.value = {
    invoiceId: null,
    orderId: null,
    orderNo: null,
    invoiceCode: null,
    invoiceType: null,
    invoiceSerial: null,
    invoiceNumber: null,
    invoiceStatus: null,
    qrUrl: null,
    description: null,
    issueDate: null,
    operationDate: null,
    taxAmount: null,
    totalAmount: null,
    verifacResponse: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    tenantId: null
  };
  verifacInvoiceDetailList.value = [];
  proxy.resetForm("verifacInvoiceRef");
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
  title.value = "添加verifac发票主";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _invoiceId = row.invoiceId || ids.value
  getVerifacInvoice(_invoiceId).then(response => {
    form.value = response.data;
    verifacInvoiceDetailList.value = response.data.verifacInvoiceDetailList;
    open.value = true;
    title.value = "修改verifac发票主";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["verifacInvoiceRef"].validate(valid => {
    if (valid) {
      form.value.verifacInvoiceDetailList = verifacInvoiceDetailList.value;
      if (form.value.invoiceId != null) {
        updateVerifacInvoice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVerifacInvoice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _invoiceIds = row.invoiceId || ids.value;
  proxy.$modal.confirm('是否确认删除verifac发票主编号为"' + _invoiceIds + '"的数据项？').then(function() {
    return delVerifacInvoice(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** verifac发票明细序号 */
function rowVerifacInvoiceDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** verifac发票明细添加按钮操作 */
function handleAddVerifacInvoiceDetail() {
  let obj = {};
  obj.taxType = "";
  obj.taxRate = "";
  obj.baseAmount = "";
  obj.taxAmount = "";
  obj.netAmount = "";
  obj.tenantId = "";
  verifacInvoiceDetailList.value.push(obj);
}

/** verifac发票明细删除按钮操作 */
function handleDeleteVerifacInvoiceDetail() {
  if (checkedVerifacInvoiceDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的verifac发票明细数据");
  } else {
    const verifacInvoiceDetails = verifacInvoiceDetailList.value;
    const checkedVerifacInvoiceDetails = checkedVerifacInvoiceDetail.value;
    verifacInvoiceDetailList.value = verifacInvoiceDetails.filter(function(item) {
      return checkedVerifacInvoiceDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleVerifacInvoiceDetailSelectionChange(selection) {
  checkedVerifacInvoiceDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('verifuc/verifacInvoice/export', {
    ...queryParams.value
  }, `verifacInvoice_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%; /* 确保父容器高度充满 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1; /* 表格区域充满剩余空间 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex-grow: 1; /* 表格充满剩余空间 */
}

.pagination {
  flex-shrink: 0; /* 分页栏固定在底部 */
  margin-top: auto; /* 将分页栏推到容器底部 */
}
</style>
