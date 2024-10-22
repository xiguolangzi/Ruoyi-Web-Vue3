<template>
  <div class="app-container">
    <!-------------------- 搜索条件 ----------------------->

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品编码:" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称:" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品分类:" prop="categoryId">
        <el-tree-select v-model="queryParams.categoryId" :data="categoryList" :props="{
          value: 'categoryId',
          label: 'categoryName',
          children: 'children',
        }" value-key="categoryId" placeholder="请选择商品分类" clearable />
      </el-form-item>
      <el-form-item label="商品状态:" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择商品状态" clearable>
          <el-option v-for="dict in product_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品品牌:" prop="brandId">
        <el-select v-model="queryParams.brandId" placeholder="请选择商品品牌" clearable>
          <el-option v-for="items in brandList" :key="items.brandId" :label="items.brandName" :value="items.brandId" />
        </el-select>
      </el-form-item>
      <el-form-item label="成本计算:" prop="costMethod">
        <el-select v-model="queryParams.costMethod" placeholder="请选择成本计算" clearable>
          <el-option v-for="dict in product_cost_method" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-------------------- 操作按钮栏 ----------------------->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['product:product:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['product:product:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['product:product:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['product:product:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-------------------- 数据展示列表区域 ----------------------->

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange" fit>
      <el-table-column type="selection" width="50" align="center" fixed="left" />
      <el-table-column label="商品主图" align="center" prop="productImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.productImage" :width="75" :height="75" />
        </template>
      </el-table-column>
      <el-table-column label="商品编码/名称" header-align="center" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <div>
            <strong> 编码：</strong>
            <span>{{ scope.row.productCode }}</span>
          </div>
          <div>
            <strong> 名称：</strong>
            <span>{{ scope.row.productName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="sku规格" min-width="80" show-overflow-tooltip>
        <template #default="scope">
          <div v-for="(item, index) in scope.row.skuSelected" :key="index">
            <strong v-if="item.name">{{ item.name }} : </strong>
            <span>{{ item.values.join(" 、 ") }}</span>
            <span v-if="!item.name"> -- </span>
          </div>

        </template>
      </el-table-column>
      <el-table-column label="计量单位" align="center" prop="unitId" width="80">
        <template #default="scope">
          <span>{{ getUnitName(scope.row.unitId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格" header-align="center" align="right" prop="productPrice" width="80">
        <template #default="scope">
          <span>{{ formatTwo(scope.row.productPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="productStatus" width="80">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.productStatus" />
        </template>
      </el-table-column>


      <el-table-column label="商品分类/品牌" header-align="center" show-overflow-tooltip>
        <template #default="scope">
          <div>
            <strong>分类：</strong>
            <span>{{ getCategoryName(scope.row.categoryId) }} </span>
          </div>
          <div>
            <strong>品牌：</strong>
            <span>{{ getBrandName(scope.row.brandId) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最后修改信息" header-align="center" show-overflow-tooltip>
        <template #default="scope">
          <div>
            <strong>修改人：</strong>
            <span>{{ scope.row.updateBy }} </span>
          </div>
          <div>
            <strong>时间：</strong>
            <span>{{ scope.row.updateTime }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip width="200" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <div>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['product:product:edit']">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
              v-hasPermi="['product:product:remove']">删除</el-button>
          </div>
          <div>
            <el-button link type="success" icon="MoreFilled" @click="lookDetails(scope.row)">查看详情</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-------------------- 商品详情查看 dialog ----------------------->

    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <!------ 商品部分 ------>
      <div>
        <el-card>
          <template #header> 基础信息 </template>
          <div style="
              display: flex;
              justify-content: space-evenly;
              align-items: center;
            ">
            <div>
              <strong>产品名称: </strong>
              <span> {{ productDetail.productName }} </span>
            </div>
            <div>
              <strong>产品编码: </strong>
              <span> {{ productDetail.productCode }} </span>
            </div>
          </div>
          <el-descriptions direction="vertical" :column="6" :size="size" border style="margin-top: 20px">
            <el-descriptions-item label="商品分类" :span="2" align="center">
              {{
              getCategoryName(productDetail.categoryId)
              ? productDetail.categoryId
              : "--"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="品牌" align="center">
              {{
              getBrandName(productDetail.brandId)
              ? productDetail.brandId
              : "--"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="价格" align="center">
              {{ formatTwo(productDetail.productPrice) }} €
            </el-descriptions-item>
            <el-descriptions-item label="计量单位" align="center">
              {{
              getUnitName(productDetail.unitId) ? productDetail.unitId : "--"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="状态" align="center">
              <dict-tag :options="product_status" :value="productDetail.productStatus" />
            </el-descriptions-item>
            <el-descriptions-item label="成本核算方式" :span="2" align="center">
              <dict-tag :options="product_cost_method" :value="productDetail.costMethod" />
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="4" align="left" label-align="center">
              {{ productDetail.remark ? productDetail.remark : "--" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      <!-------------------- 包装信息 ----------------------->
      <div>
        <el-card>
          <template #header> 包装信息 </template>
          <el-descriptions direction="vertical" :column="5" :size="size" border style="margin-top: 20px">
            <el-descriptions-item label="长(cm)" align="center">{{ productDetail.length ? productDetail.length : "--" }}
              cm
            </el-descriptions-item>
            <el-descriptions-item label="宽(cm)" align="center">
              {{ productDetail.width ? productDetail.width : "--" }} cm
            </el-descriptions-item>
            <el-descriptions-item label="高(cm)" align="center">
              {{ productDetail.height ? productDetail.height : "--" }} cm
            </el-descriptions-item>
            <el-descriptions-item label="体积(m³)" align="center">
              {{ formatTree(productDetail.volume) }} m³
            </el-descriptions-item>
            <el-descriptions-item label="重量(kg)" align="center">
              {{ formatTree(productDetail.weight) }} kg
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      <!-------------------- SKU信息 ----------------------->
      <div>
        <el-card>
          <template #header> SKU信息 </template>
          <el-table v-loading="loading" :data="productDetail.productSkuList">
            <el-table-column label="图片" align="center" show-overflow-tooltip>
              <template #default="scope">
                <image-preview :src="scope.row.skuImage" :width="80" :height="80" />
              </template>
            </el-table-column>
            <el-table-column label="规格编码" align="center" prop="skuCode" show-overflow-tooltip />
            <el-table-column label="规格值" align="center" show-overflow-tooltip>
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
            <el-table-column label="价格" header-align="center" align="left" show-overflow-tooltip>
              <template #default="scope">
                <div>
                  <Strong> 价格1: </Strong>
                  <span> {{ formatTwo(scope.row.skuPrice1) }} €</span>
                </div>
                <div>
                  <Strong> 价格2: </Strong>
                  <span> {{ formatTwo(scope.row.skuPrice2) }} €</span>
                </div>
                <div>
                  <Strong> 价格3: </Strong>
                  <span> {{ formatTwo(scope.row.skuPrice3) }} €</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="库存数量" align="center" prop="skuStock" show-overflow-tooltip />
            <el-table-column label="状态" align="center" prop="skuStatus" show-overflow-tooltip>
              <template #default="scope">
                <dict-tag :options="product_status" :value="scope.row.skuStatus" />
              </template>
            </el-table-column>
            <el-table-column label="最后修改" align="center" prop="updateBy" show-overflow-tooltip />
          </el-table>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分页查询页脚 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="Product">
import {
  listProduct,
  getProduct,
  delProduct,
  addProduct,
  updateProduct,
} from "@/api/product/product";
import { listCategory } from "@/api/product/category";
import { listUnit } from "@/api/product/unit";
import { listBrand } from "@/api/product/brand";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";
// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { product_cost_method, product_status } = proxy.useDict(
  "product_cost_method",
  "product_status"
);

const productList = ref([]);
const productSkuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryList = ref([]);
const categoryNameList = ref([]);
const unitList = ref([]);
const brandList = ref([]);
const baseUnit = "0";

// *************************************************************** 表格展示数据转换 ***************************************************************
/** 获取计量单位名称 */
const getUnitName = (unitId) => {
  const unit = unitList.value.find((item) => item.unitId === unitId);
  return unit ? unit.unitCode : "";
};
/** 保留2位小数 */
const formatTwo = (value) => {
  if (value) {
    return value.toFixed(2);
  } else {
    return 0;
  }
};
/** 保留3位小数 */
const formatTree = (value) => {
  if (value) {
    return value.toFixed(3);
  } else {
    return 0;
  }
};

/** 获取商品分类名称 */
const getCategoryName = (categoryId) => {
  const category = categoryNameList.value.find(
    (item) => item.categoryId === categoryId
  );
  return category ? category.categoryName : "";
};
/** 获取商品品牌名称 */
const getBrandName = (brandId) => {
  const brand = brandList.value.find((item) => item.brandId === brandId);
  return brand ? brand.brandName : "";
};
/**  skuValue 转化成表格数据 */
const getSkuValue = (skuValueList) => {
  // 将 skuValueList 转化成 [["型号","AA"] , ["尺寸","SS"]]
  const tableData = ref(Object.entries(skuValueList));
  return tableData.value;
};

/** 查询列表 请求参数 */
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productName: null,
    productStatus: null,
    categoryId: null,
    brandId: null,
    costMethod: null,
    tenantId: null,
  },
});
const { queryParams } = toRefs(data);

//*****************************************************************  控制按钮相关的操作  ************************************************
/** 查询商品列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProduct(queryParams.value).then((response) => {
    productList.value = response.rows;
    // json转化
    productList.value.forEach((item) => {
      item.skuSelected = JSON.parse(item.skuSelected) || [];
      item.productSkuList.forEach((item) => {
        item.skuValue = JSON.parse(item.skuValue) || [];
      });
    });
    console.log("************* 获取转化后的产品信息", productList.value);
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
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
  ids.value = selection.map((item) => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  // reset();
  if (unitList.length < 1) {
    // 提示：请添加计量单位，跳转到计量单位页
    console.log("提示：请添加计量单位，跳转到计量单位页");
  }
  router.push({ path: "/product/edit" });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _productId = row.productId || ids.value[0];
  console.log("修改的ID*******", _productId);
  router.push({ path: "/product/edit", query: { productId: _productId } });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _productIds = row.productId || ids.value;
  const codeList = getCodeListByIds(_productIds);
  console.log("codeList--------", codeList);
  proxy.$modal
    .confirm('是否确认删除商品编号为:\n' + codeList.join('、\n') + '\n的数据项？')
    .then(function () {
      return delProduct(_productIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}
/** 删除提示的 productCode 数组 */
function getCodeListByIds(ids) {
  // Step 1: 如果 ids 是 Proxy(Array)，先转换为标准数组
  // Proxy 对象也是类数组对象，所以可以用 Array.from 来处理
  let idList = Array.isArray(ids) ? ids : Array.from(ids);
  // Step 2: 如果 ids 是单个 id，将其转换为数组，方便统一处理
  if (typeof ids === 'string' || typeof ids === 'number') {
    idList = [ids];
  }
  // Step 3: 检查 productList.value 是否为有效数组
  if (!productList || !productList.value || !Array.isArray(productList.value)) {
    console.error('productList 是无效数组！');
    return [];
  }
  // Step 4: 将 productList 转换为一个 Map，使用 id 作为键，code 作为值
  const productMap = new Map();
  productList.value.forEach(product => {
    productMap.set(product.productId, product.productCode);
  });
  // Step 5: 根据 ids 查找并返回对应的 code 列表
  return idList.map(id => productMap.get(id) || null); 
}

/** 查看商品详情 */
const productDetail = ref({});
function lookDetails(row) {
  const _productId = row.productId || ids.value;
  if (_productId) {
    getProduct(_productId).then((response) => {
      console.log("商品详情", response.data);
      productDetail.value = response.data;
      // json转化
      productDetail.value.skuSelected =
        JSON.parse(productDetail.value.skuSelected) || [];
      productDetail.value.productSkuList.forEach((item) => {
        item.skuValue = JSON.parse(item.skuValue) || [];
      });
      open.value = true;
      title.value = "商品详情";
    });
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "product/product/export",
    {
      ...queryParams.value,
    },
    `product_${new Date().getTime()}.xlsx`
  );
}

//******************************************************************  页面加载时执行操作  ************************************************
/** 获取商品分类下拉框数据 */
function getCategoryList() {
  listCategory()
    .then((response) => {
      categoryList.value = proxy.handleTree(
        response.data,
        "categoryId",
        "parentId"
      );
      categoryNameList.value = response.data;
      console.log("categoryList:", categoryList.value);
    })
    .catch((error) => {
      console.error("获取分类列表时出错:", error);
    });
}
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit()
    .then((response) => {
      // 产品只赋值基础单位
      unitList.value = response.rows.filter((row) => row.unitType === baseUnit);
    })
    .catch((error) => {
      console.error("获取计量单位列表时出错:", error);
    });
}
/** 获取品牌下拉框数据 */
function getBrandList() {
  listBrand()
    .then((response) => {
      brandList.value = response.rows;
    })
    .catch((error) => {
      console.error("获取品牌列表时出错:", error);
    });
}

/** 监听路由，路由跳转后更新界面数据 */
watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList();
  }
);

getCategoryList(); // 获取商品分类数据
getUnitList(); // 获取计量单位数据
getBrandList(); // 获取品牌数据
getList(); // 获取商品列表
</script>

<style scoped lang="scss">
.compact-form-item {
  margin-bottom: 0;
  /* 根据需要调整其他样式 */
}
.spec-row {
  display: flex;
  align-items: center;
}

.el-form-item {
  margin-right: 10px;
  flex-shrink: 0;
  .el-input,
  .el-select,
  .el-tree-select {
    width: 150px;
  }
}
</style>
