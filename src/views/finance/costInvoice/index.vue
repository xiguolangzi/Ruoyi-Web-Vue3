<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="发票类型:" prop="invoiceType">
        <el-select v-model="queryParams.invoiceType" placeholder="请选择发票类型" clearable>
          <el-option
            v-for="dict in erp_purchase_invoice_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发票状态:" prop="invoiceStatus">
        <el-select v-model="queryParams.invoiceStatus" placeholder="请选择发票状态" clearable>
          <el-option
            v-for="dict in erp_purchase_invoice_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="辅助类型:" prop="assistType">
        <el-select v-model="queryParams.assistType" placeholder="请选择客户类型"  @keyup.enter="handleQuery" @change="changeQueryParamsAssistType" clearable>
          <el-option
            v-for="dict in finance_assist_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择客户:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
        <!-- 客户 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择客户" clearable  filterable>
          <el-option
            v-for="customer in customerList"
            :key="customer.customerId"
            :label="customer.customerName"
            :value="customer.customerId"
            :disabled="customer.customerStatus !== '0'"
          >
            <span>{{ `客户名称：${customer.customerName} ---- 客户编码：${customer.customerCode}` }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择供应商:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
        <!-- 供应商 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择供应商" clearable  filterable >
          <el-option
            v-for="supplier in supplierList"
            :key="supplier.supplierId"
            :label="supplier.supplierName"
            :value="supplier.supplierId"
            :disabled="supplier.supplierStatus !== '0'"
          >
            <span>{{ `供应商名称：${supplier.supplierName} ---- 供应商编码：${supplier.supplierCode}` }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择员工:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
        <!-- 员工 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择员工" clearable  filterable >
          <el-option
            v-for="user in userList"
            :key="user.userId"
            :label="user.userName"
            :value="user.userId"
            :disabled="user.status !== '0'"
          >
            <span>{{ `员工名称：${user.userName} ---- 员工昵称：${ user.nickName}` }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="流水号/发票号/订单号:" prop="invoiceNo" class="query-invoiceNo">
        <el-input
          v-model.trim="queryParams.invoiceNo"
          placeholder="请输入流水号/发票号/订单号"
          clearable
          @keyup.enter="handleQuery"
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
          v-hasPermi="['finance:costInvoice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:costInvoice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:costInvoice:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:costInvoice:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="Search" @click="handleQuery" style="margin-left: 50px;">搜索</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="Refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="Search" @click="queryOverdue">搜索逾期未付</el-button>
      </el-col>
      
        
        
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="costInvoiceList" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流水号码" align="left" header-align="center" prop="invoiceFlowNo" min-width="160" show-overflow-tooltip >
        <template #default="scope">
          <div style="display: flex; align-items: center; width: 100%;">
            <el-link :underline="false" type="primary" @click="handleUpdate(scope.row)">{{ scope.row.invoiceFlowNo }}</el-link>
            <el-tooltip content="点击复制" placement="top" v-if="scope.row.invoiceFlowNo">
              <el-icon
                style="margin-left: 5px; cursor: pointer; color: #409EFF;"
                @click="copyText(scope.row.invoiceFlowNo)" 
              >
                <CopyDocument />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="发票类型" align="center" prop="invoiceType">
        <template #default="scope">
          <dict-tag :options="erp_purchase_invoice_type" :value="scope.row.invoiceType"/>
        </template>
      </el-table-column>
      <el-table-column label="辅助类型" align="center" prop="assistType" >
        <template #default="scope">
          <dict-tag :options="finance_assist_type" :value="scope.row.assistType"/>
        </template>
      </el-table-column>
      <el-table-column label="辅助项值" align="left" header-align="center" prop="assistId" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ getAssistNameByAssistId(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发票号码" align="left" header-align="center" prop="invoiceNo"  min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <el-link :underline="false" type="primary" @click="handleUpdate(scope.row)">{{ scope.row.invoiceNo }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="订单号码" align="left" header-align="center" prop="orderNo"  min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <el-link :underline="false" type="danger" @click="handleUpdate(scope.row)">{{ scope.row.orderNo }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="发票状态" align="center" prop="invoiceStatus">
        <template #default="scope">
          <dict-tag :options="erp_purchase_invoice_status" :value="scope.row.invoiceStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="发票金额" align="center" prop="invoiceTotalBaseAmount" min-width="90">
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalBaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣金额" align="center" prop="invoiceTotalDiscountAmount" min-width="90">
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalDiscountAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="发票税额" align="center" prop="invoiceTotalTaxAmount" min-width="90" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalTaxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="应付金额" align="center" prop="invoiceTotalNetAmount" min-width="90" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.invoiceTotalNetAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="开票日期" align="center" prop="invoiceDate"  min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.invoiceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="付款到期日" align="center" prop="paymentDueDate" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.paymentDueDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="left" header-align="center" prop="remark" min-width="130" show-overflow-tooltip/>
      <el-table-column label="未核销金额" align="center" prop="remainAmount" min-width="90">
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.remainAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="已核销金额" align="center" prop="verifiedAmount" min-width="90">
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.verifiedAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="实际入库金额" align="center" prop="accountsPayable" min-width="120" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.accountsPayable) }} €</span>
        </template>
      </el-table-column>
      
      <el-table-column label="上传附件" align="left" header-align="center" prop="uploadedFile" min-width="150" show-overflow-tooltip>
        <template v-slot="scope">
          <el-text class="el-icon-document" truncated type="primary">{{ getFileName(scope.row.uploadedFile) }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip/>
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip>
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

    <!-- 添加或修改费用登记对话框 -->
    <el-dialog v-model="open" width="70%" :show-close="false" :close-on-click-modal="false" >
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
              <el-button type="primary" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_DRAFT"
                @click="handleSave" :loading="loading" 
                v-hasPermi="['finance:costInvoice:edit']"
              >
                保存
              </el-button>
              <el-button type="success" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_DRAFT && insertStatus == false"
                @click="handleSubmitAudited" :loading="loading" 
                v-hasPermi="['finance:costInvoice:edit']"
              >
                提交审核
              </el-button>
              <el-button type="danger" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_DRAFT && insertStatus == false"
                @click="handleRemove" :loading="loading" 
                v-hasPermi="['finance:costInvoice:remove']"
              >
                删除
              </el-button>

              <!-- 待审核状态 -->
               <el-button type="primary" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED"
                @click="handleAudited" :loading="loading" 
                v-hasPermi="['finance:costInvoice:audited']"
              >
                审核
              </el-button>
              <el-button type="warning" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED"
                @click="handleContinueEdit" :loading="loading" 
                v-hasPermi="['finance:costInvoice:edit']"
              >
                继续编辑
              </el-button>

              <!-- 审核状态 -->
              <el-button type="warning" v-if="form.invoiceStatus === InvoiceStatusEnum.INVOICE_STATUS_AUDITED"
                @click="handleUnAudited" :loading="loading" 
                v-hasPermi="['finance:costInvoice:audited']"
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

      <el-form ref="costInvoiceRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
             <el-form-item label="发票类型:" prop="invoiceType">
              <el-select v-model="form.invoiceType" placeholder="请选择发票类型" @change="changeInvoiceType">
                <el-option
                  v-for="dict in erp_purchase_invoice_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="辅助项类型:" prop="assistType">
              <el-select v-model="form.assistType" placeholder="请选择客户类型" @change="changeAssistType" :disabled="form.invoiceType == InvoiceTypeEnum.INVOICE_TYPE_PURCHASE">
                <el-option
                  v-for="dict in finance_assist_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6" >
            <el-form-item label="选择客户:" prop="assistId" v-if="form.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
              <!-- 客户 -->
              <el-select v-model="form.assistId" placeholder="请选择客户" clearable style="width: 100%;" filterable>
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
            </el-form-item>
            <el-form-item label="选择供应商:" prop="assistId" v-if="form.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
               <!-- 供应商 -->
              <el-select v-model="form.assistId" placeholder="请选择供应商" clearable style="width: 100%;" filterable >
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
            </el-form-item>
            <el-form-item label="选择员工:" prop="assistId" v-if="form.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
            <!-- 员工 -->
              <el-select v-model="form.assistId" placeholder="请选择员工" clearable style="width: 100%;" filterable >
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
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="会计科目:" prop="mainFinanceAccountId">
              <el-tree-select 
                v-model="form.mainFinanceAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
                placeholder="会计科目" style="width: 100%;"  filterable :disabled="true"
              >
              </el-tree-select>
            </el-form-item>
          </el-col>
          
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发票编号:" prop="invoiceNo">
              <el-input v-model.trim="form.invoiceNo" placeholder="请输入发票号码" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单编号:" prop="orderNo">
              <el-input v-model.trim="form.orderNo" placeholder="请输入订单号码" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="开票日期:" prop="invoiceDate">
              <el-date-picker clearable
                v-model="form.invoiceDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开票日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="付款到期日:" prop="paymentDueDate">
              <el-date-picker clearable
                v-model="form.paymentDueDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择付款到期日">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发票总额:" prop="invoiceTotalNetAmount">
              <el-input-number 
                v-model="form.invoiceTotalNetAmount" 
                placeholder="请输入交易金额" 
                :max='99999999' 
                :min='-99999999' 
                :precision='2' :step='0' :controls="false"  ref="inputNumber" @focus="handleFocus" 
                :class="form.invoiceTotalNetAmount < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="未核销金额:" prop="remainAmount">
              <span :style="{ color: form.remainAmount < 0 ? 'red' : 'black' }" >{{ formatTwo(form.remainAmount) }} € </span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="已核销金额:" prop="verifiedAmount">
              <span :style="{ color: form.verifiedAmount < 0 ? 'red' : 'black' }" >{{ formatTwo(form.verifiedAmount) }} € </span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入库单金额:" prop="accountsPayable" v-if="form.invoiceType == InvoiceTypeEnum.INVOICE_TYPE_PURCHASE">
              <span :style="{ color: form.accountsPayable < 0 ? 'red' : 'black' }" >{{ formatTwo(form.accountsPayable) }} € </span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注/摘要:" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :rows="1" :maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="上传附件:" prop="uploadedFile">
          <file-upload v-model="form.uploadedFile"/>
        </el-form-item>

        <el-divider content-position="left">费用登记明细信息</el-divider>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddPurchaseInvoiceDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeletePurchaseInvoiceDetail">删除</el-button>
          </el-col>
        </el-row>

        <el-table :data="form.purchaseInvoiceDetailList" 
          :row-class-name="rowPurchaseInvoiceDetailIndex" 
          @selection-change="handlePurchaseInvoiceDetailSelectionChange" 
          ref="purchaseInvoiceDetail"
          :summary-method="getSummaryRow" show-summary
        >
          <el-table-column type="selection" :width="50" align="center" />
          <el-table-column label="会计项目" prop="projectId" :width="130" align="center">
            <template #default="scope">
              <el-tree-select 
                v-model="scope.row.projectId" :data="projectTree" :props="treeProps2" value-key="projectId"
                placeholder="会计项目" style="width: 100%;"  filterable
                @change="handleProjectId(scope.row)"
              >
              </el-tree-select>
            </template>
          </el-table-column>
          <el-table-column label="会计科目" prop="financeAccountId" :width="200" align="center">
            <template #default="scope">
              <el-tree-select 
                v-model="scope.row.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
                placeholder="会计科目" style="width: 100%;"  filterable @change="handleChangeAccountId(scope.row)"
              >
              </el-tree-select>
            </template>
          </el-table-column>
          <el-table-column label="发生额" prop="baseAmount" align="center" :min-width="130">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'baseAmount')" v-model="scope.row.baseAmount"
                placeholder="发生额" :max='99999999' :min='-99999999' :precision='2' :step='0' :controls="false"
                @change="calculateNetAmount(scope.row)" style="width: 100%;" 
                @focus="handleFocus2(scope.$index, 'baseAmount')"
                @click="handleFocus2(scope.$index, 'baseAmount')"
                :class="scope.row.baseAmount < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="折扣率" prop="discountRate" align="center" :min-width="95">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'discountRate')" v-model="scope.row.discountRate"
                placeholder="发生额" :max='100' :min='0' :precision='1' :step='0' :controls="false"
                @change="calculateNetAmount(scope.row)" style="width: 100%;" 
                @focus="handleFocus2(scope.$index, 'discountRate')"
                @click="handleFocus2(scope.$index, 'discountRate')"
                :class="scope.row.discountRate < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>%</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="折扣额" prop="discountAmount" align="center" :min-width="130">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'discountAmount')" v-model="scope.row.discountAmount"
                placeholder="发生额" :max='99999999' :min='-99999999' :precision='2' :step='0' :controls="false"
                @change="calculateDiscountAmount(scope.row)" style="width: 100%;" 
                @focus="handleFocus2(scope.$index, 'discountAmount')"
                @click="handleFocus2(scope.$index, 'discountAmount')"
                :class="scope.row.discountAmount < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="税率" prop="taxRate" align="center" :min-width="95">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'taxRate')" v-model="scope.row.taxRate"
                placeholder="发生额" :max='100' :min='0' :precision='0' :step='0' :controls="false"
                @change="calculateNetAmount(scope.row)" style="width: 100%;" 
                @focus="handleFocus2(scope.$index, 'taxRate')"
                @click="handleFocus2(scope.$index, 'taxRate')"
                :class="scope.row.taxRate < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>%</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="税额" prop="taxAmount" align="center" :min-width="130">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'taxAmount')" v-model="scope.row.taxAmount"
                placeholder="发生额" :max='99999999' :min='-99999999' :precision='2' :step='0' :controls="false" style="width: 100%;" disabled
                @focus="handleFocus2(scope.$index, 'taxAmount')"
                @click="handleFocus2(scope.$index, 'taxAmount')"
                :class="scope.row.taxAmount < 0 ? 'negative-input' : ''"
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="实际总金额" prop="netAmount" align="center" :min-width="130">
            <template #default="scope">
              <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'netAmount')" v-model="scope.row.netAmount"
                placeholder="发生额" :max='99999999' :min='-99999999' :precision='2' :step='0' :controls="false" disabled
                @change="calculateNetAmount(scope.row)" style="width: 100%;" 
                @focus="handleFocus2(scope.$index, 'netAmount')"
                @click="handleFocus2(scope.$index, 'netAmount')"
                :class="scope.row.netAmount < 0 ? 'negative-input' : ''"
                
              >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
         
        </el-table>
      </el-form>

      <!-- 订单操作记录 -->
      <el-card class="operation-card">
        <template #header>
          <div class="card-header">
            <span>费用登记操作记录</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
            :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top"
          >
            {{ activity.operator }} - {{ activity.action }}
            <span v-if="activity.remark"> - - 描述 : </span>
            <span class="remark">{{ activity.remark }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 操作意见弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="500">
        <!-- 强制填写备注 -->
        <el-form :model="approvalForm" :label-width="80">
          <el-form-item :label="getRemarkMessage(currentAction) + ':'"
            v-if="actionRequiresRemark.includes(currentAction)"
          >
            <el-input v-model="approvalForm.remark" type="textarea" show-word-limit :maxlength="20"
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

<script setup name="CostInvoice">
import { listCostInvoice, getCostInvoice, delCostInvoice, addCostInvoice, updateCostInvoice } from "@/api/finance/costInvoice";
import {  continueEditInvoice, submitAuditInvoice, auditedInvoice, unAuditedInvoice} from "@/api/finance/costInvoice";
import useUserStore from "@/store/modules/user";
import { listAccount } from "@/api/finance/account";
import { listFinanceProject } from "@/api/finance/financeProject";
import { listSupplier} from "@/api/order/supplier";
import { listCustomer} from "@/api/order/customer";
import { listUser } from "@/api/system/user";
import { onBeforeMount, ref } from "vue";
import { ElMessage } from "element-plus";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_purchase_invoice_status, finance_assist_type, erp_purchase_invoice_type } = proxy.useDict('erp_purchase_invoice_status', 'finance_assist_type', 'erp_purchase_invoice_type');

const costInvoiceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedPurchaseInvoiceDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const insertStatus = ref(false);


// --------------------------------  1 数据渲染  start  --------------------------------

// 复制功能
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功！')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 发票类型 */
const InvoiceTypeEnum = {
  // 采购发票
  INVOICE_TYPE_PURCHASE: '1',
  // 费用发票
  INVOICE_TYPE_COST: '2',
}

/** 发票状态 */ 
const InvoiceStatusEnum = {
  // 草稿
  INVOICE_STATUS_DRAFT: '1',
  // 待审核
  INVOICE_STATUS_WAIT_AUDITED: '2',
  // 已审核
  INVOICE_STATUS_AUDITED: '3',
  // 已过账
  INVOICE_STATUS_POSTED: '4',
}

/** 合计行 */
const getSummaryRow = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'baseAmount') {
      // 计算发生额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.baseAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    }  else if (column.property === 'discountAmount') {
      // 计算折扣额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.discountAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    } else if (column.property === 'taxAmount') {
      // 计算税额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.taxAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    } else if (column.property === 'netAmount') {
      // 计算总金额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.netAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    }
    else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'financeAccountId' ? '合计金额 :' : ''
    }
  })
  
  return sums
}

/** 更新查询条件 辅助项类型 */
const changeQueryParamsAssistType = () => {
  queryParams.value.assistId = null ;
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

/** 获取辅助项名称 */
const getAssistNameByAssistId = (row) => {
  const assistType = row.assistType
  const assistId = row.assistId
  if(!assistType || !assistId){
    return '' ;
  }
  switch (assistType) {
    case AssistTypeEnum.ASSIST_TYPE_CUSTOMER:
      // 客户
      const customer = customerList.value.find(item => item.customerId == assistId);
      
      return customer ? customer.customerName : '' ;
    case AssistTypeEnum.ASSIST_TYPE_SUPPLIER:
      // 供应商
      const supplier = supplierList.value.find(item => item.supplierId == assistId) ;
      return supplier ? supplier.supplierName : '' ;
    case AssistTypeEnum.ASSIST_TYPE_EMPLOYEE:
      // 员工
      const user = userList.value.find(item => item.userId == assistId);
      return user ? user.userName : '' ;
  }
}

/** 计算单行净额 */ 
const calculateNetAmount = (row) => {
  // 计算折扣金额
  if (row.discountRate && row.baseAmount) {
    row.discountAmount = parseFloat((row.baseAmount * row.discountRate / 100).toFixed(2))
  }

  // 计算税额
  if (row.taxRate && (row.baseAmount - row.discountAmount)) {
    row.taxAmount = parseFloat(((row.baseAmount - row.discountAmount) * row.taxRate / 100).toFixed(2))
  }

  // 计算净额
  row.netAmount = parseFloat((row.baseAmount - row.discountAmount + row.taxAmount).toFixed(2))

  calculateTotalAmount()
}

/** 折扣额反推折扣率计算 */
const calculateDiscountAmount = (row) => {
  // 反推折扣率
  if (row.discountAmount && row.baseAmount) {
    row.discountRate = (row.discountAmount * 100) / row.baseAmount
  }

  // 计算税额
  if (row.taxRate && (row.baseAmount - row.discountAmount)) {
    row.taxAmount = parseFloat(((row.baseAmount - row.discountAmount) * row.taxRate / 100).toFixed(2))
  }

  // 计算净额
  row.netAmount = parseFloat((row.baseAmount - row.discountAmount + row.taxAmount).toFixed(2))

  calculateTotalAmount()
}


/** 计算发票总额 */
const calculateTotalAmount = () => {
  // 计算基础总明细金额
  const totalBaseAmount = form.value.purchaseInvoiceDetailList.reduce((sum, item) => {
    const value = Number(item.baseAmount)
    if (!isNaN(value)) {
      return sum + value
    }
    return sum
  }, 0)

  // 计算总折扣额
  const totalDiscountAmount = form.value.purchaseInvoiceDetailList.reduce((sum, item) => {
    const value = Number(item.discountAmount)
    if (!isNaN(value)) {
      return sum + value
    }
    return sum
  }, 0)

  // 计算总税额
  const totalTaxAmount = form.value.purchaseInvoiceDetailList.reduce((sum, item) => {
    const value = Number(item.taxAmount)
    if (!isNaN(value)) {
      return sum + value
    }
    return sum
  }, 0)

  // 计算总净额
  const totalNetAmount = form.value.purchaseInvoiceDetailList.reduce((sum, item) => {
    const value = Number(item.netAmount)
    if (!isNaN(value)) {
      return sum + value
    }
    return sum
  }, 0)

  form.value.invoiceTotalBaseAmount = totalBaseAmount
  form.value.invoiceTotalDiscountAmount = totalDiscountAmount
  form.value.invoiceTotalTaxAmount = totalTaxAmount

}
// --------------------------------  1 数据渲染  end  --------------------------------

// *******************************  2 获取会计项目列表数据  start  *************************
// 会计项目 - 初始化列表
const projectList = ref([])
const projectTree = ref([])

/** 4 获取指定的会计项目树形列表 */
const filterAccountTree = (data,financeAccountCodeStartNumber) => {
  if (!data || !financeAccountCodeStartNumber) {
    return data
  }
  // 用于记录应该保留的节点的ID
  const keepIds = new Set()
  // 第一次遍历：找出所有符合条件的节点及其所有父节点
  const findValidNodes = (node) => {
    if (node.financeAccountCode && node.financeAccountCode.startsWith(financeAccountCodeStartNumber)) { // 过滤 6 开头的科目
      // 找到符合条件的节点，记录这个节点和它所有的父节点
      let current = node
      while (current) {
        keepIds.add(current.projectId)
        // 通过parentId找父节点
        current = data.find(item => item.projectId === current.parentId)
      }
    }

  }

  // 对原始数据进行遍历
  data.forEach(findValidNodes)

  // 第二次遍历：过滤并重构树
  const filterNode = (nodes) => {
    return nodes
      .filter(node => keepIds.has(node.projectId))
      .map(node => ({
        ...node,
        children: node.children ? filterNode(node.children) : []
      }))
  }


  return filterNode(proxy.handleTree(data, "projectId", "parentId"))
}
/** 会计项目 - 获取列表 */
const getProjectList = async () => {
  listFinanceProject()
    .then(response => {
      projectList.value = response.data || [];
      projectTree.value = proxy.handleTree(response.data, "projectId", "parentId") || [];
    })
    .catch(error => {
      ElMessage.error("获取 会计项目 列表时出错:",error)
    })
};


/** el-tree-select 配置 */ 
const treeProps2 = {
  value: "projectId",
  label: (node) => ` ${node.projectName}`, // 自定义显示内容
  children: "children",
  disabled: (node) => node.projectStatus == '1'
};

/** 切换项目 同步会计科目Id */
const handleProjectId = (row) => {
  const detailAccountId = projectList.value.find(item => item.projectId === row.projectId)?.financeAccountId
  if(detailAccountId){
    row.financeAccountId = detailAccountId
  }
}

getProjectList()

// *******************************  2 获取项目列表数据  end  *************************

// --------------------------------  3 获取科目列表数据  start  --------------------------------
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

/** 切换会计科目 */
const handleChangeAccountId = (row) => {
  row.projectId = null ;
  
}

getAccountList()

// --------------------------------  3 获取科目列表数据  end  --------------------------------

// ********************************* 4 表单 输入框聚焦选中 start ********************************
const inputNumber  = ref({}); // 使用对象存储各列引用

// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ********************************* 4 表单 输入框聚焦选中 end ********************************

// --------------------------------- 5 表格 输入框聚焦选中 start --------------------------------
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

// --------------------------------- 5 表格 输入框聚焦选中 start --------------------------------

// ******************************** 6 获取辅助项  start  *****************************************
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

const getAssistList = () => {
  listSupplier()
    .then(
      response => { supplierList.value = response.rows }
    )
    .catch(
      error => {ElMessage.error("获取供应商列表时出错:",error)}
    )
  listCustomer()
    .then(
      response => {
        customerList.value = response.rows
        console.log("获取客户列表customerList:",customerList.value)
      
      }
      
    )
    .catch(
      error => {ElMessage.error("获取客户列表时出错:",error)}
    )
  listUser()
    .then(
      response => {userList.value = response.rows }
    )
    .catch(
      error => {ElMessage.error("获取客户列表时出错:",error)}
    )

}


/** 发票表头会计科目限制 */
const  MainAccountId = {
  // 应付账款
  ACCOUNTS_PAYABLE: '2202',
  // 其他应付款-员工
  OTHER_PAYABLE: '2241',

}
/** 修改辅助项类型 */
const changeAssistType = () => {
  form.value.assistId = null ;  // 清空辅助项ID
  if(form.value.assistType === AssistTypeEnum.ASSIST_TYPE_SUPPLIER){
    form.value.mainFinanceAccountId = accountList.value.find(item => item.accountCode === MainAccountId.ACCOUNTS_PAYABLE)?.accountId
  } else {
    form.value.mainFinanceAccountId = accountList.value.find(item => item.accountCode === MainAccountId.OTHER_PAYABLE)?.accountId
  }
}

/** 修改发票类型， 清空辅助项ID */
const changeInvoiceType = () => {
  // 采购发票特殊处理 ->  指定辅助项类型 指定会计科目 
  if(form.value.invoiceType === InvoiceTypeEnum.INVOICE_TYPE_PURCHASE){
    form.value.assistType = AssistTypeEnum.ASSIST_TYPE_SUPPLIER
    changeAssistType()
  } else {
    form.value.assistType = null ;
    changeAssistType()
  }
  // 切换发票类型清空明细
  form.value.purchaseInvoiceDetailList = [] ;
  // 更新会计项目要展示的内容
  updateAccountTree()
  
}

const updateAccountTree = () => {
  if(form.value.invoiceType === InvoiceTypeEnum.INVOICE_TYPE_PURCHASE){
    // 更新会计项目要展示的内容 - 费用
    projectTree.value = filterAccountTree(projectList.value,'1')
  } else {
    // 更新会计项目要展示的内容 - 资产
    projectTree.value = filterAccountTree(projectList.value,'6')
  }
}
// ******************************** 6 获取辅助项  end  *****************************************

// -------------------------------- 7 表单数据 start -----------------------------------------
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
    invoiceType: '2',
  },
  rules: {
    invoiceNo: [
      { validator: validateOneRequired, trigger: "blur" }
    ],
    orderNo: [
      { validator: validateOneRequired, trigger: "blur" }
    ],
    invoiceType: [
      { required: true, message: "发票类型不能为空", trigger: "blur" }
    ],
    assistType: [
      { required: true, message: "辅助项类型不能为空", trigger: "blur" }
    ],
    assistId: [
      { required: true, message: "辅助项不能为空", trigger: "blur" }
    ],
    mainFinanceAccountId: [
      { required: true, message: "主账科目不能为空", trigger: "blur" }
    ],
    invoiceDate: [
      { required: true, message: "发票日期不能为空", trigger: "blur" }
    ],
    paymentDueDate: [
      { required: true, message: "付款到期日不能为空", trigger: "blur" }
    ],
    invoiceTotalNetAmount: [
      { required: true, message: "发票金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// -------------------------------- 7 表单数据 end -----------------------------------------

// ******************************** 8 基础方法 start *************************************
/** 查询费用登记列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCostInvoice(queryParams.value).then(response => {
    costInvoiceList.value = response.rows || [];
    total.value = response.total;
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
    invoiceId: null,
    invoiceType: '2',
    mainFinanceAccountId: null,
    assistType: null,
    assistId: null,
    supplierId: null,
    invoiceNo: null,
    orderNo: null,
    invoiceDate: null,
    invoiceTotalBaseAmount: 0,
    invoiceTotalDiscountAmount: 0,
    invoiceTotalTaxAmount: 0,
    invoiceTotalNetAmount: 0,
    invoiceStatus: '1',
    accountsPayable: null,
    paymentDueDate: null,
    verifiedAmount: 0,
    remainAmount: 0,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    uploadedFile: null,
    operateLog: null,
    purchaseInvoiceDetailList: [],
  };
  orderOperateLog.value = [];
  proxy.resetForm("costInvoiceRef");
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

/** 搜索逾期未付 */
const queryOverdue = () => {
  ElMessage.warning("功能暂未实现")
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
  title.value = "添加费用登记";
  updateAccountTree() // 更新会计项目要展示的内容
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _invoiceId = row.invoiceId || ids.value
  getCostInvoice(_invoiceId).then(response => {
    form.value = response.data;
    // 还原数据
    if (form.value.operateLog) {
      orderOperateLog.value = JSON.parse(form.value.operateLog);
      form.value.operateLog = JSON.parse(form.value.operateLog);
    }
    open.value = true;
    insertStatus.value = false;
    title.value = "修改费用登记";
    updateAccountTree()  // 更新会计项目要展示的内容
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _invoiceIds = row.invoiceId || ids.value;
  proxy.$modal.confirm('是否确认删除费用登记编号为"' + _invoiceIds + '"的数据项？').then(function() {
    return delCostInvoice(_invoiceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 费用登记明细序号 */
function rowPurchaseInvoiceDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 费用登记明细添加按钮操作 */
function handleAddPurchaseInvoiceDetail() {
  if(!form.value.assistType){
    proxy.$modal.msgError("请先选择辅助项类型");
    return;
  }
  let obj = {};
  obj.projectId = null;
  obj.financeAccountId = null;
  obj.summary = null;
  obj.baseAmount = 0;
  obj.discountRate = 0;
  obj.discountAmount = 0;
  obj.taxRate = 0;
  obj.taxAmount = 0;
  obj.netAmount = 0;
  form.value.purchaseInvoiceDetailList.push(obj);
}

/** 费用登记明细删除按钮操作 */
function handleDeletePurchaseInvoiceDetail() {
  if (checkedPurchaseInvoiceDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的费用登记明细数据");
  } else {
    const purchaseInvoiceDetails = form.value.purchaseInvoiceDetailList;
    const checkedPurchaseInvoiceDetails = checkedPurchaseInvoiceDetail.value;
    form.value.purchaseInvoiceDetailList = purchaseInvoiceDetails.filter(function(item) {
      return checkedPurchaseInvoiceDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handlePurchaseInvoiceDetailSelectionChange(selection) {
  checkedPurchaseInvoiceDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/costInvoice/export', {
    ...queryParams.value
  }, `costInvoice_${new Date().getTime()}.xlsx`)
}

/** 打印按钮操作 */
const handlePrintFlow = () => {
  console.log('打印form 值:', form.value);
}

/** 导出按钮操作 */ 
const handleExportFlow = () => {
  console.log('导出流水明细');
}

// ******************************** 8 基础方法 end *************************************


// -------------------------------- 9 操作 start --------------------------------------
// 订单操作类型
const OperateType = {
  // 保存
  SAVE: 'save',
  // 提交审核
  SUBMIT_AUDITED: 'submitAudited',
  // 继续编辑
  CONTINUE_EDIT: 'continueEdit',
  // 审核
  AUDITED: 'audited',
  // 反审核
  UN_AUDITED: 'unAudited',
}

const handleSave = () => {
  // 0 表单预校验提交校验 
  proxy.$refs["costInvoiceRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.purchaseInvoiceDetailList = form.value.purchaseInvoiceDetailList.filter(item => item.financeAccountId !== null) ;
    // 2 检查存在分录
    if(form.value.purchaseInvoiceDetailList.length <= 0){
      proxy.$modal.msgError("请添加明细内容！")
      return;
    }
    // 2.1 维护摘要信息
    form.value.purchaseInvoiceDetailList.forEach(item => {
      item.summary = form.value.remark || '';
    });

    // 3 检查试算平衡
    const totalDetailAmount = form.value.purchaseInvoiceDetailList.reduce((total, item) => total + item.netAmount, 0);
    if(form.value.invoiceTotalNetAmount !== totalDetailAmount){
      proxy.$modal.msgError("交易金额 与 发生额合计 不一致，请检查！")
      return;
    }

    // 4 收款类型检查，收款 交易金额大于0、付款 交易金额小于0
    if(form.value.invoiceTotalNetAmount == 0){
      proxy.$modal.msgError("发票总额不能为 0 ,请检查!")
      return;
    }

    // 6 交易额 及 所有明细 正负值保持一致，交易额是正或者负，对应的所有明细也必须是正或者负
    if(form.value.invoiceTotalNetAmount < 0){
      // 所有明细都必须是小于0的数值
      if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount > 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为负数, 请检查!")
        return;
      }
    }
    if(form.value.invoiceTotalNetAmount > 0){
      // 所有明细都必须是大于0的数值
      if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount < 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为正数, 请检查!")
        return;
      }
    }

    // 7 明细不可以有0值的存在
    if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount == 0)){
      proxy.$modal.msgError("明细金额不能为 0 ,请检查!")
      return;
    }

    // 8 保存操作
    openApprovalDialog('保存日记账', OperateType.SAVE)

  })  
}

const handleSubmitAudited = () => {
  // 0 表单预校验提交校验 
  proxy.$refs["costInvoiceRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.purchaseInvoiceDetailList = form.value.purchaseInvoiceDetailList.filter(item => item.financeAccountId !== null) ;
    // 2 检查存在分录
    if(form.value.purchaseInvoiceDetailList.length <= 0){
      proxy.$modal.msgError("请添加明细内容！")
      return;
    }
    // 2.1 维护摘要信息
    form.value.purchaseInvoiceDetailList.forEach(item => {
      item.summary = form.value.remark || '';
    });

    // 3 检查试算平衡
    const totalDetailAmount = form.value.purchaseInvoiceDetailList.reduce((total, item) => total + item.netAmount, 0);
    if(form.value.invoiceTotalNetAmount !== totalDetailAmount){
      proxy.$modal.msgError("交易金额 与 发生额合计 不一致，请检查！")
      return;
    }

    // 4 收款类型检查，收款 交易金额大于0、付款 交易金额小于0
    if(form.value.invoiceTotalNetAmount == 0){
      proxy.$modal.msgError("发票总额不能为 0 ,请检查!")
      return;
    }

    // 6 交易额 及 所有明细 正负值保持一致，交易额是正或者负，对应的所有明细也必须是正或者负
    if(form.value.invoiceTotalNetAmount < 0){
      // 所有明细都必须是小于0的数值
      if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount > 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为负数, 请检查!")
        return;
      }
    }
    if(form.value.invoiceTotalNetAmount > 0){
      // 所有明细都必须是大于0的数值
      if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount < 0 )){
        proxy.$modal.msgError("明细正负数需要保持一致, 应都为正数, 请检查!")
        return;
      }
    }

    // 7 明细不可以有0值的存在
    if(form.value.purchaseInvoiceDetailList.some(item => item.baseAmount == 0)){
      proxy.$modal.msgError("明细金额不能为 0 ,请检查!")
      return;
    }

    // 8 提交审核操作
    openApprovalDialog('提交审核日记账', OperateType.SUBMIT_AUDITED)
  })
}

const handleContinueEdit = () => {
  openApprovalDialog('继续编辑日记账', OperateType.CONTINUE_EDIT)
}

const handleAudited = () => {
  openApprovalDialog('审核日记账', OperateType.AUDITED)
}

const handleUnAudited = () => {
  openApprovalDialog('反审核日记账', OperateType.UN_AUDITED)
}

const handleRemove = () => {
  proxy.$modal.confirm('是否确认删除现金银行日记账的数据项?').then(function() {
    return delCostInvoice(form.value.invoiceId);
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

// -------------------------------- 9 操作 end --------------------------------------

// ******************************** 10 操作弹窗 start ********************************
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
    [OperateType.SAVE]: '保存原因',
    [OperateType.CONTINUE_EDIT]: '继续编辑原因',
    [OperateType.AUDITED]: '审核通过原因',
    [OperateType.UN_AUDITED]: '反审核原因',
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
// ******************************** 10 操作弹窗 end ********************************

// ------------------------------ 11 操作记录 start ---------------------------------
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
    submitAudited: 'primary',
    audited: 'success',
    unAudited: 'danger',
    posted: 'success',
    unPosted: 'danger',
    voided: 'danger'
  }
  return typeMap[actionValue] || 'info'
}

// ------------------------------ 11 操作记录 end ---------------------------------

// ******************************* 12 提交操作 start ****************************

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
const actionRequiresRemark = [OperateType.UN_AUDITED];
// 不需要输入描述信息: 保存 审核 继续编辑 提交审核
const actionRequiresNoRemark = [OperateType.SAVE, OperateType.AUDITED, OperateType.CONTINUE_EDIT, OperateType.SUBMIT_AUDITED];

const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 2 定义动作及相应状态
  const actions = {
    [OperateType.SAVE]: {
      status: InvoiceStatusEnum.INVOICE_STATUS_DRAFT,
      message: '保存成功',
      actionValue: OperateType.SAVE
    },
    [OperateType.SUBMIT_AUDITED]: {
      status: InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED,
      message: '提交审核成功',
      actionValue: OperateType.SUBMIT_AUDITED
    },
    [OperateType.CONTINUE_EDIT]: {
      status: InvoiceStatusEnum.INVOICE_STATUS_DRAFT,
      message: '继续编辑成功',
      actionValue: OperateType.CONTINUE_EDIT
    },
    [OperateType.AUDITED]: {
      status: InvoiceStatusEnum.INVOICE_STATUS_AUDITED,
      message: '审核通过',
      actionValue: OperateType.AUDITED
    },
    [OperateType.UN_AUDITED]: {
      status: InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED,
      message: '反审核 成功!',
      actionValue: OperateType.UN_AUDITED
    },
  }

  // 3 状态 操作记录 赋值
  const currentActionConfig = actions[currentAction.value]
  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.invoiceStatus = currentActionConfig.status;
  form.value.operateLog = JSON.stringify(orderOperateLog.value);

  // 4 业务处理
  try{
    loading.value = true;
    if( currentAction.value === OperateType.SAVE) {
      proxy.$refs["costInvoiceRef"].validate(valid => {
        if (valid) {
          // 修改 / 新增 业务
          if (form.value.invoiceId != null) {
            updateCostInvoice(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("修改成功");
              parseJson();
              getList();
            })
            .catch(error => {
              form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_DRAFT;
              handleError(error.message);
            });
          } else {
            addCostInvoice(form.value)
            .then(response => {
              proxy.$modal.msgSuccess("新增成功");
              getCostInvoice(response.data.invoiceId).then(response2 => {
                form.value = response2.data;
              });
              parseJson();
              getList();
            })
            .catch(error => {
              form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_DRAFT;
              handleError(error.message);
            });
          }
        }
      });
    }
    if(currentAction.value === OperateType.SUBMIT_AUDITED){
      // 提交审核
      submitAuditInvoice(form.value)
        .then(response => {
          ElMessage.success("提交审核成功")
          getCostInvoice(form.value.invoiceId).then(response2 => {
                form.value = response2.data;
              });
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_DRAFT;
        })
    }
    if(currentAction.value === OperateType.CONTINUE_EDIT){
      // 继续编辑
      continueEditInvoice(form.value)
        .then(response => {
          ElMessage.success("继续编辑凭证成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED;
          handleError(error.message);
        });
    }
    if(currentAction.value === OperateType.AUDITED){
      // 审核
      auditedInvoice(form.value)
        .then(response => {
          ElMessage.success("审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_WAIT_AUDITED;
          handleError(error.message);
        });
    }
    if(currentAction.value === OperateType.UN_AUDITED){
      // 反审核
      unAuditedInvoice(form.value)
        .then(response => {
          ElMessage.success("反审核成功")
          parseJson();
          getList();
        })
        .catch(error => {
          form.value.invoiceStatus = InvoiceStatusEnum.INVOICE_STATUS_AUDITED;
          handleError(error.message);
        });
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

// ******************************* 12 提交操作 end ****************************

onBeforeMount(
  ()=>{
    getList();
    getAssistList();
  }
) 


</script>

<style lang="scss" scoped>

.query-invoiceNo {
  :deep(.el-form-item__label) {
 	font-weight: 700;
 	width: 160px !important;
 }
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

:deep(.el-input-number) {
  color: black; /* 默认字体颜色 */
}
:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}
</style>
