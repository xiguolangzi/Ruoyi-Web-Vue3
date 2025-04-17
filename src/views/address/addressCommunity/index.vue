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
      <el-form-item label="大区编码" prop="communityCode">
        <el-input
          v-model="queryParams.communityCode"
          placeholder="请输入大区编码"
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
          v-hasPermi="['address:addressCommunity:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['address:addressCommunity:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['address:addressCommunity:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['address:addressCommunity:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table  class="table-container" v-loading="loading" :data="addressCommunityList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="国家编码" align="center" prop="countryCode" width="80"/>
      <el-table-column label="国家名称" align="center" width="100" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="languageStore.language == 'zh'">{{ scope.row.nameZh }}</span>
          <span v-if="languageStore.language == 'es'">{{ scope.row.nameEs }}</span>
          <span v-if="languageStore.language == 'en'">{{ scope.row.nameEn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="大区编码" align="center" prop="communityCode" width="80"/>
      <el-table-column label="大区名称-中" align="left"   prop="communityNameZh" show-overflow-tooltip/>
      <el-table-column label="大区名称-英" align="left" prop="communityNameEn" show-overflow-tooltip/>
      <el-table-column label="大区名称-西" align="left" prop="communityNameEs" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['address:addressCommunity:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['address:addressCommunity:remove']">删除</el-button>
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

    <!-- 添加或修改大区对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="addressCommunityRef" :model="form" :rules="rules" label-width="80px">
        
        <el-form-item label="选择国家" prop="countryId">
          <AddressCountrySelect v-model="form.countryId" @selectedData="selectCountryData" />
        </el-form-item>
        <el-form-item label="国家编码" prop="countryCode" >
          <el-input v-model="form.countryCode" placeholder="请输入国家编码" disabled/>
        </el-form-item>
        <el-form-item label="国家名称:" >
          <span v-if="languageStore.language == 'zh'">{{ form.nameZh }}</span>
          <span v-if="languageStore.language == 'es'">{{ form.nameEs }}</span>
          <span v-if="languageStore.language == 'en'">{{ form.nameEn }}</span>
        </el-form-item>
        <el-form-item label="大区编码" prop="communityCode">
          <el-input v-model="form.communityCode" placeholder="请输入大区编码" type="textarea" maxlength="5" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="大区名称-中" prop="communityNameZh">
          <el-input v-model="form.communityNameZh" placeholder="请输入大区名称-中" type="textarea" maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="大区名称-英" prop="communityNameEn">
          <el-input v-model="form.communityNameEn" placeholder="请输入大区名称-英" type="textarea" maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="大区名称-西" prop="communityNameEs">
          <el-input v-model="form.communityNameEs" placeholder="请输入大区名称-西" type="textarea" maxlength="50" show-word-limit :rows="1"/>
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

<script setup name="AddressCommunity">
import { listAddressCommunity, getAddressCommunity, delAddressCommunity, addAddressCommunity, updateAddressCommunity } from "@/api/address/addressCommunity";
import useUserStore from "@/store/modules/user";
import AddressCountrySelect from "@/components/Common/AddressCountrySelect.vue";
import {useLanguageStore} from "@/store/modules/language";

// 租户ID字段过滤使用
const userStore = useUserStore();

// 语言包
const languageStore = useLanguageStore();

const { proxy } = getCurrentInstance();

const addressCommunityList = ref([]);
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
    communityCode: null,
  },
  rules: {
    countryId: [
      { required: true, message: "国家ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/**
 * 选择国家数据
 * @param data 
 */
const selectCountryData = (data) => {
  if(data){
    console.log("获取表单数据：",data);
    form.value.countryId = data.countryId;
    form.value.countryCode = data.countryCode;
    form.value.nameZh = data.nameZh;
    form.value.nameEs = data.nameEs;
    form.value.nameEn = data.nameEn;
    console.log("获取表单数据：",form.value);
  }
}

/** 查询大区列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listAddressCommunity(queryParams.value).then(response => {
    addressCommunityList.value = response.rows;
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
    communityId: null,
    countryId: null,
    countryCode: null,
    communityCode: null,
    communityNameZh: null,
    communityNameEn: null,
    communityNameEs: null
  };
  proxy.resetForm("addressCommunityRef");
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
  ids.value = selection.map(item => item.communityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加大区";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _communityId = row.communityId || ids.value
  getAddressCommunity(_communityId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改大区";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["addressCommunityRef"].validate(valid => {
    if (valid) {
      if (form.value.communityId != null) {
        updateAddressCommunity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAddressCommunity(form.value).then(response => {
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
  const _communityIds = row.communityId || ids.value;
  proxy.$modal.confirm('是否确认删除大区编号为"' + _communityIds + '"的数据项？').then(function() {
    return delAddressCommunity(_communityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('address/addressCommunity/export', {
    ...queryParams.value
  }, `addressCommunity_${new Date().getTime()}.xlsx`)
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
