<template>
  <div class="app-container">

    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="categoryName"
            placeholder="请输入分类名称"
            clearable
            prefix-icon="Search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="categoryOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="categoryTreeRef"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input
              v-model="queryParams.supplierName"
              placeholder="请输入供应商名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="供应商编码" prop="supplierCode">
            <el-input
              v-model="queryParams.supplierCode"
              placeholder="请输入供应商编码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="联系人电话" prop="contactPhone">
            <el-input
              v-model="queryParams.contactPhone"
              placeholder="请输入联系人电话"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="供应商状态" prop="supplierStatus">
            <el-select v-model="queryParams.supplierStatus" placeholder="请选择供应商状态" clearable>
              <el-option
                v-for="dict in project_general_status"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['order:supplier:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['order:supplier:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['order:supplier:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['order:supplier:export']"
            >导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button-group style="margin-left: 50px;">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
            </el-button-group>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table class="table-container" v-loading="loading" :data="supplierList" @selection-change="handleSelectionChange" ref="supplierTable" @expand-change="handleExpandChange2" row-key="supplierId">
          <el-table-column type="expand">
            <template #default="props">
              <div style="padding: 10px 50px;">
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
          <el-table-column label="供应商分类" align="center"  min-width="120" show-overflow-tooltip >
            <template #default="scope">
              <span>{{ scope.row.categoryVo ?  scope.row.categoryVo.categoryName : '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商编码" align="center" prop="supplierCode" min-width="150" show-overflow-tooltip />
          <el-table-column label="供应商名称" align="center" prop="supplierName" min-width="120" show-overflow-tooltip />
          <el-table-column label="状态" align="center" prop="supplierStatus" min-width="80" >
            <template #default="scope">
              <dict-tag :options="project_general_status" :value="scope.row.supplierStatus"/>
            </template>
          </el-table-column>
          <el-table-column label="账期天数" align="center" prop="paymentTerm" min-width="80" />
          <el-table-column label="账期额度" align="center" prop="creditLimit" min-width="80" />
          <el-table-column label="已用额度" align="center" prop="usedCredit" min-width="80" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:supplier:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:supplier:remove']">删除</el-button>
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
      </el-col>
    </el-row>

    

    <!-- 添加或修改供应商对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="supplierRef" :model="form" :rules="rules" label-width="80px">
        <el-tabs type="border-card" v-model="activeTab">
          <el-tab-pane label="基础信息:" name="basic">
            <el-form-item label="供应商分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="categoryId"
                placeholder="请选择供应商分类"
                :accordion="true" filterable clearable
              />
            </el-form-item>
            <el-form-item label="供应商名称:" prop="supplierName">
              <el-input v-model="form.supplierName" placeholder="请输入供应商名称" type="textarea" maxlength="50" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="供应商编码:" prop="supplierCode">
              <el-input v-model="form.supplierCode" placeholder="请输入供应商编码" type="textarea" maxlength="50" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人名称:" prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人名称" type="textarea" maxlength="50" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人电话:" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" type="textarea" maxlength="20" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人邮箱:" prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" type="textarea" maxlength="50" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="供应商地址:" prop="contactAddress">
              <el-input v-model="form.contactAddress" placeholder="请输入供应商地址" type="textarea" maxlength="100" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="供应商状态:" prop="supplierStatus">
              <el-radio-group v-model="form.supplierStatus">
                <el-radio v-for="dict in project_general_status" :key="dict.value" :value="Number(dict.value)">{{ dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注:" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注"  type="textarea" maxlength="50" show-word-limit :rows="2"/>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="财务数据" name="financeInfo">
            <el-form-item label="账期天数:" prop="paymentTerm">
             <el-input-number v-model="form.paymentTerm" placeholder="请输入账期天数" :min="0" :max="365" style="width: 100%;">
              <template #suffix>
                <span>天</span>
              </template>
            </el-input-number>
            </el-form-item>
            <el-form-item label="账期额度:" prop="creditLimit">
              <el-input-number v-model="form.creditLimit" placeholder="请输入账期额度" :min="0" :max="999999" style="width: 100%;">
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="已用额度:" prop="usedCredit">
              <el-input-number v-model="form.usedCredit" placeholder="系统自动生成" disabled style="width: 100%;">
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
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

<script setup name="Supplier">
import { listSupplier, getSupplier, delSupplier, addSupplier, updateSupplier } from "@/api/order/supplier";
import {categoryTreeSelect } from "@/api/order/supplierCategory";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status, sys_yes_or_no } = proxy.useDict('project_general_status', 'sys_yes_or_no');

const supplierList = ref([]);
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
    pageSize: 20,
    categoryId: null,
    supplierName: null,
    supplierCode: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    supplierStatus: null,
    tenantId: null,
  },
  rules: {
    categoryId: [
      { required: true, message: "供应商分类不能为空", trigger: "change" }
    ],
    supplierName: [
      { required: true, message: "供应商名称不能为空", trigger: "blur" }
    ],
    supplierCode: [
      { required: true, message: "供应商编码不能为空", trigger: "blur" }
    ],
    contactName: [
      { required: true, message: "联系人名称不能为空", trigger: "blur" }
    ],
    contactPhone: [
      { required: true, message: "联系人电话不能为空", trigger: "blur" }
    ],
    contactEmail: [
      { required: true, message: "联系人邮箱不能为空", trigger: "blur" }
    ],
    contactAddress: [
      { required: true, message: "供应商地址不能为空", trigger: "blur" }
    ],
    supplierStatus: [
      { required: true, message: "供应商状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询供应商列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSupplier(queryParams.value).then(response => {
    supplierList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ------------------------------- 1 分类树相关 start -------------------------------
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

// ------------------------------- 1 分类树相关 end -------------------------------

// -------------------------------- 2 银行账户数据 start -------------------------------
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
// -------------------------------- 2 银行账户数据 end -------------------------------

// -------------------------------- 3 el-table-expand - 添加银行账户start --------------------------
const bankAccountList = ref(null);
const expandedRow = ref(null);
const handleExpandChange = (row) => {
  if (expandedRow.value && expandedRow.value !== row) {
    bankAccountList.value.toggleRowExpansion(expandedRow.value, false);
  }
  expandedRow.value = row;
};
// -------------------------------- 3 el-table-expand - 添加银行账户 end --------------------------

// -------------------------------- 4 el-table-expand - 客户列表查询 start --------------------------
const supplierTable = ref(null);
const expandedRow2 = ref(null);
const handleExpandChange2 = (row) => {
  if (expandedRow2.value && expandedRow2.value !== row) {
    supplierTable.value.toggleRowExpansion(expandedRow2.value, false);
  }
  expandedRow2.value = row;
};
// -------------------------------- 4 el-table-expand - 客户列表查询  end --------------------------



// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    supplierId: null,
    categoryId: null,
    supplierName: null,
    supplierCode: null,
    contactName: null,
    contactPhone: null,
    contactAddress: null,
    paymentTerm: null,
    creditLimit: null,
    usedCredit: null,
    supplierStatus: '0',
    remark: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    bankAccountList:[]
  };
  proxy.resetForm("supplierRef");
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
  ids.value = selection.map(item => item.supplierId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加供应商";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _supplierId = row.supplierId || ids.value
  getSupplier(_supplierId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改供应商";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["supplierRef"].validate(valid => {
    // 银行账户数据 - 去除没有银行账号的数据
    form.value.bankAccountList = form.value.bankAccountList.filter(item => item.accountNo);
    // 银行账户数据 - 将账户ID预制的ID值清空
    form.value.bankAccountList.forEach(item => {
      item.accountId = null;
    });
    if (valid) {
      if (form.value.supplierId != null) {
        updateSupplier(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSupplier(form.value).then(response => {
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
  const _supplierIds = row.supplierId || ids.value;
  proxy.$modal.confirm('是否确认删除供应商编号为"' + _supplierIds + '"的数据项？').then(function() {
    return delSupplier(_supplierIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/supplier/export', {
    ...queryParams.value
  }, `supplier_${new Date().getTime()}.xlsx`)
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
