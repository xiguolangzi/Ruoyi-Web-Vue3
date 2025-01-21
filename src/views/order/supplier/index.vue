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
                :value="dict.value"
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

        <el-table v-loading="loading" :data="supplierList" @selection-change="handleSelectionChange" border>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="供应商分类" align="center" prop="categoryVo.categoryName" min-width="120" show-overflow-tooltip />
          <el-table-column label="供应商名称" align="center" prop="supplierName" min-width="120" show-overflow-tooltip />
          <el-table-column label="供应商编码" align="center" prop="supplierCode" min-width="150" show-overflow-tooltip />
          <el-table-column label="联系人名称" align="center" prop="contactName" min-width="150" show-overflow-tooltip />
          <el-table-column label="联系人电话" align="center" prop="contactPhone" min-width="120" show-overflow-tooltip />
          <el-table-column label="供应商地址" align="center" prop="address" min-width="150" show-overflow-tooltip />
          <el-table-column label="状态" align="center" prop="supplierStatus" min-width="80" >
            <template #default="scope">
              <dict-tag :options="project_general_status" :value="scope.row.supplierStatus"/>
            </template>
          </el-table-column>
          <el-table-column label="账期天数" align="center" prop="paymentTerm" min-width="80" />
          <el-table-column label="账期额度" align="center" prop="creditLimit" min-width="80" />
          <el-table-column label="已用额度" align="center" prop="usedCredit" min-width="80" />
          <el-table-column label="备注" align="center" prop="remark" min-width="120" show-overflow-tooltip />
          <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip />
          <el-table-column label="创建时间" align="center" prop="createTime"  show-overflow-tooltip>
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新者" align="center" prop="updateBy"  show-overflow-tooltip />
          <el-table-column label="更新时间" align="center" prop="updateTime"  show-overflow-tooltip >
            <template #default="scope">
              <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
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
        <el-form-item label="供应商分类" prop="categoryId">
          <el-tree-select
            v-model="form.categoryId"
            :data="categoryOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择供应商分类"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="供应商编码" prop="supplierCode">
          <el-input v-model="form.supplierCode" placeholder="请输入供应商编码" />
        </el-form-item>
        <el-form-item label="联系人名称" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人名称" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
        <el-form-item label="供应商地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入供应商地址" />
        </el-form-item>
        <el-form-item label="账期天数" prop="paymentTerm">
          <el-input v-model="form.paymentTerm" placeholder="请输入账期天数" />
        </el-form-item>
        <el-form-item label="账期额度" prop="creditLimit">
          <el-input v-model="form.creditLimit" placeholder="请输入账期额度" />
        </el-form-item>
        <el-form-item label="已用额度" prop="usedCredit">
          <el-input v-model="form.usedCredit" placeholder="请输入已用额度" />
        </el-form-item>
        <el-form-item label="供应商状态" prop="supplierStatus">
          <el-radio-group v-model="form.supplierStatus">
            <el-radio v-for="dict in project_general_status" :key="dict.value" :label="dict.value">{{ dict.label
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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

<script setup name="Supplier">
import { listSupplier, getSupplier, delSupplier, addSupplier, updateSupplier } from "@/api/order/supplier";
import {categoryTreeSelect } from "@/api/order/supplierCategory";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status } = proxy.useDict('project_general_status');

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
    address: [
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
    supplierId: null,
    categoryId: null,
    supplierName: null,
    supplierCode: null,
    contactName: null,
    contactPhone: null,
    address: null,
    paymentTerm: null,
    creditLimit: null,
    usedCredit: null,
    supplierStatus: '0',
    remark: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("supplierRef");
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
