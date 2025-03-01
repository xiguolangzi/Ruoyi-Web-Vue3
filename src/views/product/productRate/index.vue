<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="税率名称" prop="rateName">
        <el-input
          v-model="queryParams.rateName"
          placeholder="请输入税率名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="税率状态" prop="rateStatus">
        <el-select v-model="queryParams.rateStatus" placeholder="请选择税率状态" clearable>
          <el-option
            v-for="dict in sys_tenant_status"
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
          v-hasPermi="['product:productRate:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['product:productRate:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:productRate:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['product:productRate:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="productRateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="税率ID" align="center" prop="rateId" />
      <el-table-column label="税率值(%)" align="center" prop="rateValue" />
      <el-table-column label="税率名称" align="center" prop="rateName" />
      <el-table-column label="税率状态" align="center" prop="rateStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.rateStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:productRate:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:productRate:remove']">删除</el-button>
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

    <!-- 添加或修改产品税率管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productRateRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="税率值(%)" prop="rateValue">
          <el-input-number v-model="form.rateValue" placeholder="请输入税率值(%)" style="width: auto;" :min="0"/>
        </el-form-item>
        <el-form-item label="税率名称" prop="rateName">
          <el-input v-model="form.rateName" placeholder="请输入税率名称" type="textarea" :maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="税率状态" prop="rateStatus">
          <el-radio-group v-model="form.rateStatus">
            <el-radio
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :label="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :maxlength="50" show-word-limit :rows="2"/>
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

<script setup name="ProductRate">
import { listProductRate, getProductRate, delProductRate, addProductRate, updateProductRate } from "@/api/product/productRate";
import useUserStore from "@/store/modules/user";

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

// 租户ID字段过滤使用
const userStore = useUserStore();

const productRateList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    rateName: null,
    rateStatus: null,
    tenantId: null,
  },
  rules: {
    rateValue: [
      { required: true, message: "税率值(%)不能为空", trigger: "blur" }
    ],
    rateName: [
      { required: true, message: "税率名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品税率管理列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProductRate(queryParams.value).then(response => {
    productRateList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    rateId: null,
    rateValue: null,
    rateName: null,
    rateStatus: '0',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    delFlag: null
  };
  proxy.resetForm("productRateRef");
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
  ids.value = selection.map(item => item.rateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品税率管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _rateId = row.rateId || ids.value
  getProductRate(_rateId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品税率管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRateRef"].validate(valid => {
    if (valid) {
      if (form.value.rateId != null) {
        updateProductRate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductRate(form.value).then(response => {
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
  const _rateIds = row.rateId || ids.value;
  proxy.$modal.confirm('是否确认删除产品税率管理编号为"' + _rateIds + '"的数据项？').then(function() {
    return delProductRate(_rateIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/productRate/export', {
    ...queryParams.value
  }, `productRate_${new Date().getTime()}.xlsx`)
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