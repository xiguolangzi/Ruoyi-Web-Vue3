<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品状态" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择商品状态" clearable style="width: 200px;">
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-tree-select
            v-model="queryParams.categoryId"
            :data="categoryList"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择商品分类"
            style="width: 200px;"
            clearable
          />
      </el-form-item>
      <el-form-item label="商品品牌" prop="brandId">
        <el-select v-model="queryParams.brandId" placeholder="请选择商品品牌" clearable style="width: 200px;">
          <el-option
            v-for="items in brandList"
            :key="items.brandId"
            :label="items.brandName"
            :value="items.brandId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成本计算" prop="costMethod">
        <el-select v-model="queryParams.costMethod" placeholder="请选择成本计算" clearable style="width: 200px;">
          <el-option
            v-for="dict in product_cost_method"
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
          v-hasPermi="['product:product:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['product:product:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:product:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['product:product:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品ID" align="center" prop="productId" />
      <el-table-column label="商品名称" align="center" prop="productName" />
      <el-table-column label="商品价格" align="center" prop="productPrice" />
      <el-table-column label="商品主图" align="center" prop="productImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.productImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="商品状态" align="center" prop="productStatus">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.productStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" align="center" prop="unitId" />
      <el-table-column label="商品分类ID" align="center" prop="categoryId" />
      <el-table-column label="商品品牌ID" align="center" prop="brandId" />
      <el-table-column label="成本计算" align="center" prop="costMethod">
        <template #default="scope">
          <dict-tag :options="product_cost_method" :value="scope.row.costMethod"/>
        </template>
      </el-table-column>
      <el-table-column label="长(cm)" align="center" prop="length" />
      <el-table-column label="宽(cm)" align="center" prop="width" />
      <el-table-column label="高(cm)" align="center" prop="height" />
      <el-table-column label="体积(m3)" align="center" prop="volume" />
      <el-table-column label="重量(kg)" align="center" prop="weight" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:product:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:product:remove']">删除</el-button>
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
  </div>
</template>

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/product/product";
import { listCategory } from "@/api/product/category";
import { listUnit } from "@/api/product/unit";
import { listBrand } from "@/api/product/brand";
import useUserStore from "@/store/modules/user";
import { useRouter,useRoute } from "vue-router";
// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 控制标签页的默认激活位置
const activeName = ref('first')

// 规格代码
const specs = ref([
  { name: '尺码', values: ['S', 'M', 'L'], selected: true },
  { name: '颜色', values: ['红色', '黑色'], selected: true }
])

const { proxy } = getCurrentInstance();
const { product_cost_method, product_status } = proxy.useDict('product_cost_method', 'product_status');

const productList = ref([]);
const productSkuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedProductSku = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryList = ref([]);
const unitList = ref([]);
const brandList = ref([]);
const baseUnit = "0"

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productName: null,
    productStatus: null,
    categoryId: null,
    brandId: null,
    costMethod: null,
    tenantId: null
  },
  rules: {
    productName: [
      { required: true, message: "商品名称不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "商品分类ID不能为空", trigger: "blur" }
    ],
    productPrice: [
      { required: true, message: "商品价格不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
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
    productId: null,
    productCode: null,
    productName: null,
    productPrice: null,
    productImage: null,
    productAttr: null,
    productStatus: "0",
    unitId: null,
    categoryId: null,
    brandId: null,
    costMethod: product_cost_method.value[0].value,
    length: null,
    width: null,
    height: null,
    volume: null,
    weight: null,
    productSort: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  productSkuList.value = [];
  proxy.resetForm("productRef");
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
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  // reset();
  if(unitList.length < 1){
    // 提示：请添加计量单位，跳转到计量单位页
    console.log("提示：请添加计量单位，跳转到计量单位页")
  }
  router.push({ path: '/product/edit' });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _productId = row.productId || ids.value
  console.log("修改的ID*******",_productId)
  router.push({ path: '/product/edit', query: { productId: _productId[0] } });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      form.value.productSkuList = productSkuList.value;
      if (form.value.productId != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
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
  const _productIds = row.productId || ids.value;
  proxy.$modal.confirm('是否确认删除商品编号为"' + _productIds + '"的数据项？').then(function() {
    return delProduct(_productIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

/** 获取商品分类下拉框数据 */
function getCategoryList() {
  listCategory().then(response => {
    categoryList.value = proxy.handleTree(response.data, "categoryId", "parentId");
    console.log("categoryList:", categoryList.value);
  }).catch(error => {
    console.error("获取分类列表时出错:", error);
  });
}
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit({}).then(response => {
    // 产品只赋值基础单位
    unitList.value = response.rows.filter(row => row.unitType === baseUnit)
    
  }).catch(error => {
    console.error("获取计量单位列表时出错:", error);
  });
}
/** 获取品牌下拉框数据 */
function getBrandList() {
  listBrand({}).then(response => {
    brandList.value = response.rows;
  }).catch(error => {
    console.error("获取品牌列表时出错:", error);
  });
}

watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList()
  }
)

getCategoryList();
getUnitList();
getBrandList();
getList();
</script>

<style scoped >
.compact-form-item {
  margin-bottom: 0;
  /* 根据需要调整其他样式 */
  
  
}
.spec-row {
    display: flex;
    align-items: center;
  }
</style>
