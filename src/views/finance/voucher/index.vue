<template>
  <div class="app-container">
    <!-- 过滤条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会计年度" prop="periodYear">
        <el-select v-model="queryParams.periodYear" placeholder="请选择会计年度" clearable>
          <el-option v-for="dict in finance_period_year" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="会计月份" prop="periodMonth">
        <el-select v-model="queryParams.periodMonth" placeholder="请选择会计月份" clearable>
          <el-option v-for="dict in finance_period_month" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="凭证类型" prop="voucherType">
        <el-select v-model="queryParams.voucherType" placeholder="请选择凭证类型" clearable>
          <el-option v-for="dict in finance_voucher_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="凭证编号" prop="voucherNo">
        <el-input v-model="queryParams.voucherNo" placeholder="请输入凭证编号" clearable @keyup.enter="handleQuery"
          style="width: 150px;" />
      </el-form-item>
      <el-form-item label="凭证状态" prop="voucherStatus">
        <el-select v-model="queryParams.voucherStatus" placeholder="请选择凭证状态" clearable>
          <el-option v-for="dict in finance_voucher_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 20px;">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['finance:voucher:add']">填制凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['finance:voucher:edit']">修改凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['finance:voucher:remove']">作废凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['finance:voucher:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据展示 -->
    <el-table v-loading="loading" :data="voucherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会计年度" align="center" prop="periodYear" width="80">
        <template #default="scope">
          <dict-tag :options="finance_period_year" :value="scope.row.periodYear" />
        </template>
      </el-table-column>
      <el-table-column label="会计月份" align="center" prop="periodMonth" width="80">
        <template #default="scope">
          <dict-tag :options="finance_period_month" :value="scope.row.periodMonth" />
        </template>
      </el-table-column>
      <el-table-column label="凭证编号" align="center" prop="voucherNo" min-width="150" />
      <el-table-column label="凭证类型" align="center" prop="voucherType">
        <template #default="scope">
          <dict-tag :options="finance_voucher_type" :value="scope.row.voucherType" />
        </template>
      </el-table-column>
      <el-table-column label="凭证日期" align="center" prop="voucherDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.voucherDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="totalAmount">
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="凭证状态" align="center" prop="voucherStatus">
        <template #default="scope">
          <dict-tag :options="finance_voucher_status" :value="scope.row.voucherStatus" />
        </template>
      </el-table-column>
      <el-table-column label="制单人" align="center" prop="createBy" show-overflow-tooltip />
      <el-table-column label="制单时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" show-overflow-tooltip />
      <el-table-column label="修改时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="凭证备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['finance:voucher:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['finance:voucher:remove']">作废</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改会计凭证对话框 -->
    <el-dialog v-model="open" width="61.8%" :show-close="false" :close-on-click-modal="false">
      <template #header="{ titleId, titleClass }">
        <div class="header-content">
          <div class="header-title">
            <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
            <dict-tag :options="finance_voucher_status" :value="form.voucherStatus" />
          </div>
          <div class="header-actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="mr-4">
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_DRAFT"
                @click="handleSave" :loading="loading">
                保存
              </el-button>
              <el-button type="primary" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_DRAFT"
                @click="handleAudited" :loading="loading">
                审核
              </el-button>
              <el-button type="danger" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_DRAFT"
                @click="handleVoided" :loading="loading">
                作废
              </el-button>

              <!-- 审核状态 -->
              <el-button type="primary" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_AUDITED"
                @click="handlePosted" :loading="loading">
                过账
              </el-button>
              <el-button type="warning" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_AUDITED"
                @click="handleUnAudited" :loading="loading">
                反审核
              </el-button>

              <!-- 已过帐状态 -->
              <el-button type="success" v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_POSTED"
                @click="handleUnPosted" :loading="loading">
                反过账
              </el-button>

              <!-- 作废状态 -->

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrintVoucher">打印</el-button>
              <el-button @click="handleExportVoucher">导出</el-button>
              <el-button type="danger" @click="cancel">
                <el-icon class="el-icon--left">
                  <CircleCloseFilled />
                </el-icon>
                退出
              </el-button>
            </el-button-group>
          </div>
        </div>

      </template>

      <!-- 表头数据 -->
      <el-form ref="voucherRef" :model="form" :rules="rules" label-width="80px"
        :disabled="form.voucherStatus !== VoucherStatusEnum.VOUCHER_STATUS_DRAFT">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item label="会计期间:" prop="period">
              <el-text>{{form.periodYear}}-{{form.periodMonth}}</el-text>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="凭证编号" prop="voucherNo">
              <el-input v-model="form.voucherNo" placeholder="系统自动生成" style="width: 100%" disabled="false" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="凭证类型" prop="voucherType">
              <el-select v-model="form.voucherType" placeholder="凭证类型" clearable style="width: 100%">
                <el-option v-for="dict in finance_voucher_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="凭证日期" prop="voucherDate">
              <el-date-picker v-model="form.voucherDate" type="date" placeholder="凭证日期" :disabled-date="disabledDate"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="23">
            <el-form-item label="凭证备注" prop="remark">
              <el-input v-model="form.remark" placeholder="凭证备注" type="text" maxlength="30" show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>

      <!-- 分割线 -->
      <el-divider content-position="left">
        <strong style="margin-right: 30px;">分录明细</strong>
        <el-button type="primary" size="small" icon="Refresh" @click="handleTrialBalance"
          v-if="form.voucherStatus == VoucherStatusEnum.VOUCHER_STATUS_DRAFT">试算平衡</el-button>
      </el-divider>

      <!-- 分录明细 -->
      <el-table v-loading="loading" :data="form.voucherDetailList" border style="width: 100%"
        :summary-method="getSummaryRow" show-summary>
        <el-table-column type="index" label="序号" align="center" width="55px"></el-table-column>
        <el-table-column label="科目名称" prop="accountId" align="center" min-width="150px" show-overflow-tooltip>
          <template #default="scope">
            <el-tree-select v-model="scope.row.accountId" :data="accountTree" :props="treeProps" value-key="accountId"
              placeholder="请选择科目" style="width: 100%;" @node-click="(data) => handleAccountChange(scope.row, data)"
              :disabled="form.voucherStatus !== VoucherStatusEnum.VOUCHER_STATUS_DRAFT">
            </el-tree-select>
          </template>
        </el-table-column>
        <el-table-column label="借方金额" prop="debitAmount" align="center">
          <template #default="scope">
            <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'debitAmount')" v-model="scope.row.debitAmount"
              placeholder="借方金额" :max='99999999' :min='0' :precision='2' :step='0' :controls="false"
              @change="calculateTotalAmount" style="width: 100%;" @focus="handleFocus(scope.$index, 'debitAmount')"
              @click="handleFocus(scope.$index, 'debitAmount')"
              :disabled="form.voucherStatus !== VoucherStatusEnum.VOUCHER_STATUS_DRAFT" />
          </template>
        </el-table-column>
        <el-table-column label="贷方金额" prop="creditAmount" align="center">
          <template #default="scope">
            <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'creditAmount')" v-model="scope.row.creditAmount"
              placeholder="贷方金额" :max='99999999' :min='0' :precision='2' :step='0' :controls="false"
              @change="calculateTotalAmount" style="width: 100%;" @focus="handleFocus(scope.$index, 'creditAmount')" @click="handleFocus(scope.$index, 'creditAmount')"
              :disabled="form.voucherStatus !== VoucherStatusEnum.VOUCHER_STATUS_DRAFT" />
          </template>
        </el-table-column>
        <el-table-column label="摘要" prop="summary" align="center" min-width="150">
          <template #default="scope">
            <el-tooltip :content="scope.row.summary" placement="top" :disabled="scope.row.summary===null">
              <el-input v-model="scope.row.summary" placeholder="摘要" type="text" :maxlength="20" show-word-limit
                style="width: 100%;" :disabled="form.voucherStatus !== VoucherStatusEnum.VOUCHER_STATUS_DRAFT" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="辅助项" prop="assistType" align="center" min-width="50" show-overflow-tooltip>
          <template #default="scope">
            <dict-tag :options="finance_assist_type" :value="scope.row.assistType" />
          </template>
        </el-table-column>
        <el-table-column label="辅助值" prop="assistName" align="center" min-width="50" show-overflow-tooltip>
          <template #default="scope">
            <span class="link-type" @click="openSetAssistDialog(scope.row)">
              {{ scope.row.assistName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="50">
          <template #default="scope">
            <el-button link type="danger" icon="Delete" @click="handleDeleteDetail(scope.$index)"
              v-if="form.voucherStatus == VoucherStatusEnum.VOUCHER_STATUS_DRAFT" style="width: 100%;">删除</el-button>
          </template>
        </el-table-column>


      </el-table>

      <!-- 添加按钮 -->
      <div class="table-operations"
        v-if="form.voucherStatus === VoucherStatusEnum.VOUCHER_STATUS_DRAFT && form.voucherDetailList.length < maxLength"
        style="margin: 5px 0px 10px 0px;">
        <el-button type="primary" @click="addDetail">
          <el-icon>
            <Plus />
          </el-icon>
          <span> 添加分录 (限制最多 {{ maxLength }} 条流水)</span>
        </el-button>
      </div>

      <!-- 编辑辅助项 -->
      <el-dialog v-model="innerVisible" title="请设置辅助项内容" append-to-body style="width: 30.9%;" :show-close="false">
        <el-form ref="assistFormRef" :model="assistForm" :rules="assistRules" label-width="auto">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="辅助项类型:" prop="assistType">
                <el-select v-model="assistForm.assistType" placeholder="请选择辅助项类型" @change="getAssistValueList"
                  style="width: 100%;">
                  <el-option v-for="dict in currentAssistTypesDict" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 辅助项 - 客户 -->
              <el-form-item :label="assistTypeLabel" prop="assistName"
                v-if="assistForm.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
                <el-select v-model="assistForm.assistId" :placeholder="assistTypeLabel" @change="setAssistForm"
                  style="width: 100%;" filterable>
                  <el-option v-for="item in customerList" :key="item.customerId" :label="item.customerName"
                    :value="item.customerId">
                    <span>{{ '客户名称：' + item.customerName + ' ---- ' + '客户编码：' + item.customerCode }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- 辅助项 - 供应商 -->
              <el-form-item :label="assistTypeLabel" prop="assistName"
                v-if="assistForm.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
                <el-select v-model="assistForm.assistId" :placeholder="assistTypeLabel" style="width: 120px;"
                  @change="setAssistForm" filterable>
                  <el-option v-for="item in supplierList" :key="item.supplierId" :label="item.supplierName"
                    :value="item.supplierId">
                    <span>{{ '供应商名称：' + item.supplierName + ' ---- ' + '供应商编码：' + item.supplierCode }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- 辅助项 - 员工 -->
              <el-form-item :label="assistTypeLabel" prop="assistName"
                v-if="assistForm.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
                <el-select v-model="assistForm.assistId" :placeholder="assistTypeLabel" style="width: 120px;"
                  @change="setAssistForm" filterable>
                  <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId">
                    <span>{{ '登录名：' + item.userName + ' ---- ' + '昵称：' + item.nickName }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeAssistForm">取 消</el-button>
            <el-button type="primary" @click="submitAssistForm">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 订单操作记录 -->
      <el-card class="operation-card">
        <template #header>
          <div class="card-header">
            <span>凭证操作记录</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
            :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
            {{ activity.operator }} - {{ activity.action }}
            <span v-if="activity.remark"> - - 描述 : </span>
            <span class="remark">{{ activity.remark }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>

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
            <el-button type="primary" @click="submitApproval">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup name="Voucher">
import { listVoucher, getVoucher, delVoucher, addVoucher, updateVoucher, auditedVoucher, unAuditedVoucher, postedVoucher, unPostedVoucher, voidedVoucher } from "@/api/finance/voucher";
import useUserStore from "@/store/modules/user";
import { listAccount } from "@/api/finance/account";
import { ElMessage } from "element-plus";
import { nextTick, ref } from "vue";
import { listSupplier} from "@/api/order/supplier";
import { listCustomer} from "@/api/order/customer";
import { listUser } from "@/api/system/user";

// ------------------------------------ 输入框聚焦选中 start ------------------------------------
const inputRefs = ref({}); // 使用对象存储各列引用
// 动态管理每列引用
const setInputRef = (el, rowIndex, column) => {
  if (!inputRefs.value[column]) {
    inputRefs.value[column] = [];
  }
  inputRefs.value[column][rowIndex] = el;
};

// 聚焦时选中内容
const handleFocus = (rowIndex, column) => {
  const inputEl = inputRefs.value[column]?.[rowIndex]?.$el.querySelector('input');
  if (inputEl) {
    inputEl.select(); // 选中输入框内容
  }
};

// ------------------------------------ 输入框聚焦选中 end ------------------------------------

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_period_year, finance_period_month, finance_voucher_type, finance_voucher_status, finance_assist_type } = proxy.useDict('finance_period_year', 'finance_period_month', 'finance_voucher_type', 'finance_voucher_status', 'finance_assist_type');

const voucherList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const maxLength = ref(20);
// 初始化借贷方合计金额
let totalDebitAmount = 0;
let totalCreditAmount = 0;

/** 凭证状态 */ 
const VoucherStatusEnum = {
  // 草稿
  VOUCHER_STATUS_DRAFT: '1',
  // 已审核
  VOUCHER_STATUS_AUDITED: '2',
  // 已过账
  VOUCHER_STATUS_POSTED: '3',
  // 已作废
  VOUCHER_STATUS_VOIDED: '4',
}

// 订单操作类型
const VoucherOperateType = {
  // 保存
  SAVE: 'save',
  // 审核
  AUDITED: 'audited',
  // 反审核
  UN_AUDITED: 'unAudited',
  // 过账
  POSTED: 'posted',
  // 反过账
  UN_POSTED: 'unPosted',
  // 作废
  VOIDED: 'voided'
}

/** 辅助项类型 */
const  AssistTypeEnum = {
  // 客户
  ASSIST_TYPE_CUSTOMER: '1',
  // 供应商
  ASSIST_TYPE_SUPPLIER: '2',
  // 员工
  ASSIST_TYPE_EMPLOYEE: '3'
}

// 订单状态颜色
const VoucherStatusColor = {
  '1':'info',
  '2':'primary',
  '3':'success',
  '4':'danger',
}

// 订单状态描述
const VoucherStatusName = {
  '1':'草稿',
  '2':'已审核',
  '3':'已过帐',
  '4':'已作废',
}

const data = reactive({
  form: {voucherDetailList: []},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    voucherType: null,
    periodYear: null,
    periodMonth: null,
    voucherNo: null,
    voucherStatus: null,
    operatorId: null,
    tenantId: null
  },
  rules: {
    voucherType: [
      { required: true, message: "凭证类型不能为空", trigger: "change" }
    ],
    voucherDate: [
      { required: true, message: "凭证日期不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// 表单重置
function reset() {
  form.value = {
    voucherId: null,
    voucherType: null,
    periodYear: 2024,
    periodMonth: 12,
    voucherDate: new Date(),
    voucherNo: null,
    totalAmount: null,
    voucherStatus: VoucherStatusEnum.VOUCHER_STATUS_DRAFT,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    operateLog: null,
    voucherDetailList: []
  };
  proxy.resetForm("voucherRef");
  totalDebitAmount = 0;
  totalCreditAmount = 0;
  addDetail();
  getAccountList();
}

// ------------------------------------- 获取科目列表 start -------------------------------------
// ----------------- 1 获取科目列表数据
// 会计科目 - 初始化列表
const accountList = ref([])
const accountTree = ref([])
/** 会计科目 - 获取列表 */
const getAccountList = async () => {
    listAccount()
      .then(response => {
        accountTree.value = proxy.handleTree(response.data, "accountId", "parentId") || [];
        accountList.value = response.data || [];
      })
      .catch(error => {
        ElMessage.error("获取会计科目列表时出错:",error)
      })
};

/** el-tree-select 配置 */ 
const treeProps = {
  value: "accountId",
  label: (node) => `${node.accountCode} - ${node.accountName}`, // 自定义显示内容
  children: "children",
  disabled: (node) => node.status == '1'
};

// ----------------- 2 切换会计科目 -> 设置辅助项内容
// 嵌套弹窗状态
const innerVisible = ref(false);
// 当前操作的行
const currentRow = ref(null);
// 选中科目的辅助项
const currentAssistTypesDict = ref(null)
// 弹窗息框表单 
const assistForm = ref({
  assistType: null,
  assistId: null,
  assistName: null
})

const assistRules = ref({
  assistType: [
    { required: true, message: '请选择辅助项类型' , trigger: ['blur','change'] }
  ],
  assistName: [
    { required: true, message: '请选择辅助项对应的值' , trigger: ['blur','change'] }
  ]
})

/*** 修改会计科目 - 判断是否需要设置辅助项*/
const handleAccountChange = (row,data) =>{
  // 初始化数据
  resetInnerDialog()
  // 检查是否有辅助项
  nextTick(() => {
    console.log("会计科目列表：",accountList.value)
    console.log("当前行的信息",row)
    console.log("当前选中的科目信息",data)
    const account2 = accountList.value.find(account => account.accountId == data.accountId)
    console.log("选择的会计科目：",account2)
    
    if (!account2 || !row) {
      // 方法未正常获取到 row 或 data  -> 直接退出操作
      ElMessage.error("出现未知错误, 导致退出，请从新编辑凭证!")
      cancel()
      return; // 中断后续逻辑
    }

    // 如果存在 account
    if (!account2.assistTypes || account2.assistTypes.length === 0) {
      // 没有辅助项，初始化辅助内容
      initRowData(row);
    } else {
      initRowData(row);
      currentRow.value = row; // 记录当前行
      // 设置辅助内容
      currentAssistTypesDict.value = finance_assist_type.value.filter(item => account2.assistTypes.includes(item.value)) || [];
      innerVisible.value = true;
    }

  })
  
}

/** 切换会计科目 - 初始化行数据 */
const initRowData = (row) => {
  row.debitAmount= 0
  row.creditAmount= 0
  row.summary= null
  row.assistType= null
  row.assistId= null
  row.assistName= null
}

/** 编辑 回显辅助项 */
const openSetAssistDialog = (row) => {
  currentRow.value = row; // 记录当前行
  console.log("回显的行数据：",row)
  const account3 = accountList.value.find(account => account.accountId == row.accountId)
  // 设置辅助内容
  currentAssistTypesDict.value = finance_assist_type.value.filter(item => account3.assistTypes.includes(item.value)) || [];
  // 回显赋值设置
  assistForm.value.assistId = currentRow.value.assistId
  assistForm.value.assistType = currentRow.value.assistType
  assistForm.value.assistName = currentRow.value.assistName
  // 弹出编辑界面
  innerVisible.value = true;

}

// ----------------- 3 设置 辅助项类型：供应商 客户 员工
// 设置展示字段名
const assistTypeLabel = ref("辅助项内容")
// 辅助项类型
const supplierList = ref([])  // 1 供应商
const customerList = ref([])  // 2 客户
const userList = ref([])      // 3 员工 
/** 获取当前辅助项类型对应内容的列表 */
const getAssistValueList = () =>{
  // 切换辅助项类型 -> 重置 辅助项值
  assistForm.value.assistName = null
  assistForm.value.assistId = null

  console.log("当前选中的辅助项类型是：",assistForm.value.assistType)
  // 供应商
  if(assistForm.value.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER){
    assistTypeLabel.value = "选择供应商"
    console.log("----------",supplierList.value)
    if(supplierList.value.length == 0 || supplierList.value == []){
      listSupplier()
      .then(
        response => { supplierList.value = response.rows }
      )
      .catch(
        error => {ElMessage.error("获取供应商列表时出错:",error)}
      )
    }
  }
  // 客户
  if(assistForm.value.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER){
    assistTypeLabel.value = "选择客户"
    if(customerList.value.length == 0 || customerList.value == []){
      listCustomer()
      .then(
        response => {customerList.value = response.rows }
      )
      .catch(
        error => {ElMessage.error("获取客户列表时出错:",error)}
      )
    }
  }
  // 员工
  if(assistForm.value.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE){
    assistTypeLabel.value = "选择员工"
    if(userList.value.length == 0 || userList.value == []){
      listUser()
      .then(
        response => {userList.value = response.rows }
      )
      .catch(
        error => {ElMessage.error("获取客户列表时出错:",error)}
      )
    }
  }
}

// ----------------- 4 选择辅助项并赋值 : 供应商 客户 员工
// 选中的辅助项内容 -> name 
const selectedSupplierValue = ref(null)   // 1 供应商
const selectedCustomerValue = ref(null)   // 2 客户
const selectedUserValue = ref(null)       // 3 员工
const setAssistForm = () => {
  if(assistForm.value.assistType === AssistTypeEnum.ASSIST_TYPE_SUPPLIER){
    selectedSupplierValue.value = supplierList.value.find(item => item.supplierId == assistForm.value.assistId)
    assistForm.value.assistName = selectedSupplierValue.value.supplierName
    console.log("选择的供应商：",assistForm.value)
  } else if (assistForm.value.assistType === AssistTypeEnum.ASSIST_TYPE_CUSTOMER){
    selectedCustomerValue.value = customerList.value.find(item => item.customerId == assistForm.value.assistId)
    assistForm.value.assistName = selectedCustomerValue.value.customerName
    console.log("选择的客户：",assistForm.value)
  } else if (assistForm.value.assistType === AssistTypeEnum.ASSIST_TYPE_EMPLOYEE){
    selectedUserValue.value = userList.value.find(item => item.userId == assistForm.value.assistId)
    assistForm.value.assistName = selectedUserValue.value.userName
    console.log("选择的员工：",assistForm.value)
  }
  
}



// ----------------- 5 提交赋值给当前行的明细
/** 提交 - 辅助项嵌套弹窗 */
const submitAssistForm = () => {
  console.log("提交时当前行数据：-----",currentRow.value)
  proxy.$refs["assistFormRef"].validate().then(
    () => {
      if(currentRow.value)
      {
        // 提交辅助项
        currentRow.value.assistType = assistForm.value.assistType
        currentRow.value.assistId = assistForm.value.assistId
        currentRow.value.assistName = assistForm.value.assistName
        console.log("提交时当前行数据2：-----",currentRow.value)
      }
      // 关闭弹窗
      innerVisible.value = false;
    }
  )
}

/** 关闭 - 辅助项嵌套弹窗 */
const closeAssistForm = () => {
  // 先判断是否选中辅助项值
  if(!currentRow.value.assistId)
  {
    // 关闭弹窗
    currentRow.value.accountId = null
  }
  innerVisible.value = false;
}

/** 初始化数据 */
const resetInnerDialog = () => {
  assistForm.value = {
    assistType: null,
    assistId: null,
    assistName: null
  }
  currentRow.value = null
  currentAssistTypesDict.value = null

  selectedSupplierValue.value = null
}

// ------------------------------------- 获取科目列表 end   -------------------------------------


/** 控制只可以选择会计期间的日期 */
const disabledDate = (time) => {
  const controlYear = form.value.periodYear
  // 月份从0开始
  const controlMonth = form.value.periodMonth - 1
  return time.getFullYear() !== controlYear || time.getMonth() !== controlMonth ;
};

/** 试算平衡按钮操作 */
const handleTrialBalance = () => {
  // TODO 待实现
  if(totalDebitAmount == totalCreditAmount ){
    proxy.$modal.msgSuccess("借贷平衡");
    console.log("借: ",totalDebitAmount )
    console.log("贷: ",totalCreditAmount )
  } else {
    proxy.$modal.msgError("借贷不平");
    console.log("借: ",totalDebitAmount )
    console.log("贷: ",totalCreditAmount )
  }
}

/** 添加分录 */
const addDetail = () => {
  // 创建一个空数组来存储10条新记录
  const newDetails = Array.from({ length: 2 }, () => ({
    detailId: null,
    voucherId: null,
    accountId: null,
    debitAmount: 0,
    creditAmount: 0,
    summary: null,
    assistType: null,
    assistId: null,
    assistName: null
  }))
  // 将新记录数组添加到现有数组中
  form.value.voucherDetailList.push(...newDetails)
}

/** 删除分录 */
const handleDeleteDetail = (index) => {
  // 找到要删除的记录的索引
  form.value.voucherDetailList.splice(index, 1);
}

/** 计算借贷方合计金额 */
const calculateTotalAmount = () => {
  totalDebitAmount = form.value.voucherDetailList.reduce((sum, detail) => sum + (detail.debitAmount || 0), 0);
  totalCreditAmount = form.value.voucherDetailList.reduce((sum, detail) => sum + (detail.creditAmount || 0), 0);
  form.value.totalAmount = totalDebitAmount || 0
}

/** 合计行 */
const getSummaryRow = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'debitAmount') {
      // 计算借方总金额
      const totalDebit = data.reduce((sum, item) => {
        const value = Number(item.debitAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalDebit.toFixed(2)} € `
    } else if (column.property === 'creditAmount') {
      // 计算贷方总金额
      const totalCredit = data.reduce((sum, item) => {
        const value = Number(item.creditAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalCredit.toFixed(2)} € `
    } else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'accountId' ? '合计金额 :' : ''
    }
  })
  
  return sums
}

/** 查询会计凭证列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVoucher(queryParams.value).then(response => {
    voucherList.value = response.rows || [];
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}



// *************************************** 操作 start ******************************
const handleSave = () => {
  openApprovalDialog('编辑保存凭证', VoucherOperateType.SAVE)
}

const handleAudited = () => {
  openApprovalDialog('审核凭证', VoucherOperateType.AUDITED)
}

const handleVoided = () => {
  openApprovalDialog('作废凭证', VoucherOperateType.VOIDED)
}

const handlePosted = () => {
  openApprovalDialog('手动过账凭证', VoucherOperateType.POSTED)
}

const handleUnAudited = () => {
  openApprovalDialog('反审核凭证', VoucherOperateType.UN_AUDITED)
}

const handleUnPosted = () => {
  openApprovalDialog('手动反过账凭证', VoucherOperateType.UN_POSTED)
}

const handlePrintVoucher = () => {
  console.log('打印凭证--当前的form值:', form.value)
}

const handleExportVoucher = () => {
  console.log('导出凭证', 'save')
}

// ******************** 操作弹窗 *********
const dialogVisible = ref(false)  // 提交弹窗状态
const dialogTitle = ref('')       // 提交弹窗标题
const currentAction = ref('')     // 当前操作类型

/** 提交弹窗参数 */ 
const approvalForm = ref({
  remark: ''
})

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [VoucherOperateType.SAVE]: '保存编辑原因',
    [VoucherOperateType.AUDITED]: '审核通过原因',
    [VoucherOperateType.UN_AUDITED]: '反审核原因',
    [VoucherOperateType.POSTED]: '过账原因',
    [VoucherOperateType.UN_POSTED]: '反过账原因',
    [VoucherOperateType.VOIDED]: '作废原因',
  };
  return messages[action] || '备注';
}


/** 打开提交操作的弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}

// ***************** 操作记录 *************
// 操作记录列表
const orderOperateLog = ref([])
/** 添加订单操作记录 */ 
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue
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
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    save: 'info',
    audited: 'primary',
    unAudited: 'danger',
    posted: 'success',
    unPosted: 'danger',
    voided: 'danger'
  }
  return typeMap[actionValue] || 'info'
}

// *************************** 提交操作 ************************
/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = orderOperateLog.value
}

/** 提交数据错误处理函数 */ 
const handleError = (message = "操作失败") => {
  // 恢复 skuValue operateLog 的Json格式
  parseJson();
  ElMessage.error(message);
  // 关闭对话框和加载状态
  dialogVisible.value = false;
};

// 强制输入描述信息: 反审核 反过账 过账 作废
const actionRequiresRemark = [VoucherOperateType.UN_AUDITED, VoucherOperateType.UN_POSTED, VoucherOperateType.POSTED, VoucherOperateType.VOIDED];
// 不需要输入描述信息: 保存 审核
const actionRequiresNoRemark = [VoucherOperateType.SAVE, VoucherOperateType.AUDITED];

const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 2 定义动作及相应状态
  const actions = {
    [VoucherOperateType.SAVE]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_DRAFT,
      message: '保存成功',
      actionValue: VoucherOperateType.SAVE
    },
    [VoucherOperateType.AUDITED]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_AUDITED,
      message: '审核通过',
      actionValue: VoucherOperateType.AUDITED
    },
    [VoucherOperateType.UN_AUDITED]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_DRAFT,
      message: '反审核 成功!',
      actionValue: VoucherOperateType.UN_AUDITED
    },
    [VoucherOperateType.POSTED]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_POSTED,
      message: '过账成功!',
      actionValue: VoucherOperateType.POSTED
    },
    [VoucherOperateType.UN_POSTED]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_AUDITED,
      message: '反过账 成功!',
      actionValue: VoucherOperateType.UN_POSTED
    },
    [VoucherOperateType.VOIDED]: {
      status: VoucherStatusEnum.VOUCHER_STATUS_VOIDED,
      message: '已作废!',
      actionValue: VoucherOperateType.VOIDED
    }
  }

  // 3 状态 操作记录 赋值
  const currentActionConfig = actions[currentAction.value]
  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.voucherStatus = currentActionConfig.status;
  form.value.operateLog = JSON.stringify(orderOperateLog.value);

  // 4 业务处理
  try{
    if( currentAction.value === VoucherOperateType.SAVE) {
      proxy.$refs["voucherRef"].validate(valid => {
        if (valid) {
          // 修改 / 新增 业务
          if (form.value.voucherId != null) {
            updateVoucher(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("修改成功");
              parseJson();
              getList();
            })
            .catch(error => {
              handleError(error.message);
            });
          } else {
            addVoucher(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("新增成功");
              form.value.voucherId = response.data.voucherId;
              form.value.voucherNo = response.data.voucherNo;
              parseJson();
              getList();
            })
            .catch(error => {
              handleError(error.message);
            });
          }
        }
      });
    }
    if(currentAction.value === VoucherOperateType.AUDITED){
      // 审核业务
      auditedVoucher(form.value)
        .then(response => {
          ElMessage.success("审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          handleError(error.message);
        });
    }
    if(currentAction.value === VoucherOperateType.UN_AUDITED){
      // 反审核业务
      unAuditedVoucher(form.value)
        .then(response => {
          ElMessage.success("反审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          handleError(error.message);
        });
    }
    if(currentAction.value === VoucherOperateType.POSTED){
      // 过账业务
      postedVoucher(form.value)
        .then(response => {
          ElMessage.success("过账成功")
          parseJson();
          getList();
        })
        .catch(error => {
          handleError(error.message);
        });
    }
    if(currentAction.value === VoucherOperateType.UN_POSTED){
      // 反过账业务
      unPostedVoucher(form.value)
        .then(response => {
          ElMessage.success("反过账成功")
          parseJson();
          getList();
        })
        .catch(error => {
          handleError(error.message);
        });
    }
    if(currentAction.value === VoucherOperateType.VOIDED){
      // 作废业务
      voidedVoucher(form.value)
        .then(response => {
          ElMessage.success("作废成功")
          parseJson();
          getList();
        })
        .catch(error => {
          handleError(error.message);
        });
    }

  } catch (error) {
    console.log("API 调用异常:", error);
    ElMessage.error("API 调用异常，请重试");
  } finally {
    // 关闭对话框和加载状态
    dialogVisible.value = false;
  }



}




// *************************************** 操作 end   ******************************

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
  ids.value = selection.map(item => item.voucherId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加会计凭证";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _voucherId = row.voucherId || ids.value
  getVoucher(_voucherId).then(response => {
    form.value = response.data;
    // 还原数据
    if (form.value.operateLog) {
      orderOperateLog.value = JSON.parse(form.value.operateLog);
      form.value.operateLog = JSON.parse(form.value.operateLog);
    }
    open.value = true;
    title.value = "修改会计凭证";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["voucherRef"].validate(valid => {
    if (valid) {
      if (form.value.voucherId != null) {
        updateVoucher(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVoucher(form.value).then(response => {
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
  const _voucherIds = row.voucherId || ids.value;
  proxy.$modal.confirm('是否确认删除会计凭证编号为"' + _voucherIds + '"的数据项？').then(function() {
    return delVoucher(_voucherIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/voucher/export', {
    ...queryParams.value
  }, `voucher_${new Date().getTime()}.xlsx`)
}

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
