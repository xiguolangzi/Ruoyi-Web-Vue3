<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="国家编码" prop="countryCode">
        <el-input
          v-model="queryParams.countryCode"
          placeholder="请输入国家编码"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['address:addressCountry:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['address:addressCountry:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['address:addressCountry:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['address:addressCountry:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="addressCountryList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="国家编码" align="center" prop="countryCode" width="100"/>
      <el-table-column label="国家名称-中" align="left" prop="nameZh" />
      <el-table-column label="国家名称-英" align="left" prop="nameEn" />
      <el-table-column label="国家名称-西" align="left" prop="nameEs" />
      <el-table-column label="排序" align="center" prop="orderNum" width="80"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['address:addressCountry:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['address:addressCountry:remove']">删除</el-button>
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

    <!-- 添加或修改国家表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="addressCountryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="国家编码" prop="countryCode">
          <el-input v-model="form.countryCode" placeholder="请输入国家编码" type="textarea" maxlength="5" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="国家名称-中" prop="nameZh">
          <el-input v-model="form.nameZh" placeholder="请输入国家名称-中" type="textarea" maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="国家名称-英" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入国家名称-英" type="textarea" maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="国家名称-西" prop="nameEs">
          <el-input v-model="form.nameEs" placeholder="请输入国家名称-西" type="textarea" maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" placeholder="请输入排序" :controls="false" :step="0" :precision="0" :min="0" :max="99999"/>
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

<script setup name="AddressCountry">
import { listAddressCountry, getAddressCountry, delAddressCountry, addAddressCountry, updateAddressCountry } from "@/api/address/addressCountry";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const addressCountryList = ref([]);
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
    countryCode: null,
  },
  rules: {
    countryCode: [
      { required: true, message: "iso编码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询国家表列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listAddressCountry(queryParams.value).then(response => {
    addressCountryList.value = response.rows;
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
    countryId: null,
    countryCode: null,
    nameZh: null,
    nameEn: null,
    nameEs: null,
    orderNum: null,
  };
  proxy.resetForm("addressCountryRef");
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
  ids.value = selection.map(item => item.countryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加国家表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _countryId = row.countryId || ids.value
  getAddressCountry(_countryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改国家表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["addressCountryRef"].validate(valid => {
    if (valid) {
      if (form.value.countryId != null) {
        updateAddressCountry(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAddressCountry(form.value).then(response => {
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
  const _countryIds = row.countryId || ids.value;
  proxy.$modal.confirm('是否确认删除国家表编号为"' + _countryIds + '"的数据项？').then(function() {
    return delAddressCountry(_countryIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('address/addressCountry/export', {
    ...queryParams.value
  }, `addressCountry_${new Date().getTime()}.xlsx`)
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
