<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="卖家地区" prop="fromRegionCode">
        <el-input
          v-model="queryParams.fromRegionCode"
          placeholder="请输入卖家地区"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="买家地区" prop="toRegionCode">
        <el-input
          v-model="queryParams.toRegionCode"
          placeholder="请输入买家地区"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="行业代码" prop="industryCode">
        <el-select v-model="queryParams.industryCode" placeholder="请选择行业代码" >
          <el-option v-for="item in sys_tenant_type" :key="item.value" :label="item.label"
            :value="item.value"  />
        </el-select>
      </el-form-item>
      <el-form-item label="税务制度代码" prop="regimenCode">
        <el-select v-model="queryParams.regimenCode" placeholder="请选择税务制度代码" >
          <el-option v-for="item in invoice_regimen" :key="item.value" :label="item.label"
            :value="item.value"  />
        </el-select>
      </el-form-item>
      <el-form-item label="应税类型" prop="calificacionCode">
        <el-select v-model="queryParams.calificacionCode" placeholder="请选择应税类型" >
          <el-option v-for="item in invoice_calificacion" :key="item.value" :label="item.label"
            :value="item.value"  />
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
          v-hasPermi="['verifuc:verifacRule:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['verifuc:verifacRule:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['verifuc:verifacRule:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['verifuc:verifacRule:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="verifacRuleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则ID" align="center" prop="ruleId" />
      <el-table-column label="卖家地区" align="center" prop="fromRegionCode" />
      <el-table-column label="买家地区" align="center" prop="toRegionCode" />
      <el-table-column label="行业代码" align="center" prop="industryCode" >
        <template #default="scope">
          <dict-tag :options="sys_tenant_type" :value="scope.row.industryCode"/>
        </template>
      </el-table-column>
      <el-table-column label="税务制度代码" align="center" prop="regimenCode">
        <template #default="scope">
          <dict-tag :options="invoice_regimen" :value="scope.row.regimenCode"/>
        </template>
      </el-table-column>
      <el-table-column label="应税类型" align="center" prop="calificacionCode">
        <template #default="scope">
          <dict-tag :options="invoice_calificacion" :value="scope.row.calificacionCode"/>
        </template>
      </el-table-column>
      <el-table-column label="税率值" align="center" prop="rateValue" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['verifuc:verifacRule:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['verifuc:verifacRule:remove']">删除</el-button>
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

    <!-- 添加或修改verifac税务制度规则对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="verifacRuleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="卖家地区" prop="fromRegionCode">
          <el-input v-model="form.fromRegionCode" placeholder="请输入卖家地区" />
        </el-form-item>
        <el-form-item label="买家地区" prop="toRegionCode">
          <el-input v-model="form.toRegionCode" placeholder="请输入买家地区" />
        </el-form-item>
        <el-form-item label="行业代码" prop="industryCode">
          <el-select v-model="form.industryCode" placeholder="请选择行业代码" style="width: 60%;">
            <el-option v-for="item in sys_tenant_type" :key="item.value" :label="item.label"
              :value="item.value"  />
          </el-select>
        </el-form-item>
        <el-form-item label="税务制度代码" prop="regimenCode">
          <el-select v-model="form.regimenCode" placeholder="请选择税务制度代码" style="width: 60%;">
            <el-option v-for="item in invoice_regimen" :key="item.value" :label="item.label"
              :value="item.value"  />
          </el-select>
        </el-form-item>
        <el-form-item label="应税类型" prop="calificacionCode">
          <el-select v-model="form.calificacionCode" placeholder="请选择应税类型" style="width: 60%;">
            <el-option v-for="item in invoice_calificacion" :key="item.value" :label="item.label"
              :value="item.value"  />
          </el-select>
        </el-form-item>
        <el-form-item label="税率值" prop="rateValue">
          <el-input-number v-model="form.rateValue" :min="0" :max="100" placeholder="请输入税率值" style="width: 60%;" v-focusSelect>
            <template #suffix>%</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" maxlength="100" show-word-limit :rows="2"/>
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

<script setup name="VerifacRule">
import { listVerifacRule, getVerifacRule, delVerifacRule, addVerifacRule, updateVerifacRule } from "@/api/verifuc/verifacRule";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { invoice_regimen, invoice_calificacion, sys_tenant_type} = proxy.useDict("invoice_regimen", "invoice_calificacion", "sys_tenant_type");

const verifacRuleList = ref([]);
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
    fromRegionCode: null,
    toRegionCode: null,
    industryCode: null,
    regimenCode: null,
    calificacionCode: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询verifac税务制度规则列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVerifacRule(queryParams.value).then(response => {
    verifacRuleList.value = response.rows;
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
    ruleId: null,
    fromRegionCode: null,
    toRegionCode: null,
    industryCode: null,
    regimenCode: null,
    calificacionCode: null,
    rateValue: null,
    remark: null
  };
  proxy.resetForm("verifacRuleRef");
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
  ids.value = selection.map(item => item.ruleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加verifac税务制度规则";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _ruleId = row.ruleId || ids.value
  getVerifacRule(_ruleId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改verifac税务制度规则";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["verifacRuleRef"].validate(valid => {
    if (valid) {
      if (form.value.ruleId != null) {
        updateVerifacRule(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVerifacRule(form.value).then(response => {
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
  const _ruleIds = row.ruleId || ids.value;
  proxy.$modal.confirm('是否确认删除verifac税务制度规则编号为"' + _ruleIds + '"的数据项？').then(function() {
    return delVerifacRule(_ruleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('verifuc/verifacRule/export', {
    ...queryParams.value
  }, `verifacRule_${new Date().getTime()}.xlsx`)
}

getList();
</script>
