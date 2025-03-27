<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="记账类型" prop="flowType">
        <el-select v-model="queryParams.flowType" placeholder="请选择记账类型" clearable>
          <el-option
            v-for="dict in finance_fund_flow_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="资金账户:" prop="fundAccountId">
        <el-select v-model="queryParams.fundAccountId"  filterable clearable>
          <el-option v-for="item in fundAccountList" :key="item.fundAccountId" :label="item.fundAccountName"
            :value="item.fundAccountId">
            <span>{{ '账户名称：' + item.fundAccountName + ' ---- ' + '账户号:' + item.fundAccountNo }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="流水状态" prop="flowStatus">
        <el-select v-model="queryParams.flowStatus" placeholder="请选择流水状态" clearable>
          <el-option
            v-for="dict in finance_fund_flow_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流水编号" prop="flowNo" >
        <el-input
          v-model="queryParams.flowNo"
          placeholder="请输入流水编号"
          clearable
          style="width: 100%;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易时间" prop="flowDate" style="width: 350px;">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          unlink-panels
          :clearable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-value="dateRange"
          @change="handleRangeChange"
          style="width: 100%;"
        />
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['finance:fundFlow:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:fundFlow:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:fundFlow:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:fundFlow:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button-group>
          <el-button type="primary" icon="Search" @click="handleQuery" style="margin-left: 50px;">搜索</el-button>
          <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
        </el-button-group>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="fundFlowList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="流水号码" align="left" header-align="center" prop="flowNo" min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <div style="display: flex; align-items: center;">
            <el-link :underline="false" type="primary" @click="handleUpdate(scope.row)">{{ scope.row.flowNo }}</el-link>
            <el-tooltip content="点击复制" placement="top" v-if="scope.row.flowNo">
              <el-icon
                style="margin-left: 5px; cursor: pointer; color: #409EFF;"
                @click="copyText(scope.row.flowNo)"
              >
                <CopyDocument />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="记账类型" align="center" prop="flowType" min-width="80">
        <template #default="scope">
          <dict-tag :options="finance_fund_flow_type" :value="scope.row.flowType"/>
        </template>
      </el-table-column>
      <el-table-column label="资金账户" align="center" prop="fundAccountId" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ getFundAccountName(scope.row.fundAccountId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会计科目" align="center" prop="financeAccountId" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ getAccountCodeName(scope.row.financeAccountId) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="流水时间" align="center" prop="flowTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.flowTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易前余额" align="center" prop="balanceBefore" min-width="100" >
        <template #default="scope">
          <span :style="{ color: scope.row.balanceBefore < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.balanceBefore) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="交易金额" align="center" prop="flowAmount" min-width="100" >
        <template #default="scope">
          <span :style="{ color: scope.row.flowAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.flowAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="交易后余额" align="center" prop="balanceAfter" min-width="100" >
        <template #default="scope">
          <span :style="{ color: scope.row.balanceAfter < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.balanceAfter) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="flowStatus" min-width="80">
        <template #default="scope">
          <dict-tag :options="finance_fund_flow_status" :value="scope.row.flowStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" header-align="center" prop="remark" min-width="150" show-overflow-tooltip />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改现金银行日记账对话框 -->
    <el-dialog v-model="open" width="61.8%" :show-close="false" :close-on-click-modal="false">
      <template #header="{ titleId, titleClass }">
        <div class="header-content">
          <div class="header-title">
            <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
            <dict-tag :options="finance_fund_flow_status" :value="form.flowStatus" />
          </div>
          <div class="header-actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="mr-4">
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.flowStatus == FlowStatusEnum.FLOW_STATUS_DRAFT"
                @click="handleSave" :loading="loading" 
                v-hasPermi="['finance:fundFlow:edit']"
              >
                保存
              </el-button>
              <el-button type="success" v-if="form.flowStatus == FlowStatusEnum.FLOW_STATUS_DRAFT && insertStatus === false"
                @click="handleSubmitAudited" :loading="loading" 
                v-hasPermi="['finance:fundFlow:edit']"
              >
                提交审核
              </el-button>
              <el-button type="danger" v-if="form.flowStatus == FlowStatusEnum.FLOW_STATUS_DRAFT && insertStatus === false"
                @click="handleRemove" :loading="loading" 
                v-hasPermi="['finance:fundFlow:remove']"
              >
                删除
              </el-button>

              <!-- 待审核状态 -->
               <el-button type="primary" v-if="form.flowStatus == FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED"
                @click="handleAudited" :loading="loading" 
                v-hasPermi="['finance:fundFlow:audited']"
              >
                审核
              </el-button>
              <el-button type="warning" v-if="form.flowStatus === FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED"
                @click="handleContinueEdit" :loading="loading" 
                v-hasPermi="['finance:fundFlow:edit']"
              >
                继续编辑
              </el-button>

              <!-- 审核状态 -->
              <el-button type="warning" v-if="form.flowStatus === FlowStatusEnum.FLOW_STATUS_AUDITED"
                @click="handleUnAudited" :loading="loading" 
                v-hasPermi="['finance:fundFlow:audited']"
              >
                反审核
              </el-button>

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrintFlow">打印</el-button>
              <el-button @click="handleExportFlow">导出</el-button>
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

      <!---- 表单内容 ---->
      <el-form ref="fundFlowRef" :model="form" :rules="rules" label-width="80px" style="margin-right: 30px" :disabled="form.flowStatus !== FlowStatusEnum.FLOW_STATUS_DRAFT">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="记账类型:" prop="flowType">
              <el-select v-model="form.flowType" placeholder="选择记账类型" >
                <el-option
                  v-for="dict in finance_fund_flow_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资金账户:" prop="fundAccountId">
              <el-select v-model="form.fundAccountId" placeholder="选择资金账户" filterable @change="setFinanceAccountId" style="width: 100%;">
                <el-option v-for="item in fundAccountList" :key="item.fundAccountId" :label="item.fundAccountName"
                  :value="item.fundAccountId">
                  <span>{{ '账户名称：' + item.fundAccountName + ' ---- ' + '账户号:' + item.fundAccountNo }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="会计科目:" prop="financeAccountId">
              <el-tree-select 
                v-model="form.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
                placeholder="请选择会计科目" style="width: 100%;"  filterable :disabled="false"
              >
              </el-tree-select>
            </el-form-item>
          </el-col>
          
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="交易金额:" prop="flowAmount">
              <el-input-number 
                v-model="form.flowAmount" 
                placeholder="交易金额" 
                :max='99999999' 
                :min='-99999999' 
                :precision='2' :controls="false"  ref="inputNumber" @focus="handleFocus" 
                :class="form.flowAmount < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交易前余额:" prop="balanceBefore">
              <el-input-number v-model="form.balanceBefore" placeholder="系统自动计算" disabled :precision='2' :controls="false" >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交易后余额:" prop="balanceAfter">
              <el-input-number v-model="form.balanceAfter" placeholder="系统自动计算" disabled :precision='2' :controls="false">
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="流水时间:" prop="flowTime">
              <el-date-picker clearable v-model="form.flowTime" type="date" placeholder="请选择流水时间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注描述:" prop="remark" >
          <el-input v-model="form.remark" type="textarea" maxlength="50" show-word-limit :rows="1"  placeholder="请输入备注描述信息" />
        </el-form-item>
        
        <el-divider content-position="left">
          <strong style="margin-right: 30px;"> 对方发生额明细 </strong>
        </el-divider>

        <el-row :gutter="10" class="mb8" >
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddFundFlowDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteFundFlowDetail">删除</el-button>
          </el-col>
        </el-row>

        <el-table :data="form.fundFlowDetailList" 
          :row-class-name="rowFundFlowDetailIndex" 
          @selection-change="handleFundFlowDetailSelectionChange" 
          ref="fundFlowDetail"
          :summary-method="getSummaryRow" show-summary
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="对方会计项目" prop="oppositeProjectId" width="130" align="center">
            <template #default="scope">
              <el-tree-select 
                v-model="scope.row.oppositeProjectId" :data="projectTree" :props="projectTreeProps" value-key="projectId"
                placeholder="会计项目" style="width: 100%;"  filterable @change="handleOppositeProjectId(scope.row)"
              >
              </el-tree-select>
            </template>
          </el-table-column>
          <el-table-column label="对方会计科目" prop="oppositeAccountId" width="200" align="center">
            <template #default="scope">
              <el-tree-select 
                v-model="scope.row.oppositeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
                placeholder="会计科目" style="width: 100%;"  filterable @change="handleChangeAccountId(scope.row)"
              >
              </el-tree-select>
            </template>
          </el-table-column>
          <el-table-column label="辅助项" min-width="120" prop="assistType" >
            <template #default="scope">
              <el-select v-model="scope.row.assistType" placeholder="辅助项" clearable style="width: 100%;">
                <el-option
                  v-for="dict in finance_assist_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                  :disabled="!assistTypes.includes(Number(dict.value))"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="辅助值" min-width="100" prop="assistId">
            <template #default="scope">
              <!-- 客户 -->
              <el-select v-model="scope.row.assistId" placeholder="客户" clearable style="width: 100%;" filterable v-if="scope.row.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
                <el-option
                  v-for="customer in customerList"
                  :key="customer.customerId"
                  :label="customer.customerName"
                  :value="customer.customerId"
                  :disabled="customer.customerStatus !== '0'"
                >
                  <span>{{ '客户名称：' + customer.customerName + ' ---- ' + '客户编码：' + customer.customerCode }}</span>
                </el-option>
              </el-select>
              <!-- 供应商 -->
              <el-select v-model="scope.row.assistId" placeholder="供应商" clearable style="width: 100%;" filterable v-if="scope.row.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
                <el-option
                  v-for="supplier in supplierList"
                  :key="supplier.supplierId"
                  :label="supplier.supplierName"
                  :value="supplier.supplierId"
                  :disabled="supplier.supplierStatus !== '0'"
                >
                  <span>{{ '供应商名称：' + supplier.supplierName + ' ---- ' + '供应商编码：' + supplier.supplierCode }}</span>
                </el-option>
              </el-select>
              <!-- 员工 -->
              <el-select v-model="scope.row.assistId" placeholder="员工" clearable style="width: 100%;" filterable v-if="scope.row.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
                <el-option
                  v-for="user in userList"
                  :key="user.userId"
                  :label="user.userName"
                  :value="user.userId"
                  :disabled="user.status !== '0'"
                >
                  <span>{{ '员工名称：' + user.userName + ' ---- ' + '员工昵称：' + user.nickName }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="发生额" prop="detailAmount" width="150" align="center">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'detailAmount')" v-model="scope.row.detailAmount"
              placeholder="发生额" :max='99999999' :min='-99999999' :precision='2' :step='0' :controls="false" style="width: 100%;" 
              @focus="handleFocus2(scope.$index, 'detailAmount')"
              @click="handleFocus2(scope.$index, 'detailAmount')"
              :class="scope.row.detailAmount < 0 ? 'negative-input' : ''"
            >
              <template #suffix>
                <span>€</span>
              </template>
            </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="关联单据类型" prop="documentType" width="130" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.documentType" placeholder="请选择关联单据类型" style="width: 100%;" clearable>
                <el-option
                  v-for="dict in finance_document_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="单据号码" prop="documentNo" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-input v-model="scope.row.documentNo" placeholder="单据号" type="textarea" :maxlength="50" show-word-limit style="width: 100%;" :rows="1"/>
            </template>
          </el-table-column>
          <el-table-column label="摘要描述" prop="summary" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.summary" placeholder="摘要描述" type="textarea" :maxlength="20" show-word-limit style="width: 100%;" :rows="1"/>
            </template>
          </el-table-column>
        </el-table>

      </el-form>

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
            <el-button @click="dialogVisible = false ">取消</el-button>
            <el-button type="primary" @click="submitApproval">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>

    </el-dialog>
  </div>
</template>

<script setup name="FundFlow">
import { listFundFlow, getFundFlow, delFundFlow, addFundFlow, updateFundFlow, continueEditFundFlow, auditedFundFlow, unAuditedFundFlow, submitAuditFundFlow } from "@/api/finance/fundFlow";
import { listFundAccount} from "@/api/finance/fundAccount";
import { listAccount } from "@/api/finance/account";
import { listFinanceProject } from "@/api/finance/financeProject";
import useUserStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { listSupplier} from "@/api/order/supplier";
import { listCustomer} from "@/api/order/customer";
import { listUser } from "@/api/system/user";
import { onMounted, ref } from "vue";


// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_document_type, finance_fund_flow_type, finance_fund_flow_status, finance_assist_type } = proxy.useDict('finance_document_type', 'finance_fund_flow_type', 'finance_fund_flow_status', 'finance_assist_type');

const fundFlowList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedFundFlowDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const insertStatus = ref(false);

const FlowTypeEnum = {
  // 收款
  FLOW_TYPE_INCOME: '1',
  // 付款
  FLOW_TYPE_EXPENDITURE: '2',
  // 内部转账
  FLOW_TYPE_INTERNAL_TRANSFER: '3',
  // 发票存现
  FLOW_TYPE_INVOICE_CASH: '4',
}

// 复制功能
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功！')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// ------------------------------------------ 1 获取资金账户 start -----------------------------------
const fundAccountList = ref([])
/** 资金账户 - 获取列表 */
const getFundAccountList = async () => {
  listFundAccount()
    .then(response => {
      fundAccountList.value = response.rows || [];
    })
    .catch(error => {
      ElMessage.error("获取资金账户列表时出错:",error)
    })
};

getFundAccountList()

/** 根据资金账户Id 获取资金账户名称 */
const getFundAccountName = (fundAccountId) => {
  return fundAccountList.value.find(item => item.fundAccountId === fundAccountId)?.fundAccountName || '--' ;
}

/** 根据资金账户Id 获取会计科目ID */
const setFinanceAccountId = () => {
  // 获取资金账户名称
  const financeAccountId = fundAccountList.value.find(item => item.fundAccountId === form.value.fundAccountId)?.financeAccountId  ;
  if (!financeAccountId) {
    ElMessage.error("获取资金账户名称时出错:",error)
  }
  form.value.financeAccountId = financeAccountId
}



// ------------------------------------------ 1 获取资金账户 end -----------------------------------

// --------------------------------  2 获取科目列表数据  start  --------------------------------
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

/** 根据科目ID 查询科目编码 + 科目名称 */
const getAccountCodeName = (accountId) => {
  const account = accountList.value.find(item => item.accountId === accountId)
  return account ? account.accountCode + ' - ' + account.accountName : '--'
}

/** 切换会计科目 */
const handleChangeAccountId = (row) => {
  // 清空辅助核算ID
  row.assistId = null
  row.assistName = null
  // 更新辅助项的内容
  row.assistType = getAssistTypeByAccountId(row.oppositeAccountId)
  row.oppositeProjectId = null
  
}

getAccountList()

// --------------------------------  2 获取科目列表数据  end  --------------------------------

// --------------------------------  3 获取项目列表数据  start  --------------------------------
// 会计科目 - 初始化列表
const projectList = ref([])
const projectTree = ref([])
/** 会计科目 - 获取列表 */
const getProjectList = async () => {
  listFinanceProject()
    .then(response => {
      projectTree.value = proxy.handleTree(response.data, "projectId", "parentId") || [];
      projectList.value = response.data || [];
    })
    .catch(error => {
      ElMessage.error("获取 会计项目 列表时出错:",error)
    })
};


/** el-tree-select 配置 */ 
const projectTreeProps = {
  value: "projectId",
  label: (node) => ` ${node.projectName}`, // 自定义显示内容
  children: "children",
  disabled: (node) => node.projectStatus == '1'
};

/** 切换项目 确定明细会计科目Id */
const assistTypes = ref([])
const handleOppositeProjectId = (row) => {
  const detailAccountId = projectList.value.find(item => item.projectId === row.oppositeProjectId)?.financeAccountId
  if(detailAccountId){
    row.oppositeAccountId = detailAccountId
    row.assistType = getAssistTypeByAccountId(detailAccountId)
  }
  // 切换项目 初始化 辅助项值
  row.assistId = null
  row.assistName = null
}

/** 根据科目ID 查询辅助项类型 */
const getAssistTypeByAccountId = (accountId) => {
  const account = accountList.value.find(item => item.accountId === accountId)
  assistTypes.value = account.assistTypes
  return assistTypes ? assistTypes.value[0] : ''
}

getProjectList()

// --------------------------------  3 获取项目列表数据  end  --------------------------------

// --------------------------------- 4 获取辅助项  start  --------------------------------
/** 辅助项类型 */
const  AssistTypeEnum = {
  // 客户
  ASSIST_TYPE_CUSTOMER: '1',
  // 供应商
  ASSIST_TYPE_SUPPLIER: '2',
  // 员工
  ASSIST_TYPE_EMPLOYEE: '3'
}

const supplierList = ref([])
const customerList = ref([])
const userList = ref([])
listSupplier()
  .then(
    response => { supplierList.value = response.rows || []}
  )
  .catch(
    error => {ElMessage.error("获取供应商列表时出错:",error)}
  )
listCustomer()
  .then(
    response => {
      customerList.value = response.rows || [];
      console.log("获取客户列表customerList:",customerList.value)
    
    }
    
  )
  .catch(
    error => {ElMessage.error("获取客户列表时出错:",error)}
  )
listUser()
  .then(
    response => {userList.value = response.rows || []}
  )
  .catch(
    error => {ElMessage.error("获取客户列表时出错:",error)}
  )

// ------------------------------------ 4 获取辅助项  end  --------------------------------

// ------------------------------------------ 5 请求参数 - 日期区间 start -----------------------------------
const currentMonthStart = new Date(new Date().setDate(1));
const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
/** 格式化日期为 YYYY-MM-DD */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const dateRange = ref([formatDate(currentMonthStart), formatDate(currentMonthEnd)]);


// 禁用日期 :disabled-date="disabledDate"
const  disabledDate = (time) => {
  // 获取当前日期
  const now = new Date();
  // 计算3个月前的第一天
  const maxRangeStart = new Date( now.getFullYear(), now.getMonth() - 3, 1 );
  // 计算3个月后的最后一天
  const maxRangeEnd = new Date( now.getFullYear(), now.getMonth() + 4, 0 );
  return time.getTime() < maxRangeStart.getTime() || time.getTime() > maxRangeEnd.getTime();
}
// 处理日期范围变化
const handleRangeChange = (dates) => {
  if (dates && dates.length === 2) {
    const [start, end] = dates.map((date) => new Date(date)); // 将字符串转换为 Date 对象
    // 计算月份差
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // 如果跨度超过3个月，重置为合法范围
    if (monthDiff > 2) {
      const newEnd = new Date(start.getFullYear(), start.getMonth() + 3, 0); // 跨3个月的最后一天
      dateRange.value = [formatDate(start), formatDate(newEnd)]; // 重置范围
      ElMessage.warning("时间跨度不能超过3个月!");
    }
  }
};

// ------------------------------------------ 5 请求参数 - 日期区间 end ----------------------------------------

// ------------------------------------ 表单 输入框聚焦选中 start ------------------------------------
const inputNumber  = ref({}); // 使用对象存储各列引用

// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ------------------------------------ 表单 输入框聚焦选中 end ------------------------------------

// ------------------------------------ 表格 输入框聚焦选中 start ------------------------------------
const inputRefs = ref({}); // 使用对象存储各列引用
// 动态管理每列引用
const setInputRef = (el, rowIndex, column) => {
  if (!inputRefs.value[column]) {
    inputRefs.value[column] = [];
  }
  inputRefs.value[column][rowIndex] = el;
};

// 聚焦时选中内容
const handleFocus2 = (rowIndex, column) => {
  const inputEl = inputRefs.value[column]?.[rowIndex]?.$el.querySelector('input');
  if (inputEl) {
    inputEl.select(); // 选中输入框内容
  }
};

// ------------------------------------ 表格 输入框聚焦选中 end ------------------------------------
/** 合计行 */
const getSummaryRow = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'detailAmount') {
      // 计算借方总金额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.detailAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    }  else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'assistId' ? '合计金额 :' : ''
    }
  })
  
  return sums
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    flowNo: null,
    flowType: null,
    flowStatus: null,
    fundAccountId: null,
    tenantId: null
  },
  rules: {
    flowType: [
      { required: true, message: "记账类型不能为空", trigger: "change" }
    ],
    fundAccountId: [
      { required: true, message: "资金账户ID不能为空", trigger: "blur" }
    ],
    financeAccountId: [
      { required: true, message: "会计科目不能为空", trigger: "blur" }
    ],
    flowTime: [
      { required: true, message: "流水时间不能为空", trigger: "blur" }
    ],
    flowAmount: [
      { required: true, message: "交易金额不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// --------------------- dialog start ---------------------
/** 凭证状态 */ 
const FlowStatusEnum = {
  // 草稿
  FLOW_STATUS_DRAFT: 1,
  // 待审核
  FLOW_STATUS_WAIT_AUDITED: 2,
  // 已审核
  FLOW_STATUS_AUDITED: 3,
  // 已过账
  FLOW_STATUS_POSTED: 4,
}



// --------------------- dialog end ---------------------

/** 查询现金银行日记账列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listFundFlow(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    fundFlowList.value = response.rows || [];
    total.value = response.total;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  insertStatus.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    flowId: null,
    flowType: null,
    fundAccountId: null,
    financeAccountId: null,
    flowTime: new Date(),
    flowAmount: null,
    balanceBefore: null,
    balanceAfter: null,
    flowStatus: 1,
    remark: null,
    tenantId: null,
    operateLog: null,
    fundFlowDetailList: [],
  };
  orderOperateLog.value = [];
  proxy.resetForm("fundFlowRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value=[formatDate(currentMonthStart), formatDate(currentMonthEnd)];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.flowId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  handleAddFundFlowDetail()
  open.value = true;
  insertStatus.value = true;
  title.value = "添加现金银行日记账";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _flowId = row.flowId || ids.value
  getFundFlow(_flowId).then(response => {
    form.value = response.data;
    // 还原数据
    if (form.value.operateLog) {
      orderOperateLog.value = JSON.parse(form.value.operateLog);
      form.value.operateLog = JSON.parse(form.value.operateLog);
    }
    open.value = true;
    insertStatus.value = false;
    title.value = "修改现金银行日记账";
  });
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _flowIds = row.flowId || ids.value;
  proxy.$modal.confirm('是否确认删除现金银行日记账的数据项?').then(function() {
    return delFundFlow(_flowIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 现金银行日记账明细序号 */
function rowFundFlowDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 现金银行日记账明细添加按钮操作 */
function handleAddFundFlowDetail() {
  const newDetails = Array.from({ length: 2 }, () => ({
    oppositeProjectId: null,
    oppositeAccountId: null,
    detailAmount: 0,
    documentType: null,
    documentNo: null,
    summary: null,
    assistType: null,
    assistId: null,
    assistName: null
  }))
  form.value.fundFlowDetailList.push(...newDetails);
}

/** 现金银行日记账明细删除按钮操作 */
function handleDeleteFundFlowDetail() {
  if (checkedFundFlowDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的现金银行日记账明细数据");
  } else {
    const fundFlowDetails = form.value.fundFlowDetailList;
    const checkedFundFlowDetails = checkedFundFlowDetail.value;
     form.value.fundFlowDetailList = fundFlowDetails.filter(function(item) {
      return checkedFundFlowDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleFundFlowDetailSelectionChange(selection) {
  checkedFundFlowDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/fundFlow/export', {
    ...queryParams.value
  }, `fundFlow_${new Date().getTime()}.xlsx`)
}

/** 打印按钮操作 */
const handlePrintFlow = () => {
  console.log('打印form 值:', form.value);
  console.log('打印fundFlowDetailList 值:', form.value.fundFlowDetailList);
}

/** */ 
const handleExportFlow = () => {
  console.log('导出流水明细');
}



  


// *************************************** 操作 start ******************************
// 订单操作类型
const FundFlowOperateType = {
  // 保存
  SAVE: 'save',
  // 继续编辑
  CONTINUE_EDIT: 'continueEdit',
  // 提交审核
  SUBMIT_AUDIT: 'submitAudit',
  // 审核
  AUDITED: 'audited',
  // 反审核
  UN_AUDITED: 'unAudited',
}

const handleSave = () => {
  // 0 表单预校验提交校验 
  proxy.$refs["fundFlowRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.fundFlowDetailList = form.value.fundFlowDetailList.filter(item => item.oppositeAccountId !== null) ;
    // 2 检查存在分录
    if(form.value.fundFlowDetailList.length <= 0){
      proxy.$modal.msgError("请添加明细内容！")
      return;
    }
    // 2.1 维护摘要信息
    form.value.fundFlowDetailList.forEach(item => {
      item.summary = item.summary ? item.summary : form.value.remark;
    });

    // 3 检查试算平衡
    const totalDetailAmount = form.value.fundFlowDetailList.reduce((total, item) => total + item.detailAmount, 0);
    if(form.value.flowAmount !== totalDetailAmount){
      proxy.$modal.msgError("交易金额 与 发生额合计 不一致，请检查！")
      return;
    }

    // 4 辅助项检查
    if(form.value.fundFlowDetailList.some(item => item.assistType && !item.assistId)){
      proxy.$modal.msgError("请选择辅助项！")
      return;
    }

    // 5 收款类型检查，收款 交易金额大于0、付款 交易金额小于0
    if(form.value.flowType == 1 && form.value.flowAmount <= 0){
      proxy.$modal.msgError("收款类型 交易金额必须大于0 ,请检查!")
      return;
    }
    if(form.value.flowType == 2 && form.value.flowAmount >= 0){
      proxy.$modal.msgError("付款类型 交易金额必须小于0 ,请检查!")
      return;
    }

    // 6 交易额 及 所有明细 正负值保持一致，交易额是正或者负，对应的所有明细也必须是正或者负
    if(form.value.flowAmount < 0){
      // 所有明细都必须是小于0的数值
      if(form.value.fundFlowDetailList.some(item => item.detailAmount > 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为负数, 请检查!")
        return;
      }
    }
    if(form.value.flowAmount > 0){
      // 所有明细都必须是大于0的数值
      if(form.value.fundFlowDetailList.some(item => item.detailAmount < 0 )){
        proxy.$modal.msgError("正负数需要保持一致, 应都为正数, 请检查!")
        return;
      }
    }

    // 7 明细不可以有0值的存在
    if(form.value.fundFlowDetailList.some(item => item.detailAmount == 0)){
      proxy.$modal.msgError("明细金额不能为 0 ,请检查!")
      return;
    }

    // 8 保存操作
    openApprovalDialog('保存', FundFlowOperateType.SAVE)

  })  
}

const handleContinueEdit = () => {
  openApprovalDialog('继续编辑', FundFlowOperateType.CONTINUE_EDIT)
}

const handleSubmitAudited = () => {
   // 0 表单预校验提交校验 
  proxy.$refs["fundFlowRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.fundFlowDetailList = form.value.fundFlowDetailList.filter(item => item.oppositeAccountId !== null) ;
    // 2 检查存在分录
    if(form.value.fundFlowDetailList.length <= 0){
      proxy.$modal.msgError("请添加明细内容！")
      return;
    }
    // 2.1 维护摘要信息
    form.value.fundFlowDetailList.forEach(item => {
      item.summary = item.summary ? item.summary : form.value.remark;
    });

    // 3 检查试算平衡
    const totalDetailAmount = form.value.fundFlowDetailList.reduce((total, item) => total + item.detailAmount, 0);
    if(form.value.flowAmount !== totalDetailAmount){
      proxy.$modal.msgError("交易金额 与 发生额合计 不一致，请检查！")
      return;
    }

    // 4 辅助项检查
    if(form.value.fundFlowDetailList.some(item => item.assistType && !item.assistId)){
      proxy.$modal.msgError("请选择辅助项！")
      return;
    }

    // 5 收款类型检查，收款 交易金额大于0、付款 交易金额小于0
    if(form.value.flowType == 1 && form.value.flowAmount <= 0){
      proxy.$modal.msgError("收款类型 交易金额必须大于0 ,请检查!")
      return;
    }
    if(form.value.flowType == 2 && form.value.flowAmount >= 0){
      proxy.$modal.msgError("付款类型 交易金额必须小于0 ,请检查!")
      return;
    }

    // 6 交易额 及 所有明细 正负值保持一致，交易额是正或者负，对应的所有明细也必须是正或者负
    if(form.value.flowAmount < 0){
      // 所有明细都必须是小于0的数值
      if(form.value.fundFlowDetailList.some(item => item.detailAmount > 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为负数, 请检查!")
        return;
      }
    }
    if(form.value.flowAmount > 0){
      // 所有明细都必须是大于0的数值
      if(form.value.fundFlowDetailList.some(item => item.detailAmount < 0 )){
        proxy.$modal.msgError("正负数需要保持一致, 应都为正数, 请检查!")
        return;
      }
    }

    // 7 明细不可以有0值的存在
    if(form.value.fundFlowDetailList.some(item => item.detailAmount == 0)){
      proxy.$modal.msgError("明细金额不能为 0 ,请检查!")
      return;
    }

    // 8 提交审核操作
    openApprovalDialog('提交审核', FundFlowOperateType.SUBMIT_AUDIT)

  })  
}

const handleAudited = () => {
  openApprovalDialog('审核通过', FundFlowOperateType.AUDITED)
}

const handleUnAudited = () => {
  openApprovalDialog('反审核', FundFlowOperateType.UN_AUDITED)
}

const handleRemove = () => {
  proxy.$modal.confirm('是否确认删除现金银行日记账的数据项?').then(function() {
    return delFundFlow(form.value.flowId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
    // 关闭对话框和加载状态
    open.value = false;
    dialogVisible.value = false;
    insertStatus.value = false;
  }).catch(() => {
  });

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
    [FundFlowOperateType.SAVE]: '保存原因',
    [FundFlowOperateType.SUBMIT_AUDIT]: '提交审核原因',
    [FundFlowOperateType.CONTINUE_EDIT]: '继续编辑原因',
    [FundFlowOperateType.AUDITED]: '审核通过原因',
    [FundFlowOperateType.UN_AUDITED]: '反审核原因',
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

// ---------------------------- 操作记录 start ------------------------------------
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
    continueEdit: 'warning',
    submitAudit: 'primary',
    audited: 'success',
    unAudited: 'danger',
    posted: 'success',
    unPosted: 'danger',
    voided: 'danger'
  }
  return typeMap[actionValue] || 'info'
}

// ---------------------------- 操作记录 end ------------------------------------

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

// 强制输入描述信息: 反审核 
const actionRequiresRemark = [FundFlowOperateType.UN_AUDITED];
// 不需要输入描述信息: 保存 审核 继续编辑
const actionRequiresNoRemark = [FundFlowOperateType.SAVE, FundFlowOperateType.AUDITED, FundFlowOperateType.CONTINUE_EDIT, FundFlowOperateType.SUBMIT_AUDIT];

const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 2 定义动作及相应状态
  const actions = {
    [FundFlowOperateType.SAVE]: {
      status: FlowStatusEnum.FLOW_STATUS_DRAFT,
      message: '保存成功',
      actionValue: FundFlowOperateType.SAVE
    },
    [FundFlowOperateType.SUBMIT_AUDIT]: {
      status: FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED,
      message: '提交审核成功',
      actionValue: FundFlowOperateType.SUBMIT_AUDIT
    },
    [FundFlowOperateType.CONTINUE_EDIT]: {
      status: FlowStatusEnum.FLOW_STATUS_DRAFT,
      message: '继续编辑成功',
      actionValue: FundFlowOperateType.CONTINUE_EDIT
    },
    [FundFlowOperateType.AUDITED]: {
      status: FlowStatusEnum.FLOW_STATUS_AUDITED,
      message: '审核通过',
      actionValue: FundFlowOperateType.AUDITED
    },
    [FundFlowOperateType.UN_AUDITED]: {
      status: FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED,
      message: '反审核 成功!',
      actionValue: FundFlowOperateType.UN_AUDITED
    },
  }

  // 3 状态 操作记录 赋值
  const currentActionConfig = actions[currentAction.value]
  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.flowStatus = currentActionConfig.status;
  form.value.operateLog = JSON.stringify(orderOperateLog.value);

  // 4 业务处理
  try{
    loading.value = true;
    if( currentAction.value === FundFlowOperateType.SAVE) {
      proxy.$refs["fundFlowRef"].validate(valid => {
        if (valid) {
          // 修改 / 新增 业务
          if (form.value.flowId != null) {
            updateFundFlow(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("修改成功");
              parseJson();
              getList();
            })
            .catch(error => {
              form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_DRAFT;
              handleError(error.message);
            });
          } else {
            addFundFlow(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("新增成功");
              getFundFlow(response.data).then(response => {
                form.value = response.data;
              });
              parseJson();
              getList();
            })
            .catch(error => {
              form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_DRAFT;
              handleError(error.message);
            });
          }
        }
      });
    }
    if(currentAction.value === FundFlowOperateType.CONTINUE_EDIT){
      // 继续编辑
      continueEditFundFlow(form.value)
        .then(response => {
          ElMessage.success("继续编辑凭证成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED;
          handleError(error.message);
        });
    }
    if(currentAction.value === FundFlowOperateType.AUDITED){
      // 审核
      auditedFundFlow(form.value)
        .then(response => {
          ElMessage.success("审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_WAIT_AUDITED;
          handleError(error.message);
        });
    }
    if(currentAction.value === FundFlowOperateType.UN_AUDITED){
      // 反审核
      unAuditedFundFlow(form.value)
        .then(response => {
          ElMessage.success("反审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_AUDITED;
          handleError(error.message);
        });
    }
    if(currentAction.value === FundFlowOperateType.SUBMIT_AUDIT){
      // 提交审核
      submitAuditFundFlow(form.value)
        .then(response => {
          ElMessage.success("提交审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.flowStatus = FlowStatusEnum.FLOW_STATUS_DRAFT;
        })
    }
  } catch (error) {
    console.log("API 调用异常:", error);
    ElMessage.error("API 调用异常，请重试");
  } finally {
    // 关闭对话框和加载状态
    dialogVisible.value = false;
    insertStatus.value = false;
    loading.value = false;
  }
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

// :deep(.el-input-number) {
//   color: black; /* 默认字体颜色 */
// }
:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}

/* 可自定义图标 hover 效果 */
.el-icon:hover {
  color: #67C23A !important;
}
</style>
