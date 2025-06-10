<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户授权码" prop="codigo">
        <el-input
          v-model="queryParams.codigo"
          placeholder="请输入客户授权码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="软件名称" prop="softwareName">
        <el-input
          v-model="queryParams.softwareName"
          placeholder="请输入软件名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="软件版本" prop="softwareVersion">
        <el-input
          v-model="queryParams.softwareVersion"
          placeholder="请输入软件版本"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开发者税号" prop="softwareAuthorNif">
        <el-input
          v-model="queryParams.softwareAuthorNif"
          placeholder="请输入开发者税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开发者名称" prop="softwareAuthorNombre">
        <el-input
          v-model="queryParams.softwareAuthorNombre"
          placeholder="请输入开发者名称"
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
          v-hasPermi="['verifuc:verifacSoftwareInfo:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['verifuc:verifacSoftwareInfo:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['verifuc:verifacSoftwareInfo:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['verifuc:verifacSoftwareInfo:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="verifacSoftwareInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户税号" align="center" prop="nif" />
      <el-table-column label="客户授权码" align="center" prop="codigo" />
      <el-table-column label="软件名称" align="center" prop="softwareName" />
      <el-table-column label="软件版本" align="center" prop="softwareVersion" />
      <el-table-column label="开发者税号" align="center" prop="softwareAuthorNif" />
      <el-table-column label="开发者名称" align="center" prop="softwareAuthorNombre" />
      <el-table-column label="默认状态" align="center" prop="isDefault" >
        <template #default="scope">
          <el-switch 
          v-model="scope.row.isDefault" 
          :active-value="0" :inactive-value="1" active-text="是" inactive-text="否"  inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          @change="handleUpdateStatus(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="删除状态" align="center" prop="delFlag" >
        <template #default="scope">
          <span v-if="scope.row.delFlag == 0"> 否 </span>
          <span style="color:brown;" v-else> 是 </span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['verifuc:verifacSoftwareInfo:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['verifuc:verifacSoftwareInfo:remove']">删除</el-button>
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

    <!-- 添加或修改软件注册信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="verifacSoftwareInfoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户税号" prop="nif">
          <el-input v-model="form.nif" placeholder="请输入客户税号" type="textarea" maxlength="9" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="客户授权码" prop="codigo">
          <el-input v-model="form.codigo" placeholder="请输入客户税号" type="textarea" maxlength="30" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="软件名称" prop="softwareName">
          <el-input v-model="form.softwareName" placeholder="请输入软件名称" type="textarea" maxlength="50" show-word-limit :rows="1" />
        </el-form-item>
        <el-form-item label="软件版本" prop="softwareVersion">
          <el-input v-model="form.softwareVersion" placeholder="请输入软件版本" type="textarea" maxlength="20" show-word-limit :rows="1" />
        </el-form-item>
        <el-form-item label="开发者税号" prop="softwareAuthorNif">
          <el-input v-model="form.softwareAuthorNif" placeholder="请输入开发者税号" type="textarea" maxlength="9" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="开发者名称" prop="softwareAuthorNombre">
          <el-input v-model="form.softwareAuthorNombre" placeholder="请输入开发者名称" type="textarea" maxlength="30" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="默认状态" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio :value="0">是</el-radio>
            <el-radio :value="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="删除状态" prop="delFlag">
          <el-radio-group v-model="form.delFlag">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="2">是</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定 </el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VerifacSoftwareInfo">
import { listVerifacSoftwareInfo, getVerifacSoftwareInfo, delVerifacSoftwareInfo, addVerifacSoftwareInfo, updateVerifacSoftwareInfo } from "@/api/verifuc/verifacSoftwareInfo";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const verifacSoftwareInfoList = ref([]);
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
    codigo: null,
    softwareName: null,
    softwareVersion: null,
    softwareAuthorNif: null,
    softwareAuthorNombre: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询软件注册信息列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVerifacSoftwareInfo(queryParams.value).then(response => {
    verifacSoftwareInfoList.value = response.rows;
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
    id: null,
    nif: null,
    codigo: null,
    softwareName: null,
    softwareVersion: null,
    softwareAuthorNif: null,
    softwareAuthorNombre: null,
    isDefault: 1,
    delFlag:  0,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm("verifacSoftwareInfoRef");
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
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加软件注册信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getVerifacSoftwareInfo(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改软件注册信息";
  });

}

/** 开关按钮修改默认状态 */
function handleUpdateStatus(row) { 
  updateVerifacSoftwareInfo(row).then(response => { 
    proxy.$modal.msgSuccess("修改成功");
    getList();
  }).catch(getList());
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["verifacSoftwareInfoRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateVerifacSoftwareInfo(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVerifacSoftwareInfo(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除软件注册信息编号为"' + _ids + '"的数据项？').then(function() {
    return delVerifacSoftwareInfo(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('verifuc/verifacSoftwareInfo/export', {
    ...queryParams.value
  }, `verifacSoftwareInfo_${new Date().getTime()}.xlsx`)
}

getList();
</script>
