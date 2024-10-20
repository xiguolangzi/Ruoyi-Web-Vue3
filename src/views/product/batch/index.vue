<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="sukId" prop="skuId">
        <el-input
          v-model="queryParams.skuId"
          placeholder="请输入sukId"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次编码" prop="batchCode">
        <el-input
          v-model="queryParams.batchCode"
          placeholder="请输入批次编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="生产日期" prop="productionTime">
        <el-date-picker clearable
          v-model="queryParams.productionTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择生产日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="过期日期" prop="expirationTime">
        <el-date-picker clearable
          v-model="queryParams.expirationTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择过期日期">
        </el-date-picker>
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
          v-hasPermi="['product:batch:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['product:batch:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:batch:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['product:batch:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="batchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="批次ID" align="center" prop="batchId" />
      <el-table-column label="sukId" align="center" prop="skuId" />
      <el-table-column label="批次编码" align="center" prop="batchCode" />
      <el-table-column label="生产日期" align="center" prop="productionTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.productionTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期日期" align="center" prop="expirationTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expirationTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购数量" align="center" prop="purchaseQuantity" />
      <el-table-column label="销售数量" align="center" prop="salesQuantity" />
      <el-table-column label="剩余数量" align="center" prop="restQuantity" />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:batch:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:batch:remove']">删除</el-button>
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

    <!-- 添加或修改商品批次对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="sukId" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入sukId" />
        </el-form-item>
        <el-form-item label="批次编码" prop="batchCode">
          <el-input v-model="form.batchCode" placeholder="请输入批次编码" />
        </el-form-item>
        <el-form-item label="采购数量" prop="purchaseQuantity">
          <el-input v-model="form.purchaseQuantity" placeholder="请输入采购数量" type="number" />
        </el-form-item>
        <el-form-item label="生产日期" prop="productionTime">
          <el-date-picker clearable
            v-model="form.productionTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择生产日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="过期日期" prop="expirationTime">
          <el-date-picker clearable
            v-model="form.expirationTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择过期日期">
          </el-date-picker>
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

<script setup name="Batch">
import { listBatch, getBatch, delBatch, addBatch, updateBatch } from "@/api/product/batch";
import useUserStore from "@/store/modules/user";
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const batchList = ref([]);
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
    skuId: null,
    batchCode: null,
    productionTime: null,
    expirationTime: null,
    tenantId: null
  },
  rules: {
    skuId: [
      { required: true, message: "sukId不能为空", trigger: "blur" },
      // 必须是数字
      { validator: (rule, value, callback) => {
        if (!/^\d+$/.test(value)) {
          callback(new Error('只能输入数字'));
        } else {
          callback();
        }
      }, trigger: 'blur' }
    ],
    batchCode: [
      { required: true, message: "批次编码不能为空", trigger: "blur" }
    ],
    purchaseQuantity: [
      { required: true, message: "采购数量不能为空", trigger: "blur" },
      // 必须大于0
      {
        validator: (rule, value, callback) => {
          if (parseInt(value, 10) <= 0) {
            callback(new Error('必须大于0'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品批次列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listBatch(queryParams.value).then(response => {
    batchList.value = response.rows;
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
    batchId: null,
    skuId: null,
    batchCode: null,
    productionTime: null,
    expirationTime: null,
    purchaseQuantity: null,
    salesQuantity: 0,
    restQuantity: 0,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("batchRef");
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
  ids.value = selection.map(item => item.batchId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加商品批次";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _batchId = row.batchId || ids.value
  getBatch(_batchId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改商品批次";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["batchRef"].validate(valid => {
    if (valid) {
      if (form.value.batchId != null) {
        updateBatch(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBatch(form.value).then(response => {
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
  const _batchIds = row.batchId || ids.value;
  proxy.$modal.confirm('是否确认删除商品批次编号为"' + _batchIds + '"的数据项？').then(function() {
    return delBatch(_batchIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/batch/export', {
    ...queryParams.value
  }, `batch_${new Date().getTime()}.xlsx`)
}

getList();
</script>
