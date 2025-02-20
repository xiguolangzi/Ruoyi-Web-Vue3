<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户" prop="customerId">
        <el-select v-model="queryParams.customerId" filterable clearable placeholder="请选择客户" style="width: 150px">
          <el-option v-for="item in customerList" :key="item.customerId" :label="item.customerName"
            :value="item.customerId" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务员" prop="userId">
        <el-select v-model="queryParams.salesmanId" filterable clearable placeholder="请选择业务员" style="width: 150px">
          <el-option v-for="item in salesmanList" :key="item.userId" :label="item.userName" :value="item.userId" />
        </el-select>
      </el-form-item>
      <el-form-item label="默认状态" prop="isDefault">
        <el-select v-model="queryParams.isDefault" placeholder="请选择默认状态" clearable>
          <el-option v-for="dict in sys_yes_or_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 50px;">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" v-if="defaultCanEdit">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['order:customerSalesman:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['order:customerSalesman:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['order:customerSalesman:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['order:customerSalesman:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerSalesmanList" @selection-change="handleSelectionChange" table-layout="fixed">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="55" prop="id" />
      <el-table-column label="客户编码" align="center">
        <template #default="scope">
          <span>{{ scope.row.customer ? scope.row.customer.customerCode : '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" >
        <template #default="scope">
          <span>{{ scope.row.customer ? scope.row.customer.customerName : '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务员名称" align="center" >
        <template #default="scope">
          <span>{{ scope.row.salesmanVo ? scope.row.salesmanVo.userName : '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="默认状态" align="center" prop="isDefault">
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.isDefault" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="defaultCanEdit">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['order:customerSalesman:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['order:customerSalesman:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改客户绑定业务员对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerSalesmanRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" filterable clearable placeholder="请选择客户" style="width: 150px">
            <el-option v-for="item in customerList" :key="item.customerId"
              :label="item.customerCode +' - '+ item.customerName" :value="item.customerId" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务员" prop="userId">
          <el-select v-model="form.userId" filterable clearable placeholder="请选择业务员" style="width: 150px">
            <el-option v-for="item in salesmanList" :key="item.userId" :label="item.userName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认状态:" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio v-for="dict in sys_yes_or_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" v-if="defaultCanEdit">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CustomerSalesman">
import { listCustomerSalesman, getCustomerSalesman, delCustomerSalesman, addCustomerSalesman, updateCustomerSalesman } from "@/api/order/customerSalesman";
import useUserStore from "@/store/modules/user";
import { listSalesman } from "@/api/system/user"
import { listCustomer } from "@/api/order/customer"

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_yes_or_no } = proxy.useDict('sys_yes_or_no');

const customerSalesmanList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const defaultCanEdit = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerId: null,
    salesmanId: null,
    isDefault: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户绑定业务员列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCustomerSalesman(queryParams.value).then(response => {
    customerSalesmanList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ---------------- 1 获取客户数据 start ----------------
const customerList = ref([]);
/** 供应商 - 获取列表 */
const getCustomers = async () => {
  listCustomer()
    .then(response => {
      customerList.value = response.rows || []
    })
    .catch(error => {
      ElMessage.error("获取供应商列表时出错:", error)
    })
};
getCustomers()

// ---------------- 1 获取客户数据 end   ----------------

// --------------- 2 获取业务员数据 start ----------------
const salesmanList = ref([]);
const getSalesman = async () => {
  listSalesman()
    .then(response => {
      salesmanList.value = response.rows || []
    })
    .catch(error => {
      ElMessage.error("获取员工列表时出错:", error)
    })
};
getSalesman()

// --------------- 2 获取业务员数据 end    ----------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    bindId: null,
    customerId: null,
    userId: null,
    createTime: null,
    isDefault: '1',
    tenantId: null
  };
  proxy.resetForm("customerSalesmanRef");
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
  ids.value = selection.map(item => item.bindId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户绑定业务员";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _bindId = row.bindId || ids.value
  getCustomerSalesman(_bindId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户绑定业务员";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerSalesmanRef"].validate(valid => {
    if (valid) {
      if (form.value.bindId != null) {
        updateCustomerSalesman(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomerSalesman(form.value).then(response => {
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
  const _bindIds = row.bindId || ids.value;
  proxy.$modal.confirm('是否确认删除客户绑定业务员编号为"' + _bindIds + '"的数据项？').then(function() {
    return delCustomerSalesman(_bindIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/customerSalesman/export', {
    ...queryParams.value
  }, `customerSalesman_${new Date().getTime()}.xlsx`)
}

getList();
</script>
