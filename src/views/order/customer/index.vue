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
          <el-form-item label="客户编码: " prop="customerCode">
            <el-input
              v-model="queryParams.customerCode"
              placeholder="请输入客户编码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="客户名称: " prop="customerName">
            <el-input
              v-model="queryParams.customerName"
              placeholder="请输入客户名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="纳税人税号: " prop="invoiceTax">
            <el-input
              v-model="queryParams.invoiceTax"
              placeholder="请输入纳税人税号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="纳税人名称: " prop="invoiceName">
            <el-input
              v-model="queryParams.invoiceName"
              placeholder="请输入纳税人名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="纳税人电话: " prop="invoicePhone">
            <el-input
              v-model="queryParams.invoicePhone"
              placeholder="请输入纳税人电话"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="客户类型: " prop="customerType">
            <el-select v-model="queryParams.customerType" placeholder="请选择客户类型" clearable>
              <el-option
                v-for="dict in order_customer_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="客户等级: " prop="levelId">
            <el-select v-model="queryParams.levelId" placeholder="请选择客户等级" clearable>
              <el-option
                v-for="item in customerLevelList"
                :key="item.id"
                :label="item.levelName"
                :value="item.levelId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['order:customer:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['order:customer:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['order:customer:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['order:customer:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange" border  resizable >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="客户分类" align="center" prop="categoryVo.categoryName" min-width="120" show-overflow-tooltip />
          <el-table-column label="客户编码" align="center" prop="customerCode" min-width="120" show-overflow-tooltip/>
          <el-table-column label="客户名称" align="center" prop="customerName" min-width="150" show-overflow-tooltip />
          <el-table-column label="客户类型" align="center" prop="customerType" show-overflow-tooltip >
            <template #default="scope">
              <dict-tag :options="order_customer_type" :value="scope.row.customerType"/>
            </template>
          </el-table-column>
          <el-table-column label="客户等级" align="center" prop="leverId" >
            <template #default="scope">
              <span>{{ getCustomerLevelName(scope.row.levelId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="customerStatus" min-width="80" >
            <template #default="scope">
              <dict-tag :options="project_general_status" :value="scope.row.customerStatus"/>
            </template>
          </el-table-column>
          <el-table-column label="纳税人税号" align="center" prop="invoiceTax" min-width="120" show-overflow-tooltip />
          <el-table-column label="纳税人名称" align="center" prop="invoiceName" min-width="120" show-overflow-tooltip />
          <el-table-column label="纳税人电话" align="center" prop="invoicePhone" min-width="120" show-overflow-tooltip />
          <el-table-column label="纳税人邮编" align="center" prop="invoicePostcode" min-width="100" show-overflow-tooltip />
          <el-table-column label="纳税人地址" align="center" prop="invoiceAddress" min-width="120" show-overflow-tooltip />
          <el-table-column label="联系人名称" align="center" prop="contactName" min-width="100" show-overflow-tooltip />
          <el-table-column label="联系人电话" align="center" prop="contactPhone" min-width="100" show-overflow-tooltip />
          <el-table-column label="联系人邮箱" align="center" prop="contactEmail" min-width="100" show-overflow-tooltip />
          <el-table-column label="联系人地址" align="center" prop="contactAddress" min-width="100" show-overflow-tooltip />
          <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
          <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180" show-overflow-tooltip >
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="180" show-overflow-tooltip >
            <template #default="scope">
              <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:customer:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:customer:remove']">删除</el-button>
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
    

    <!-- 添加或修改客户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户分类" prop="categoryId">
          <el-tree-select
            v-model="form.categoryId"
            :data="categoryOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择客户分类"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="客户编码: " prop="customerCode">
          <el-input v-model="form.customerCode" placeholder="请输入客户编码" />
        </el-form-item>
        <el-form-item label="客户名称: " prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系人名称: " prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人名称" />
        </el-form-item>
        <el-form-item label="联系人电话: " prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
        <el-form-item label="联系人邮箱: " prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" />
        </el-form-item>
        <el-form-item label="联系人地址: " prop="contactAddress">
          <el-input v-model="form.contactAddress" placeholder="请输入联系人地址" />
        </el-form-item>
        <el-form-item label="客户类型: " prop="customerType">
          <el-select v-model="form.customerType" placeholder="请选择客户类型">
            <el-option
              v-for="dict in order_customer_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户等级: " prop="levelId">
          <el-select v-model="form.levelId" placeholder="请选择客户等级" clearable>
          <el-option
            v-for="item in customerLevelList"
            :key="item.id"
            :label="item.levelName"
            :value="item.levelId"
          />
        </el-select>
        </el-form-item>
        <el-form-item label="纳税人税号: " prop="invoiceTax">
          <el-input v-model="form.invoiceTax" placeholder="请输入纳税人税号" />
        </el-form-item>
        <el-form-item label="纳税人名称: " prop="invoiceName">
          <el-input v-model="form.invoiceName" placeholder="请输入纳税人名称" />
        </el-form-item>
        <el-form-item label="纳税人电话: " prop="invoicePhone">
          <el-input v-model="form.invoicePhone" placeholder="请输入纳税人电话" />
        </el-form-item>
        <el-form-item label="纳税人邮编: " prop="invoicePostcode">
          <el-input v-model="form.invoicePostcode" placeholder="请输入纳税人邮编" />
        </el-form-item>
        <el-form-item label="纳税人地址: " prop="invoiceAddress">
          <el-input v-model="form.invoiceAddress" placeholder="请输入纳税人地址" />
        </el-form-item>
        <el-form-item label="客户状态" prop="customerStatus">
          <el-radio-group v-model="form.customerStatus">
            <el-radio v-for="dict in project_general_status" :key="dict.value" :label="dict.value">{{ dict.label
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注: " prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
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

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { order_customer_type, project_general_status } = proxy.useDict('order_customer_type', 'project_general_status');

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

// 客户等级列表
const customerLevelList = ref([]);
const getCustomerLevelName = (levelId) => {
  const level = customerLevelList.value.find((item) => item.levelId === levelId);
  return level ? level.levelName : "";
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerCode: null,
    customerName: null,
    customerStatus: null,
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
    tenantId: null,
  },
  rules: {
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

// ------------------------------- 分类树相关 start -------------------------------
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

// ------------------------------- 分类树相关 end -------------------------------





// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
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
    remark: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("customerRef");
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

/** 获取客户等级列表 */
function getCustomerLevelList() {
  listCustomerLevel().then(response => {
    console.log("customerLevelList---------------",response.rows)
    customerLevelList.value = response.rows;
    console.log("customerLevelList---------------",customerLevelList.value)
  }).catch((error) => {
      console.error("获取客户等级列表时出错:", error);
  });
}

getCustomerLevelList()
getList();
</script>
