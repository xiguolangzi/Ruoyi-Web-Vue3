<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="等级名称" prop="levelName">
        <el-input
          v-model="queryParams.levelName"
          placeholder="请输入等级名称"
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
          v-hasPermi="['order:customerLevel:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:customerLevel:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:customerLevel:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:customerLevel:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerLevelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" :width="55"/>
      <el-table-column label="等级名称" align="center" prop="levelName" show-overflow-tooltip/>
      <el-table-column label="基础折扣" align="center" prop="levelDiscount" >
        <template #default="scope">
          <el-tag>{{ scope.row.levelDiscount }} %</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="单价类型" align="center" prop="levelPrice" >
        <template #default="scope">
          <dict-tag :options="erp_product_price_type" :value="scope.row.levelPrice" />
        </template>
      </el-table-column>
      <el-table-column label="备注描述" align="left" header-align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" :min-width="140" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:customerLevel:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:customerLevel:remove']">删除</el-button>
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

    <!-- 添加或修改客户等级对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerLevelRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="form.levelName" placeholder="请输入等级名称" type="textarea" :maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="基础折扣" prop="levelDiscount">
          <el-input-number v-model="form.levelDiscount" placeholder="输入基础折扣" :max='100' :min='0' :step="0"
            value-on-clear="min" style="width: 100%;" :controls="false">
            <template #suffix>
              <span>%</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="单价类型" prop="levelPrice">
          <el-radio-group v-model="form.levelPrice" size="small">
            <el-radio-button 
              v-for="dict in erp_product_price_type" 
              :key="dict.value" 
              :value="dict.value">
              {{ dict.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息：" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息：" type="textarea" :maxlength="100" show-word-limit :rows="2"/>
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

<script setup name="CustomerLevel">
import { listCustomerLevel, getCustomerLevel, delCustomerLevel, addCustomerLevel, updateCustomerLevel } from "@/api/order/customerLevel";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_product_price_type } = proxy.useDict('erp_product_price_type');


const customerLevelList = ref([]);
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
    levelName: null,
    tenantId: null,
  },
  rules: {
    levelName: [
      { required: true, message: "等级名称不能为空", trigger: "blur" }
    ],
    levelDiscount: [
      { required: true, message: "等级折扣不能为空", trigger: "blur" }
    ],
    levelPrice: [
      { required: true, message: "等级价格不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户等级列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCustomerLevel(queryParams.value).then(response => {
    customerLevelList.value = response.rows;
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
    levelId: null,
    levelName: null,
    levelDiscount: null,
    levelPrice:'1',
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("customerLevelRef");
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
  ids.value = selection.map(item => item.levelId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户等级";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _levelId = row.levelId || ids.value
  getCustomerLevel(_levelId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户等级";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerLevelRef"].validate(valid => {
    if (valid) {
      if (form.value.levelId != null) {
        updateCustomerLevel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomerLevel(form.value).then(response => {
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
  const _levelIds = row.levelId || ids.value;
  proxy.$modal.confirm('是否确认删除客户等级编号为"' + _levelIds + '"的数据项？').then(function() {
    return delCustomerLevel(_levelIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/customerLevel/export', {
    ...queryParams.value
  }, `customerLevel_${new Date().getTime()}.xlsx`)
}

getList();
</script>
