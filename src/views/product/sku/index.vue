<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品编码:" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称:" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="suk编号:" prop="skuCode">
        <el-input v-model="queryParams.skuCode" placeholder="请输入suk编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="sku状态:" prop="skuStatus">
        <el-select v-model="queryParams.skuStatus" placeholder="请选择sku状态" clearable>
          <el-option v-for="dict in product_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" v-if="controlUpdateAndDeleteSwitch">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['product:sku:add']"
          v-if="controlUpdateAndDeleteSwitch">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['product:sku:edit']" v-if="controlUpdateAndDeleteSwitch">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['product:sku:remove']" v-if="controlUpdateAndDeleteSwitch">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['product:sku:export']" v-if="controlUpdateAndDeleteSwitch">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="skuList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品编码" align="center" prop="productCode" />
      <el-table-column label="商品名称" align="center" prop="productName" />
      <el-table-column label="suk编号" align="center" prop="skuCode" />
      <el-table-column label="suk属性值" align="center" prop="skuValue">
        <template #default="scope">
          <div v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
            <strong v-if="item[0] !== '' && item[0] !== 'skuName'">
              {{ item[0] }}:
            </strong>
            <span v-if="item[0] !== '' && item[1] !== 'skuValue'">
              {{ item[1] }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="sku图片" align="center" prop="skuImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
        </template>
      </el-table-column>

      <el-table-column label="价格" header-align="center" align="left"  width="140" show-overflow-tooltip>
        <template #default="scope">
          <div class="price">
            <Strong> 价格1: </Strong>
            <span> {{ formatTwo(scope.row.skuPrice1) }} €</span>
          </div>
          <div class="price">
            <Strong> 价格2: </Strong>
            <span> {{ formatTwo(scope.row.skuPrice2) }} €</span>
          </div>
          <div class="price">
            <Strong> 价格3: </Strong>
            <span> {{ formatTwo(scope.row.skuPrice3) }} €</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="库存数量" align="center" prop="skuStock" width="80" />
      <el-table-column label="sku状态" align="center" prop="skuStatus" width="80">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.skuStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建信息" align="center" show-overflow-tooltip>
        <template #default="scope">
          <div class="price">
            <strong v-if="scope.row.createBy !== ''">创建者: </strong>
            <span>{{ scope.row.createBy }}</span>
          </div>
          <div class="price">
            <strong v-if="scope.row.createTime !== ''">创建时间: </strong>
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新信息" align="center"  show-overflow-tooltip>
        <template #default="scope">
          <div class="price">
            <strong v-if="scope.row.updateBy !== ''">更新者: </strong>
            <span>{{ scope.row.updateBy }}</span>
          </div>
          <div class="price">
            <strong v-if="scope.row.updateTime !== ''">更新时间: </strong>
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        v-if="controlUpdateAndDeleteSwitch">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['product:sku:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['product:sku:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改sku对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body v-if="controlUpdateAndDeleteSwitch">
      <el-form ref="skuRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品ID" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入商品编码" />
        </el-form-item>
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="suk编号" prop="skuCode">
          <el-input v-model="form.skuCode" placeholder="请输入suk编号" />
        </el-form-item>
        <el-form-item label="sku图片" prop="skuImage">
          <image-upload v-model="form.skuImage" />
        </el-form-item>
        <el-form-item label="销售价格1" prop="skuPrice1">
          <el-input v-model="form.skuPrice1" placeholder="请输入销售价格1" />
        </el-form-item>
        <el-form-item label="销售价格2" prop="skuPrice2">
          <el-input v-model="form.skuPrice2" placeholder="请输入销售价格2" />
        </el-form-item>
        <el-form-item label="销售价格3" prop="skuPrice3">
          <el-input v-model="form.skuPrice3" placeholder="请输入销售价格3" />
        </el-form-item>
        <el-form-item label="库存数量" prop="skuStock">
          <el-input v-model="form.skuStock" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="sku状态" prop="skuStatus">
          <el-radio-group v-model="form.skuStatus">
            <el-radio v-for="dict in product_status" :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="Sku">
import { listSku, getSku, delSku, addSku, updateSku } from "@/api/product/sku";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict('product_status');

const skuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 控制修改和删除的状态
const controlUpdateAndDeleteSwitch = ref(false);
/**  skuValue 转化成表格数据 */
const getSkuValue = (skuValueList) => {
  // 将 skuValueList 转化成 [["型号","AA"] , ["尺寸","SS"]]
  const tableData = ref(Object.entries(skuValueList));
  return tableData.value;
};
/** 保留2位小数 */
const formatTwo = (value) => {
  if (value) {
    return value.toFixed(2);
  } else {
    return 0.00;
  }
};
/** 保留3位小数 */
const formatTree = (value) => {
  if (value) {
    return value.toFixed(3);
  } else {
    return 0.00;
  }
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productCode: null,
    productName: null,
    skuCode: null,
    skuStatus: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询sku列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSku(queryParams.value).then(response => {
    skuList.value = response.rows;
    // 转移 skuValue 的json格式
    skuList.value.map((item) => {
      item.skuValue = JSON.parse(item.skuValue);
    });
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
    skuId: null,
    productId: null,
    productCode: null,
    productName: null,
    skuCode: null,
    skuValue: null,
    skuImage: null,
    skuPrice1: null,
    skuPrice2: null,
    skuPrice3: null,
    skuStock: null,
    skuStatus: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("skuRef");
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
  ids.value = selection.map(item => item.skuId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加sku";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _skuId = row.skuId || ids.value
  getSku(_skuId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改sku";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["skuRef"].validate(valid => {
    if (valid) {
      if (form.value.skuId != null) {
        updateSku(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSku(form.value).then(response => {
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
  const _skuIds = row.skuId || ids.value;
  proxy.$modal.confirm('是否确认删除sku编号为"' + _skuIds + '"的数据项？').then(function() {
    return delSku(_skuIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/sku/export', {
    ...queryParams.value
  }, `sku_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style scoped lang="scss">

.price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
