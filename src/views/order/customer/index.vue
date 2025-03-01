<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="categoryName" placeholder="请输入分类名称" clearable prefix-icon="Search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="categoryOptions" :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false" :filter-node-method="filterNode" ref="categoryTreeRef" node-key="id"
            highlight-current default-expand-all @node-click="handleNodeClick" />
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="客户编码: " prop="customerCode">
            <el-input v-model="queryParams.customerCode" placeholder="请输入客户编码" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户名称: " prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="CIF/NIE: " prop="invoiceTax">
            <el-input v-model="queryParams.invoiceTax" placeholder="请输入纳税人税号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="发票名称: " prop="invoiceName">
            <el-input v-model="queryParams.invoiceName" placeholder="请输入纳税人名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户类型: " prop="customerType">
            <el-select v-model="queryParams.customerType" placeholder="请选择客户类型" clearable>
              <el-option v-for="dict in order_customer_type" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户等级: " prop="levelId">
            <el-select v-model="queryParams.levelId" placeholder="请选择客户等级" clearable filterable>
              <el-option v-for="item in customerLevelList" :key="item.id" :label="item.levelName"
                :value="item.levelId" />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定业务员: " prop="salesmanId">
            <el-select v-model="queryParams.salesmanId" placeholder="请选择客户等级" clearable filterable>
              <el-option v-for="item in salesmanList" :key="item.userId" :label="item.userName" :value="item.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="发掘客户者: " prop="findBy">
            <el-input v-model="queryParams.findBy" placeholder="请输发掘客户者名称" clearable @keyup.enter="handleQuery"
              maxlength="50" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
              v-hasPermi="['order:customer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
              v-hasPermi="['order:customer:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['order:customer:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['order:customer:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table class="table-container" v-loading="loading" :data="customerList" @selection-change="handleSelectionChange" resizable  ref="customerTable" @expand-change="handleExpandChange2" row-key="customerId">
          <el-table-column type="expand">
            <template #default="props">
              <div style="padding: 10px 50px;">
                <el-descriptions title=">>> 发票信息: " :column="5" size="small">
                  <el-descriptions-item label="纳税人税号:">{{ props.row.invoiceTax }}</el-descriptions-item>
                  <el-descriptions-item label="纳税人名称:">{{ props.row.invoiceName }}</el-descriptions-item>
                  <el-descriptions-item label="纳税人电话:">{{ props.row.invoicePhone }}</el-descriptions-item>
                  <el-descriptions-item label="纳税人邮编:">{{ props.row.invoicePostcode }}</el-descriptions-item>
                  <el-descriptions-item label="纳税人地址:">{{ props.row.invoiceAddress }}</el-descriptions-item>
                </el-descriptions>
                <el-descriptions title=">>> 联系人信息: " :column="5" size="small">
                  <el-descriptions-item label="联系人名称:">{{ props.row.contactName }}</el-descriptions-item>
                  <el-descriptions-item label="联系人电话:">{{ props.row.contactPhone }}</el-descriptions-item>
                  <el-descriptions-item label="联系人邮箱:">{{ props.row.contactEmail }}</el-descriptions-item>
                  <el-descriptions-item label="联系人地址:" :span="2">{{ props.row.contactAddress }}</el-descriptions-item>
                </el-descriptions>
                <el-descriptions title=">>> 银行账户信息: " :column="6" size="small">
                  <template v-for="(bank, index) in props.row.bankAccountList" :key="index">
                    <el-descriptions-item label="银行名称:">{{ bank.bankName || '--' }}</el-descriptions-item>
                    <el-descriptions-item label="账户账号:">{{ bank.accountNo || '--' }}</el-descriptions-item>
                    <el-descriptions-item label="账户名称:">{{ bank.accountName || '--' }}</el-descriptions-item>
                    <el-descriptions-item label="swiftCode:">{{ bank.swiftCode || '--' }}</el-descriptions-item>
                    <el-descriptions-item label="是否默认:">
                      <dict-tag :options="sys_yes_or_no" :value="bank.isDefault" style="display: inline-block;"/>
                    </el-descriptions-item>
                    <el-descriptions-item label="备注信息:" >{{ bank.remark || '--' }}</el-descriptions-item>
                  </template>
                </el-descriptions>
                <el-descriptions title=">>> 更新信息: " :column="5" size="small">
                  <el-descriptions-item label="创建人:">{{ props.row.createBy }}</el-descriptions-item>
                  <el-descriptions-item label="创建时间:">{{ parseTime(props.row.createTime, '{y}-{m}-{d}')
                    }}</el-descriptions-item>
                  <el-descriptions-item label="修改人:">{{ props.row.updateBy }}</el-descriptions-item>
                  <el-descriptions-item label="修改时间:">{{ parseTime(props.row.updateTime, '{y}-{m}-{d}')
                    }}</el-descriptions-item>
                  <el-descriptions-item label="备注:">{{ props.row.remark }}</el-descriptions-item>
                </el-descriptions>
              </div>

            </template>
          </el-table-column>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="客户分类" align="center" prop="categoryVo.categoryName" min-width="120"
            show-overflow-tooltip />
          <el-table-column label="客户编码" align="center" prop="customerCode" show-overflow-tooltip />
          <el-table-column label="客户名称" align="center" prop="customerName" show-overflow-tooltip />
          <el-table-column label="客户类型" align="center" prop="customerType" show-overflow-tooltip>
            <template #default="scope">
              <dict-tag :options="order_customer_type" :value="scope.row.customerType" />
            </template>
          </el-table-column>
          <el-table-column label="客户等级" align="center" prop="leverId">
            <template #default="scope">
              <span>{{ scope.row.customerLevel ? scope.row.customerLevel.levelName : '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="客户状态" align="center" prop="customerStatus">
            <template #default="scope">
              <dict-tag :options="project_general_status" :value="scope.row.customerStatus" />
            </template>
          </el-table-column>
          <el-table-column label="绑定业务员" align="center" prop="salesmanId" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.salesmanVo ? scope.row.salesmanVo.userName : '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发掘客户者" align="center" prop="findBy" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.findBy ? scope.row.findBy : '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['order:customer:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['order:customer:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize" @pagination="getList" />

      </el-col>
    </el-row>


    <!-- 添加或修改客户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-tabs type="border-card" v-model="activeTab">

          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="客户分类" prop="categoryId">
              <el-tree-select v-model="form.categoryId" :data="categoryOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }" value-key="categoryId"
                placeholder="请选择客户分类" :accordion="true" filterable clearable/>
            </el-form-item>
            <el-form-item label="客户编码: " prop="customerCode">
              <el-input v-model="form.customerCode" placeholder="请输入客户编码" type="textarea" :maxlength="50"
                show-word-limit :rows="1" :disabled="form.customerId ? true : false" />
            </el-form-item>
            <el-form-item label="客户名称: " prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" type="textarea" :maxlength="50"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="客户类型: " prop="customerType">
              <el-select v-model="form.customerType" placeholder="请选择客户类型">
                <el-option v-for="dict in order_customer_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户等级: " prop="levelId">
              <el-select v-model="form.levelId" placeholder="请选择客户等级" clearable filterable style="width: auto;">
                <el-option v-for="item in customerLevelList" :key="item.id" :label="item.levelName"
                  :value="item.levelId" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户状态" prop="customerStatus">
              <el-radio-group v-model="form.customerStatus">
                <el-radio v-for="dict in project_general_status" :key="dict.value" :value="dict.value">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="发掘客户者: " prop="findBy">
              <el-select v-model="form.findBy" placeholder="请选择发掘客户的员工" clearable filterable style="width: auto;">
                <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userName" />
              </el-select>
            </el-form-item>
            <el-form-item label="绑定业务员: " prop="salesmanId">
              <el-select v-model="form.salesmanId" placeholder="请选择客户等级" clearable filterable style="width: auto;">
                <el-option v-for="item in salesmanList" :key="item.userId" :label="item.userName"
                  :value="item.userId" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注: " prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="50" show-word-limit
                :rows="2" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="发票信息" name="invoiceInfo">
            <el-form-item label="CIF/NIE: " prop="invoiceTax">
              <el-input v-model="form.invoiceTax" placeholder="请输入纳税人税号" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="发票名称: " prop="invoiceName">
              <el-input v-model="form.invoiceName" placeholder="请输入纳税人名称" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="发票电话: " prop="invoicePhone">
              <el-input v-model="form.invoicePhone" placeholder="请输入纳税人电话" type="textarea" maxlength="20"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="发票邮编: " prop="invoicePostcode">
              <el-input v-model="form.invoicePostcode" placeholder="请输入纳税人邮编" type="textarea" maxlength="10"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="发票地址: " prop="invoiceAddress">
              <el-input v-model="form.invoiceAddress" placeholder="请输入纳税人地址" type="textarea" maxlength="100"
                show-word-limit :rows="2" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="联系人信息" name="contactInfo">
            <el-form-item label="联系人名称: " prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人名称" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="联系人电话: " prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" type="textarea" maxlength="20"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人邮箱: " prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" type="textarea" maxlength="50"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人地址: " prop="contactAddress">
              <el-input v-model="form.contactAddress" placeholder="请输入联系人地址" type="textarea" maxlength="100"
                show-word-limit :rows="2" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="银行账户" name="bankAccount">
            <el-table :data="form.bankAccountList" border style="width: 100%;" ref="bankAccountList" @expand-change="handleExpandChange" row-key="accountId">
              <el-table-column type="expand" >
                <template #default="props">
                  <div style="padding: 10px;">
                    <el-descriptions title="发票信息" :column="2" size="small">
                      <el-descriptions-item label="银行名称:">
                        <el-input v-model="props.row.bankName" placeholder="请输入银行名称" type="textarea" maxlength="50" :rows="1"/>
                      </el-descriptions-item>
                      <el-descriptions-item label="账户名称:">
                        <el-input v-model="props.row.accountName" placeholder="请输入银行名称" type="textarea" maxlength="50" :rows="1"/>
                      </el-descriptions-item>
                      <el-descriptions-item label="swiftCode:">
                        <el-input v-model="props.row.swiftCode" placeholder="请输入开户行" type="textarea" maxlength="20" :rows="1"/>
                      </el-descriptions-item>
                      <el-descriptions-item label="备注信息:">
                        <el-input v-model="props.row.remark" placeholder="请输入备注信息" type="textarea" maxlength="50" :rows="1"/>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="银行账号" align="center" prop="accountNo" show-overflow-tooltip >
                <template #default="scope">
                  <el-input v-model="scope.row.accountNo" placeholder="银行账号" type="textarea" maxlength="64" :rows="1"/>
                </template>
              </el-table-column>
              <el-table-column label="默认" align="center" prop="isDefault" show-overflow-tooltip width="65">
                <template #default="scope">
                    <el-switch v-model="scope.row.isDefault" :active-value="sys_yes_or_no[0].value"
                      :inactive-value="sys_yes_or_no[1].value" inline-prompt active-text="si" inactive-text="no"
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; width: 100%;"
                      @change="handleDefaultChange(scope.row, scope.$index)" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center">
                <template #default="scope">
                  <el-button type="danger" size="small" plain @click="removeBankAccount(scope.$index)" style="width: 100%;">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" plain @click="addBankAccount" v-if="form.bankAccountList.length < 5" style="margin-top: 10px;">
              添加 银行信息
            </el-button>
          </el-tab-pane>


        </el-tabs>
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

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer } from "@/api/order/customer";
import {listCustomerLevel} from "@/api/order/customerLevel";
import useUserStore from "@/store/modules/user";
import { ref } from "vue";
import {categoryTreeSelect} from "@/api/order/customerCategory";
import { listSalesman } from "@/api/system/user";
import { listUser } from "@/api/system/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { order_customer_type, project_general_status, sys_yes_or_no } = proxy.useDict('order_customer_type', 'project_general_status', 'sys_yes_or_no');

const customerList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryName = ref(""); // 分类名称
const categoryOptions = ref(null);
const activeTab = ref('basic'); // 当前激活的标签页



const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    salesmanId: null,
    findBy: null,
    customerCode: null,
    customerName: null,
    customerStatus: null,
    customerType: null,
    customerLevel: null,
    invoiceTax: null,
    invoiceName: null,
    invoicePhone: null,
    invoicePostcode: null,
    tenantId: null,
  },
  rules: {
    categoryId: [
      { required: true, message: "客户状态不能为空", trigger: "change" }
    ],
    customerCode: [
      { required: true, message: "客户编码不能为空", trigger: "blur" }
    ],
    customerName: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    customerType: [
      { required: true, message: "客户类型不能为空", trigger: "change" }
    ],
    invoiceTax: [
      { required: true, message: "纳税人编号不能为空", trigger: "blur" }
    ],
    invoiceName: [
      { required: true, message: "纳税人名称不能为空", trigger: "blur" }
    ],
    invoicePhone: [
      { required: true, message: "纳税人电话不能为空", trigger: "blur" }
    ],
    invoicePostcode: [
      { required: true, message: "纳税人邮编不能为空", trigger: "blur" }
    ],
    invoiceAddress: [
      { required: true, message: "纳税人地址不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows || [] ;
    total.value = response.total;
    loading.value = false;
  });
}

// ---------------------- 1 分类树相关 start ----------------
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 根据名称筛选部门树 */
watch(categoryName, val => {
  proxy.$refs["categoryTreeRef"].filter(val);
});

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.categoryId = data.id;
  handleQuery();
};

/** 查询部门下拉树结构 */
function getCategoryTree() {
  categoryTreeSelect().then(response => {
    categoryOptions.value = response.data;
  });
};

getCategoryTree()

// ---------------------- 1 分类树相关 end ----------------

// ---------------------- 2 客户等级相关 start ----------------
// 客户等级列表
const customerLevelList = ref([]);
/** 获取客户等级列表 */
function getCustomerLevelList() {
  listCustomerLevel().then(response => {
    customerLevelList.value = response.rows;
  }).catch((error) => {
    console.error("获取客户等级列表时出错:", error);
  });
}

getCustomerLevelList()
// ---------------------- 2 客户等级相关 end ----------------
// ---------------------- 3 获取员工信息 start -------------
const userList = ref([]);
const getUserList = async () => {
  listUser()
    .then(response => {
      userList.value = response.rows || []
    })
    .catch(error => {
      ElMessage.error("获取员工列表时出错:", error)
    })
};
getUserList()


// ---------------------- 3 获取员工信息 end -------------

// ---------------------- 4 获取业务员数据 start ----------------
const salesmanList = ref([]);
const getSalesman = async () => {
  listSalesman()
    .then(response => {
      salesmanList.value = response.rows || []
    })
    .catch(error => {
      ElMessage.error("获取业务员列表时出错:", error)
    })
};

getSalesman()

// ---------------------- 4 获取业务员数据 end    ----------------

// --------------------- 5 银行账户数据 start -------------------------------
const generateRowKey = () => `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const initBankAccount = () => {
  return {
    accountId: generateRowKey(),
    accountName: null,
    accountNo: null,
    bankName: null,
    swiftCode: null,
    remark: null,
    isDefault: '1'
  }
}

const removeBankAccount = (index) => {
  form.value.bankAccountList.splice(index, 1);
}

const addBankAccount = () => {
  form.value.bankAccountList.push(initBankAccount());
}

const handleDefaultChange = (row, index) => {
  if (row.isDefault === '0') {
    // 遍历所有数据，将非选中行的 isDefault 设置为 '0'
    form.value.bankAccountList.forEach((item, i) => {
      if (i !== index) {
        item.isDefault = '1';
      }
    });
  }
}
// ---------------------- 5 银行账户数据 end -------------------------------
// ---------------------- 6 el-table-expand - 添加银行账户 start --------------------------
const bankAccountList = ref(null);
const expandedRow = ref(null);
const handleExpandChange = (row) => {
  if (expandedRow.value && expandedRow.value !== row) {
    bankAccountList.value.toggleRowExpansion(expandedRow.value, false);
  }
  expandedRow.value = row;
};
// ----------------------- 6 el-table-expand - 添加银行账户 end --------------------------
// ---------------------- 7 el-table-expand - 客户列表查询 start --------------------------
const customerTable = ref(null);
const expandedRow2 = ref(null);
const handleExpandChange2 = (row) => {
  if (expandedRow2.value && expandedRow2.value !== row) {
    customerTable.value.toggleRowExpansion(expandedRow2.value, false);
  }
  expandedRow2.value = row;
};
// ----------------------- 7 el-table-expand - 客户列表查询  end --------------------------



// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    categoryId: null,
    customerId: null,
    customerCode: null,
    customerName: null,
    customerStatus: '0',
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    contactAddress: null,
    customerType: null,
    customerLevel: null,
    invoiceTax: null,
    invoiceName: null,
    invoicePhone: null,
    invoicePostcode: null,
    invoiceAddress: null,
    salesmanId: null,
    findBy: null,
    remark: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    bankAccountList:[]
  };
  proxy.resetForm("customerRef");
  activeTab.value = 'basic';
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.categoryId = null;
  categoryName.value = "";
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.customerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _customerId = row.customerId || ids.value
  getCustomer(_customerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerRef"].validate(valid => {
    // 银行账户数据 - 去除没有银行账号的数据
    form.value.bankAccountList = form.value.bankAccountList.filter(item => item.accountNo);
    // 银行账户数据 - 将账户ID预制的ID值清空
    form.value.bankAccountList.forEach(item => {
      item.accountId = null;
    });
    if (valid) {
      if (form.value.customerId != null) {
        updateCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    } else {
      proxy.$modal.msgError("请检查 【基础信息】 【发票信息】 【联系人信息】 ，并完善信息！");
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _customerIds = row.customerId || ids.value;
  proxy.$modal.confirm('是否确认删除客户编号为"' + _customerIds + '"的数据项？').then(function() {
    return delCustomer(_customerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
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
