<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="品牌代码" prop="brandCode">
        <el-input
          v-model="queryParams.brandCode"
          placeholder="请输入品牌代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌名称" prop="brandName">
        <el-input
          v-model="queryParams.brandName"
          placeholder="请输入品牌名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择品牌状态" clearable>
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
          v-hasPermi="['product:brand:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['product:brand:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:brand:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['product:brand:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="brandList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌编码" align="center" prop="brandId" />
      <el-table-column label="品牌代码" align="center" prop="brandCode" />
      <el-table-column label="品牌名称" align="center" prop="brandName" />
      <el-table-column label="显示顺序" align="center" prop="brandSort" />
      <el-table-column label="品牌状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:brand:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:brand:remove']">删除</el-button>
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

    <!-- 添加或修改品牌管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="brandRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="品牌代码" prop="brandCode">
          <el-input v-model="form.brandCode" placeholder="请输入品牌代码" />
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="brandSort">
          <el-input v-model="form.brandSort" placeholder="请输入显示顺序" />
        </el-form-item>
        <el-form-item label="品牌状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Brand">
import { listBrand, getBrand, delBrand, addBrand, updateBrand } from "@/api/product/brand";
import useUserStore from "@/store/modules/user";
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

const brandList = ref([]);
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
    brandCode: null,
    brandName: null,
    status: null,
    tenantId: null
  },
  rules: {
    brandCode: [
      { required: true, message: "品牌代码不能为空", trigger: "blur" }
    ],
    brandName: [
      { required: true, message: "品牌名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "品牌状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询品牌管理列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listBrand(queryParams.value).then(response => {
    brandList.value = response.rows;
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
    brandId: null,
    brandCode: null,
    brandName: null,
    brandSort: "0",
    status: "0",
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null
  };
  proxy.resetForm("brandRef");
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
  ids.value = selection.map(item => item.brandId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加品牌管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _brandId = row.brandId || ids.value
  getBrand(_brandId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改品牌管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["brandRef"].validate(valid => {
    if (valid) {
      if (form.value.brandId != null) {
        updateBrand(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBrand(form.value).then(response => {
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
  const _brandIds = row.brandId || ids.value;
  proxy.$modal.confirm('是否确认删除品牌管理编号为"' + _brandIds + '"的数据项？').then(function() {
    return delBrand(_brandIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/brand/export', {
    ...queryParams.value
  }, `brand_${new Date().getTime()}.xlsx`)
}

getList();
</script>
