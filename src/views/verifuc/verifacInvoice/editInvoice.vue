<!-- Detail.vue -->
<template>
  <div class="app-container">
    <el-card class="card-data" size="small">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>FACTURA</h2>
            <dict-tag :options="varifac_invoice_type" :value="form.invoiceTipo" />
            <dict-tag :options="verifac_invoice_status" :value="form.invoiceStatus" />
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 - 不开启库位 -->
            <el-button-group class="ml-4">
              <!-- 初始状态 -->
              <el-button type="primary" :disabled="canEditStatus"
                @click="handleEdit" v-hasPermi="['sales:verifacInvoice:add','sales:verifacInvoice:edit']">
                继续编辑
              </el-button>
              <el-button type="success"  :disabled="!canEditStatus"
                @click="handleSaveEdit" v-hasPermi="['sales:verifacInvoice:add','sales:verifacInvoice:edit']">
                保存
              </el-button>
              <el-button type="danger"  :disabled="!canEditStatus"
                @click="handleVoided" v-hasPermi="['sales:verifacInvoice:add','sales:verifacInvoice:edit']">
                作废
              </el-button>
            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
              <el-tooltip content="退出编辑" effect="dark" placement="bottom">
                <el-button icon="Close" type="danger" @click="goBack"> 退出编辑 </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>
      </template>
      <!-- 发票信息 -->
      <el-row class="header-container">
        <!-- 发票信息 -->
        <el-col :span="8" class="facturaData"> 
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="Número de factura:" >
              <span class="highlight-text">{{form.invoiceSerie + '-' + form.invoiceNumero}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Fecha de factura:" >
              <span class="highlight-text">{{form.invoiceFecha || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="pedito de factura:" >
              <span class="highlight-text">{{form.orderNo}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Fecha de vencimiento:" >
              <el-date-picker
                v-model="form.invoiceDueDate"
                type="date"
                format="MM/DD/YYYY"
                placeholder="Pick a day"
                size="small"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <!-- 客户信息 -->
        <el-col :span="8" class="customer"> 
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="客户名称:" >
              <CustomerSelect v-model="form.destinatarioNombre" @selectedData="selectedCustomerData" size="small"
        :disabled="form.orderStatus != InvoiceStatusEnum.SUCCESS" />
            </el-descriptions-item>
            <el-descriptions-item label="税号:" >
                <span class="highlight-text">{{form.destinatarioNif || '--'}}</span>
                <dict-tag :options="invoice_regimen" :value="form.destinatarioRegimen" />
                <dict-tag :options="invoice_calificacion" :value="form.destinatarioCalifacation" />
            </el-descriptions-item>
            <el-descriptions-item label="手机:" >
              <span class="highlight-text">{{form.destinatarioPhone || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="邮箱:" >
              <span class="highlight-text">{{form.destinatarioPEmail || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="地址:" >
              <span class="highlight-text">{{form.destinatarioAddressCountry + ' ' + form.destinatarioAddressProvince + ' ' + form.destinatarioPostcode  + ' ' + form.destinatarioAddressDetail }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <!-- 公司信息 -->
        <el-col :span="8" class="mainData"> 
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="公司名称:" >
              <span class="highlight-text">{{form.emisorNombre || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="税号:" >
              <span class="highlight-text">{{form.emisorNif || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="手机:" >
              <span class="highlight-text">{{form.emisorPhone || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="邮箱:" >
              <span class="highlight-text">{{form.emisorEmail || '--'}}</span>
            </el-descriptions-item>
            <el-descriptions-item label="地址:" >
              <span class="highlight-text">{{form.emisorAddressCountry + ' ' + form.emisorAddressProvince + ' ' + form.emisorPostcode  + ' ' + form.emisorAddressDetail }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      <el-descriptions :column="2" size="small" style="width: 100%" >
        <el-descriptions-item label="Descripcion de factura:" >
          <el-input v-model="form.invoiceDescripcion" placeholder="请输入发票描述" size="small" type="text" maxlength="200" show-word-limit :rows="1" style="width: 80%"/>
        </el-descriptions-item>
        <el-descriptions-item label="remark de factura:" :span="2">
          <el-input v-model="form.remark" placeholder="请输入备注" size="small" type="text" maxlength="200" show-word-limit :rows="1" style="width: 80%"/>
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="verifacInvoiceRef" :model="form" :rules="rules" label-width="120px" size="small"
        :disabled="!canEditStatus">

        <!-- 基本信息 -->

        <!-- 商品明细 -->
        <el-table class="table-container"  :data="form.salesOrderDetailList" size="small">
          <el-table-column  label="Codigo"  align="center">
            <template #default="scope">
              <span> {{ scope.row.skuCode }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="Producto\Servicio"  align="center">
            <template #default="scope">
              <span> {{ scope.row.skuName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Base imponible(IVA exclueda)"  align="center">
            <template #default="scope"> 
              <span>{{ formatTwo(scope.row.detailBaseAmount) + ' €' }}  </span> 
            </template> 
          </el-table-column>
          <el-table-column label="Tipo de IVA%"  align="center">
            <template #default="scope"> 
              <span>{{ formatTwo(scope.row.detailTaxRate) + ' %'}}  </span> 
            </template> 
          </el-table-column>
          <el-table-column label="Importe de IVA"  align="center">
            <template #default="scope"> 
              <span>{{ formatTwo(scope.row.detailTaxAmount) + ' €'}}  </span> 
            </template> 
          </el-table-column>
          <el-table-column label="Importe total"  align="center">
            <template #default="scope"> 
              <span>{{ formatTwo(scope.row.detailNetAmount) + ' €'}}  </span> 
            </template> 
          </el-table-column>
        </el-table>
      </el-form>

      <!-- 合计信息 -->
      <template #footer>
        <div class="fixed-footer">
          <el-row class="footer-row">
            <!-- 第1个区域：税率明细 -->
            <el-col class="footer-col" :span="12">
              <div class="footer-content">
                <el-table class="table-container"  :data="form.verifacInvoiceDetailList" size="small">
                  <el-table-column prop="detailBase" label="Base" align="center" min-width="80">
                    <template #default="scope"> 
                      <span>{{ formatTwo(scope.row.detailBase) + ' €' }} </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailTipoIva" label="IVA%" align="center" min-width="50">
                    <template #default="scope"> 
                      <span>{{ (scope.row.detailTipoIva || 0 )+ ' %' }} </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailCuotaIva" label="IVA" align="center" min-width="80">
                    <template #default="scope"> 
                      <span>{{ formatTwo(scope.row.detailCuotaIva) + ' €' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailTipoRe" label="RE%" align="center" min-width="50">
                    <template #default="scope"> 
                      <span>{{ (scope.row.detailTipoRe || 0 )  + ' %' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailCuotaRe" label="RE" align="center" min-width="80">
                    <template #default="scope"> 
                      <span>{{ formatTwo(scope.row.detailCuotaRe) + ' €' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailSumaTotal" label="Total" align="center" min-width="80">
                    <template #default="scope"> 
                      <span>{{ formatTwo(scope.row.detailSumaTotal) + ' €' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>

            <!-- 第2个区域：订单统计数据 -->
            <el-col class="footer-col" :span="8">
              <div class="footer-content">
                <el-descriptions :column="3" size="small" direction="vertical"  style="margin-top: 10px;">
                  <el-descriptions-item label="Importe base:" >
                    <span class="highlight-text">{{ formatTwo(form.orderBaseAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="Importe impuestos:">
                    <span class="highlight-text">{{ formatTwo(form.invoiceImporteImpuestos) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="Importe total:"  class-name="total-label" label-class-name="total-content2">
                    <span style="font-size: 24px;">{{ formatTwo(form.invoiceImporteTotal) + ' €'}}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical" ></div>
            <!-- 第3个区域：二维码 -->
            <el-col class="footer-col" :span="3" >
              <div class="qrcode">
                <a 
                  v-if="form.invoiceQr" 
                  :href="form.invoiceQr" 
                  target="_blank"
                >
                  <qrcode-vue 
                    :value="form.invoiceQr || null" 
                    :size="120" 
                    level="H"
                  />
                </a>
                <el-empty v-else :image-size="40" style="padding: 0px;margin: 0px;" />
                <dict-tag :options="varifac_invoice_type" :value="form.invoiceTipo" />
              </div>
            </el-col>

          </el-row>
        </div>
      </template>
    </el-card>

    <!-- 订单操作记录 -->
    <el-collapse class="card-operation-log">
      <el-collapse-item name="1">
        <template #title>
          <h3 style="margin-left: 20px;">订单操作记录</h3>
        </template>
        <div>
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in operateLog" :key="index"
              :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
              {{ activity.operator }} - {{ activity.action }}
              <span v-if="activity.remark"> - - 描述 : </span>
              <span class="remark">{{ activity.remark }}</span>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <!-- 强制填写备注 -->
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="getRemarkMessage(currentAction) + ':'"
          v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20"
            :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
      </el-form>
      <!-- 不强制填写备注 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOperate">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { onMounted, ref  } from 'vue'
import { ElMessage } from 'element-plus'
import { listVerifacInvoice, getVerifacInvoice, delVerifacInvoice, addVerifacInvoice, updateVerifacInvoice, resendApi } from "@/api/verifuc/verifacInvoice";
import useUserStore from "@/store/modules/user"
import { useRouter, useRoute } from "vue-router";
import { InvoiceTypeEnum, InvoiceStatusEnum } from '@/views/verifuc/verifacInvoice/invoiceConstants.js';
import { orderInTaxEnum} from '@/views/sales/salesOrder/cashOperationUtil/tenantConfigEnum.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { varifac_invoice_type, verifac_invoice_status, invoice_regimen, invoice_calificacion } = proxy.useDict('varifac_invoice_type', 'verifac_invoice_status', 'invoice_regimen', 'invoice_calificacion');

/** 是否允许编辑 */
const canEditStatus = ref(false)

const data = reactive({
  form:{
    salesOrderDetailList: [],
    verifacInvoiceDetailList: []
  },
  rules:{
    orderInitNo: [
    { required: true, message: '初始订单号不能为空！' , trigger: ['blur','change'] }
    ],
  }
})

const {form, rules} = toRefs(data)

function reset() {
  form.value = {
    invoiceId: null,
    invoiceOperacion: null,
    invoiceStatus: InvoiceStatusEnum.UNSENT,
    orderId: null,
    orderNo: null,
    orderBaseAmount: null,
    orderTaxAmount: null,
    orderNetAmount: null,
    emisorNif: null,
    emisorNombre: null,
    emisorEmail: null,
    emisorPhone: null,
    emisorPostcode: null,
    emisorAddressCountry: null,
    emisorAddressProvince: null,
    emisorAddressDetail: null,
    customerId: null,
    destinatarioNif: null,
    destinatarioNombre: null,
    destinatarioEmail: null,
    destinatarioPhone: null,
    destinatarioPostcode: null,
    destinatarioAddressCountry: null,
    destinatarioAddressProvince: null,
    destinatarioAddressDetail: null,
    destinatarioRegimen: null,
    destinatarioCalifacation: null,
    invoiceIdFactura: null,
    invoiceTipo: InvoiceTypeEnum.COMPLETA,
    invoiceSerie: null,
    invoiceNumero: null,
    invoiceFecha: null,
    invoiceHora: null,
    invoiceImporteImpuestos: 0,
    invoiceImporteTotal: 0,
    invoiceDescripcion: null,
    invoiceEstado: null,
    invoiceQr: null,
    invoiceMillisegundos: null,
    apiResponse: null,
    verifacInvoiceDetailList: [],
    salesOrderDetailList: [],
  };
  proxy.resetForm("verifacInvoiceRef");
  canEditStatus.value = true;
}


// 当前订单明细的行数
const salesOrderDetailLength = computed(()=>{
  return form.value.salesOrderDetailList.length || 0;
})

/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:', data)
  if(data){
    form.value.customerId = data.customerId || null;
    form.value.destinatarioNif = data.invoiceNif || null;
    form.value.destinatarioNombre = data.invoiceNombre || null; 
    form.value.destinatarioAddressCountry = data.invoiceAddressCountry || null;
    form.value.destinatarioAddressProvince = data.invoiceAddressProvince || null;
    form.value.destinatarioAddressDetail = data.invoiceAddressDetail || null;
    form.value.destinatarioPostcode = data.invoicePostcode || null;
    form.value.destinatarioPhone = data.invoicePhone || null;
    form.value.destinatarioEmail = data.contactEmail || null;

  }
}

// -------------------------------- 2 枚举数据 start  ---------------------------------

// 订单操作类型
const OperateType = {
  SAVE: 1,
  SAVE_EDIT: 2,
  // 生成发票
  GENERATE_INVOICE: 3,
  // 作废
  VOIDED: 4
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    1: 'primary',
    2: 'warning',
    3: 'success',
    4: 'danger',
  }
  return typeMap[actionValue] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OperateType.SAVE]: '保存',
    [OperateType.SAVE_EDIT]: '保存修改',
    [OperateType.PICK]: '拣货确认',
    [OperateType.GENERATE_INVOICE]: '生成发票',
    [OperateType.VOIDED]: '作废订单',
    
  };
  return messages[action] || '备注';
}

// -------------------------------- 2 枚举数据 end  ---------------------------------


// --------------------------------  3 操作部分 start ---------------------------------

// 继续编辑订单
const handleEdit = () => {
 if(form.value.orderSource == orderSourceEnum.CAJA){
  ElMessage.warning("收银台的订单不允许修改！")
 } else {
  canEditStatus.value = true
 }
}

// 保存修改
const handleSaveEdit = () => {
 openApprovalDialog('保存修改', OperateType.SAVE_EDIT)
}


/** 保存订单 */ 
const handleSave = () => {
  // 与校验表单提交校验一致，此处只做提交之前的预校验 */
  proxy.$refs["verifacInvoiceRef"].validate().then(() => {
    // 必须选择客户
    if(!form.value.customerId){
      ElMessage.error("请选择客户信息！");
      return;
    }
    // 1 过滤空数据
    form.value.salesOrderDetailList = form.value.salesOrderDetailList.filter(item => item.skuId)
    if(salesOrderDetailLength.value <= 0){
      ElMessage.error("订单明细不能为空!");
      return;
    }
    // 2 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.salesOrderDetailList)) {
      return;
    }

    // 3 提交表单
    openApprovalDialog('保存订单', OperateType.SAVE)
    canEditStatus.value = false;
  }) 
}

/** 检查采购条目的必输项 */
const validateItems = (salesOrderDetailList) => {
  for (const item of salesOrderDetailList){
    // 数量校验
    if(form.value.orderDirection == OrderDirectionEnum.SALES){
      if (item.detailQuantity <= 0) {
        ElMessage.error("销售订单明细 数量必须大于0!");
        return false;
      }
    } else {
      if (item.detailQuantity >= 0) {
        ElMessage.error("退货订单明细 数量必须小于0!");
        return false;
      }
    }
    // 单价校验
    if (item.detailPrice < 0) {
      ElMessage.error("订单明细 单价不能小于0!");
      return false;
    }
    // 税率校验
    if (isNaN(item.detailTaxRate)) {
      ElMessage.error("订单明细 税率异常，请检查!");
      return false;
    }
    if(item.detailTaxRate < 0 || item.detailTaxRate > 100){
      ElMessage.error("订单明细 税率需要在 0-100% 之间，请检查!");
      return false;
    }
    // 折扣率校验
    if (isNaN(item.detailDiscountRate)) {
      console.log("异常的则扣率：",item.detailDiscountRate)
      ElMessage.error("订单明细 折扣率异常，请检查!");
      return false;
    }
    if(item.detailDiscountRate < 0 || item.detailDiscountRate > 100){
      ElMessage.error("订单明细 折扣率需要在 0-100% 之间，请检查!");
      return false;
    }
  }
  return true;
};


/** 生成发票 */ 
const handleGenerateInvoice = () => {
  openApprovalDialog('生成发票', OperateType.GENERATE_INVOICE)
}

/** 作废 */ 
const handleVoided = () => {
  openApprovalDialog('作废', OperateType.VOIDED)
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 导出 */
const handleExport = () => {
  console.log("************* 点击导出 ")
}

// --------------------------------  3 操作部分 start ---------------------------------

// -------------------------------- 5 审核记录 + 提示弹窗 start ---------------------------------
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


// 订单操作记录
const operateLog = ref([])

/** 添加采购订单操作记录 */ 
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue: actionValue || ''
  }
  // 1 查找是否存在相同 operator 的记录
  const existingIndex = operateLog.value.findIndex(
    log => log.action === action
  )
  if (existingIndex !== -1) {
    // 2 如果存在，先删除原有记录
    operateLog.value.splice(existingIndex, 1)
  }
  
  // 3 添加新记录（无论是否存在都会添加到最后）
  operateLog.value.push(newLog)
}

/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = operateLog.value
}

 /** 提交数据预处理 */ 
const prepareData = () => {
  form.value.operateLog = JSON.stringify(operateLog.value);
  form.value.invoiceTipo = InvoiceTypeEnum.COMPLETA
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

// 是否需要填写原因
const actionRequiresNoRemark = [OperateType.SAVE, OperateType.GENERATE_INVOICE];
const actionRequiresRemark = [OperateType.SAVE_EDIT, OperateType.VOIDED];

/** 采购订单提交操作 */ 
const submitOperate = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 3 定义动作及相应状态
  const actions = {
    [OperateType.SAVE]: {
      status: InvoiceStatusEnum.SUCCESS,
      message: '保存成功',
      actionValue: OperateType.SAVE
    },
    [OperateType.SAVE_EDIT]: {
      status: null,
      message: '保存修改',
      actionValue: OperateType.SAVE_EDIT
    },
    [OperateType.GENERATE_INVOICE]: {
      status: InvoiceStatusEnum.SUCCESS,
      message: '确认',
      actionValue: OperateType.GENERATE_INVOICE
    },
    [OperateType.VOIDED]: {
      status: InvoiceStatusEnum.SUCCESS,
      message: '作废',
      actionValue: OperateType.VOIDED
    },
  }

  const currentActionConfig = actions[currentAction.value]

  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.operateType = currentActionConfig.actionValue;
  // 保存编辑不修改状态
  if(currentActionConfig.status){
    form.value.orderStatus = currentActionConfig.status;
  }
  form.value.operateLog = JSON.stringify(operateLog.value);

  try {
    // 1 数据预处理 转json格式
    prepareData();

    // 4 后端 API调用
    if (currentAction.value === OperateType.SAVE) {
      if (!form.value.orderId) {
        // 新增操作
        await addVerifacInvoice(form.value)
          .then( (res) => {
            if(res.code === 200){
              form.value = res.data
            }
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("新增操作失败"));
      } else {
        // 修改操作
        await updateVerifacInvoice(form.value)
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
      await updateByOtherOperate(form.value)
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

// -------------------------------- 5 审核记录 + 提示弹窗 end ---------------------------------

// -------------------------------- 6 页面跳转 初始化数据 start ---------------------------------
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
    router.push({path: "/salesManager/verifacInvoice",});
  })
  
};

const RefreshTab = () => {
  // 刷新当前页
  getInfoById()
}

/** 通过传递的invoiceId 获取发票信息 */
const getInfoById = async () => {
  // 获取修改传递的参数 productId
  const _invoiceId = route.query.invoiceId || form.value.invoiceId;
  console.log("获取到传递过来的invoiceId", _invoiceId)
  if (!_invoiceId) {
    console.log("传递的参数invoiceId为空");
    if(!form.value.invoiceId){
      reset()
    }
    return;
  }

  try {
    // 获取订单信息
    const response = await getVerifacInvoice(_invoiceId);
    form.value = response?.data ;

    // 处理 operateLog
    if (form.value.operateLog) {
      try {
        const parsedLog = JSON.parse(form.value.operateLog);
        operateLog.value = parsedLog;
      } catch (error) {
        console.error("operateLog 解析失败:", error);
        operateLog.value = [];
      }
    }
    console.log("初始化数据正常：", form.value);
  } catch (error) {
    console.error("获取订单信息失败:", error);
  }
}

onMounted(() => {
  getInfoById()
});
getInfoById()
// -------------------------------- 6 页面跳转 初始化数据 end ---------------------------------

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

    /* 固定底部样式 */
    .fixed-footer {
      position: sticky;
      background: #fff;

      /* 底部列样式 */
      .footer-row {
        display: flex;
        align-items: stretch;

        .footer-col {
          position: relative;

          /* 内容区域样式 */
          .footer-content {
            height: 100%;
            padding: 10px;
            border-radius: 4px;
          }
        }

        /* 分割线样式 */
        .divider {
          &.vertical {
            width: 1.5px;
            background: #ebeef5;
            margin: 0 8px;
          }
        }
      }
    }
  }

  .card-operation-log{
    width: 100%;
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

:deep(.total-label){
  font-size: 16px;
  color: #f30909;
}

:deep(.total-content2) {
  font-size: 20px;
}

/* 调整描述项样式 */
:deep(.el-descriptions__body) {
  background: transparent;
}

:deep(.el-descriptions__cell) {
  padding-bottom: 8px;
}

.highlight-text {
  color: #409eff;
  /* 高亮文本颜色 */
  font-weight: bold;
}

.qrcode{
  display: grid;
  place-items: center; /* 水平和垂直居中 */
  width: 100%;
  height: 100%;
}



</style>
