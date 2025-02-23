<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="仓库名称:" prop="warehouseName" style="margin-right: 0px;">
        <el-input
          v-model="queryParams.warehouseName"
          placeholder="请输入仓库名称"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName" style="margin-right: 0px;">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="商品编码" prop="productCode" style="margin-right: 0px;">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入商品编码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="SKU编码" prop="skuCode" style="margin-right: 0px;">
        <el-input
          v-model="queryParams.skuCode"
          placeholder="请输入SKU编码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNo" style="margin-right: 20px;">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
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
          v-hasPermi="['inventory:productInventory:add']"
          v-if="showOperation"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['inventory:productInventory:edit']"
          v-if="showOperation"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['inventory:productInventory:remove']"
          v-if="showOperation"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inventory:productInventory:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productInventoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" v-if="showOperation"/>
      <el-table-column label="序号" width="50" align="center" type="index" />
      <el-table-column label="仓库名称" align="left" prop="warehouseForStockInVo.warehouseName" show-overflow-tooltip/>
      <el-table-column label="商品名称" align="left" prop="productSkuVo.productName" show-overflow-tooltip/>
      <el-table-column label="商品编码" align="left" prop="productSkuVo.productCode" show-overflow-tooltip/>
      <el-table-column label="sku编码" align="left" prop="productSkuVo.skuCode" show-overflow-tooltip/>
      <el-table-column label="suk规格" align="left" prop="productSkuVo.skuValue" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <div v-if="getSkuValue(scope.row.productSkuVo?.skuValue) === 'default'">
            --  <!-- 直接显示默认 SKU -->
          </div>
          <div v-else v-for="(item, index) in getSkuValue(scope.row.productSkuVo?.skuValue)" :key="index">
            <strong>{{ item[0] }}:</strong>
            <span>{{ item[1] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" width="80" align="center" prop="unitVo.unitCode" />
      <el-table-column label="批次号" align="center" prop="batchNo" />
      <el-table-column label="库存数量" align="center" prop="quantity" />
      <el-table-column label="加权平均成本" align="center" prop="averageCost" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.averageCost) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新时间" align="center" prop="lastUpdateTime" width="110" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastUpdateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="showOperation">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['inventory:productInventory:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['inventory:productInventory:remove']">删除</el-button>
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

    <!-- 添加或修改商品库存对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productInventoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="仓库ID" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="请输入仓库ID" />
        </el-form-item>
        <el-form-item label="sukId" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入sukId" />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="库存数量" prop="qyantity">
          <el-input v-model="form.qyantity" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="加权平均成本" prop="averageCost">
          <el-input v-model="form.averageCost" placeholder="请输入加权平均成本" />
        </el-form-item>
        <el-form-item label="最后更新时间" prop="lastUpdateTime">
          <el-date-picker clearable
            v-model="form.lastUpdateTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择最后更新时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="租户id" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户id" />
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

<script setup name="ProductInventory">
import { listProductInventory, getProductInventory, delProductInventory, addProductInventory, updateProductInventory } from "@/api/inventory/productInventory";
import useUserStore from "@/store/modules/user";
import { ref } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const productInventoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 控制操作的显隐
const showOperation = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    warehouseName: null,
    skuCode: null,
    productCode: null,
    productName: null,
    batchNo: null,
    tenantId: null
  },
  rules: {
    warehouseId: [
      { required: true, message: "仓库ID不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "sukId不能为空", trigger: "blur" }
    ],
    batchNo: [
      { required: true, message: "批次号不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户id不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品库存列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProductInventory(queryParams.value).then(response => {
    productInventoryList.value = response.rows;
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
    warehouseId: null,
    skuId: null,
    batchNo: null,
    qyantity: null,
    averageCost: null,
    lastUpdateTime: null,
    tenantId: null
  };
  proxy.resetForm("productInventoryRef");
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
  title.value = "添加商品库存";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProductInventory(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改商品库存";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productInventoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProductInventory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductInventory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除商品库存编号为"' + _ids + '"的数据项？').then(function() {
    return delProductInventory(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('inventory/productInventory/export', {
    ...queryParams.value
  }, `productInventory_${new Date().getTime()}.xlsx`)
}

getList();
</script>
