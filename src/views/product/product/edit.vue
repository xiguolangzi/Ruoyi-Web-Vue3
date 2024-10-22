<template>
  <div class="product_edit">
    <h3 style="margin-left: 20px">{{ title }}</h3>
    <el-tabs v-model="activeName" type="border-card" class="demo-tabs" style="margin: 0 20px"
      :before-leave="beforeLeave">
      <!------------------------------------------   基础信息部分   -------------------------------------------->
      <el-tab-pane label="基础信息" name="first">
        <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
          <el-card>
            <template #header>
              <span>必要信息</span>
            </template>
            <el-row gutter="20">
              <el-col span="8">
                <el-form-item label="商品分类:" prop="categoryId">
                  <el-tree-select v-model="form.categoryId" :data="categoryList" :props="{
                      value: 'categoryId',
                      label: 'categoryName',
                      children: 'children',
                    }" value-key="categoryId" placeholder="请选择商品分类" style="width: 195px" clearable />
                </el-form-item>
              </el-col>
              <el-col span="8">
                <el-form-item label="商品名称:" prop="productName">
                  <el-input v-model="form.productName" placeholder="请输入商品名称" />
                </el-form-item>
              </el-col>
              <el-col span="8">
                <el-form-item label="商品品牌:" prop="brandId">
                  <el-select v-model="form.brandId" placeholder="请选择商品品牌" style="width: 195px">
                    <el-option v-for="items in brandList" :key="items.brandId" :label="items.brandName"
                      :value="items.brandId" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row gutter="20">
              <el-col span="8">
                <el-form-item label="商品条码:" prop="productCode">
                  <el-input v-model="form.productCode" placeholder="请输入商品条码" />
                </el-form-item>
              </el-col>
              <el-col span="8">
                <el-form-item label="商品价格:" prop="productPrice">
                  <el-input v-model="form.productPrice" placeholder="请输入商品价格" type="number" />
                </el-form-item>
              </el-col>
              <el-col span="8">
                <el-form-item label="计量单位:" prop="unitId">
                  <el-select v-model="form.unitId" placeholder="请选择计量单位">
                    <el-option v-for="items in unitList" :key="items.unitId" :label="items.unitCode"
                      :value="items.unitId" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row gutter="80">
              <el-col span="12">
                <el-form-item label="商品状态:" prop="productStatus">
                  <el-radio-group v-model="form.productStatus">
                    <el-radio v-for="dict in product_status" :key="dict.value" :label="dict.value">{{ dict.label
                      }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col span="12">
                <el-form-item label="成本计算:" prop="costMethod">
                  <el-select v-model="form.costMethod" placeholder="请选择成本计算" style="width: 200px">
                    <el-option v-for="dict in product_cost_method" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="商品主图" prop="productImage">
              <image-upload v-model="form.productImage" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-card>
          <el-card>
            <template #header>
              <span>包装信息</span>
            </template>
            <el-row>
              <el-col span="4">
                <el-form-item label="长(cm):" prop="length" style="margin-right: 20px">
                  <el-input v-model="form.length" placeholder="请输入长(cm)" type="number" style="width: 125px" />
                </el-form-item>
              </el-col>
              <el-col span="4">
                <el-form-item label="宽(cm):" prop="width" style="margin-right: 20px">
                  <el-input v-model="form.width" placeholder="请输入宽(cm)" type="number" style="width: 125px" />
                </el-form-item>
              </el-col>
              <el-col span="4">
                <el-form-item label="高(cm):" prop="height" style="margin-right: 20px">
                  <el-input v-model="form.height" placeholder="请输入高(cm)" type="number" style="width: 125px" />
                </el-form-item>
              </el-col>
              <el-col span="6">
                <el-form-item label="体积(m3):" prop="volume" style="margin-right: 20px">
                  <el-input v-model="form.volume" placeholder="请输入体积(m3)" type="number" style="width: 150px" />
                </el-form-item>
              </el-col>
              <el-col span="6">
                <el-form-item label="重量(kg):" prop="weight" style="margin-right: 20px">
                  <el-input v-model="form.weight" placeholder="请输入重量(kg)" type="number" style="width: 150px" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </el-form>
        <div class="footer" style="margin: 20px; padding: 20px">
          <el-button type="primary" @click="goToSecond">下一步</el-button>
          <el-button type="info" @click="goBack">取 消</el-button>
        </div>
      </el-tab-pane>
      <!--------------------------------------------   SKU 部分  ---------------------------------------------->
      <el-tab-pane label="规格设置" name="second">
        <div class="product-spec-editor">
          <!---------------- 配置规格部分 ------------>
          <el-card>
            <template #header>
              <span>规格配置:</span>
              <el-tooltip content="修改时不允许更改之前的规格配置，只能新增规格配置！" placement="right">
                <el-icon color="#e74c3c"><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <div class="spec-selection">
              <el-table :data="specs" style="width: 100%">
                <el-table-column label="应用选择" width="80px" align="center">
                  <template #default="scope">
                    <el-checkbox v-model="scope.row.selected" :disabled="names.includes(scope.row.name)"></el-checkbox>
                  </template>
                </el-table-column>
                <el-table-column label="SKU规格名称" width="220px">
                  <template #default="scope">
                    <el-select v-model="scope.row.name" placeholder="请选择规格" :disabled="names.includes(scope.row.name)">
                      <el-option :label="item.skuName" :value="item.skuName" v-for="item in skuNameList"
                        :key="item.id"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="SKU规格 - 值">
                  <template #default="scope">
                    <div class="spec-values">
                      <el-input v-for="(value, index) in scope.row.values" :key="index"
                        v-model="scope.row.values[index]" placeholder="请输入规格的值" :disabled="exist(scope.row, index)">
                        <!----scope.$index 当前行数； index 在scope.row.vakues中的索引 可以用过 v-if="!exist(scope.row,index)" 控制删除初始化的规格值 -->
                        <template #append v-if="!exist(scope.row, index)">
                          <el-button @click="removeSpecValue(scope.$index, index)" icon="Minus"></el-button>
                        </template>
                      </el-input>
                      <el-button @click="addSpecValue(scope.$index)" type="primary" icon="Plus"
                        v-if="scope.row.values.length < 10"></el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="scope">
                    <el-button @click="removeSpec(scope.$index)" type="danger" size="small"
                      v-if="!names.includes(scope.row.name)">删除规格</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="add-spec">
                <el-button @click="addSpec" type="primary" v-if="specs.length < 2">+ 添加规格</el-button>
              </div>
            </div>
          </el-card>
          <!---------------- 规格明细部分 ------------>
          <el-card>
            <template #header>
              <div class="header-container">
                <span>规格明细：</span>
                <div class="button-group">
                  <el-button type="success" @click="syncSkuPrice1">所有价格1 同步 商品价格</el-button>
                  <el-button type="primary" @click="syncProductPriceMin1">商品价格取 价格1 中最小</el-button>
                  <el-button type="primary" @click="syncProductPriceMin2">商品价格取 价格2 中最小</el-button>
                  <el-button type="primary" @click="syncProductPriceMin3">商品价格取 价格3 中最小</el-button>
                </div>
              </div>
            </template>
            <div class="spec-combinations">
              <el-table :data="productSkuList" style="width: 100%">
                <el-table-column label="规格图片" prop="skuImage" header-align="center">
                  <template #default="scope">
                    <image-upload v-model="scope.row.skuImage" :isShowTip="false" :isImgSize="80" />
                  </template>
                </el-table-column>
                <el-table-column v-for="spec in selectedSpecs" :key="spec.name" :prop="`skuValue.${spec.name}`"
                  :label="spec.name" :width="calculateWidth(spec.name)"></el-table-column>
                <el-table-column label="规格编码" prop="skuCode">
                  <template #default="scope">
                    <el-input v-model="scope.row.skuCode"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="价格1" prop="skuPrice1">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.skuPrice1" :precision="2" :step="0.01"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="价格2" prop="skuPrice2">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.skuPrice2" :precision="2" :step="0.01"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="价格3" prop="skuPrice3">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.skuPrice3" :precision="2" :step="0.01"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="库存" prop="skuStock">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.skuStock" disabled>
                      <template #decrease-icon>
                        <el-icon>
                          <ArrowDown />
                        </el-icon>
                      </template>
                      <template #increase-icon>
                        <el-icon>
                          <ArrowUp />
                        </el-icon>
                      </template>
                    </el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="状态" prop="skuStatus">
                  <template #default="scope">
                    <el-switch v-model="scope.row.skuStatus" style="
                        --el-switch-on-color: #13ce66;
                        --el-switch-off-color: #ff4949;
                      " active-value="0" inactive-value="1" />
                    {{ scope.row.skuStatus === "0" ? "启售" : "停售" }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
        <div class="footer" style="margin: 20px; padding: 20px">
          <el-button type="success" @click="goToFirst"> 返回上一步 </el-button>
          <el-button type="primary" @click="submitHandler"> 提 交 </el-button>
          <el-button type="info" @click="goBack"> 取消 </el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
  
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { getProduct, addProduct, updateProduct } from "@/api/product/product";
import { listCategory } from "@/api/product/category";
import { listUnit } from "@/api/product/unit";
import { listBrand } from "@/api/product/brand";
import { listSkuName } from "@/api/product/skuName";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";

const router = useRouter();
const route = useRoute();
const categoryList = ref([]);
const unitList = ref([]);
const brandList = ref([]);
const skuNameList = ref([]);
// 默认选择计量单位
const baseUnit = "0";
// 标签菜单默认首页
const activeName = ref("first");
// sku状态改变

// ************************************************  基础资料部门 ******************************************************
const { proxy } = getCurrentInstance();
const { product_cost_method, product_status } = proxy.useDict(
  "product_cost_method",
  "product_status"
);

// 表单重置
const form = ref({
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
  costMethod: null,
  length: null,
  width: null,
  height: null,
  volume: null,
  weight: null,
  productSort: null,
  remark: null,
  skuSelected: null,
});

const rules = ref({
  productName: [
    {
      required: true,
      message: "商品名称不能为空",
      trigger: ["blur", "change"],
    },
  ],
  categoryId: [
    {
      required: true,
      message: "商品分类ID不能为空",
      trigger: ["blur", "change"],
    },
  ],
  productPrice: [
    {
      required: true,
      message: "商品价格不能为空",
      trigger: ["blur", "change"],
    },
  ],
  productCode: [
    {
      required: true,
      message: "商品编码不能为空",
      trigger: ["blur", "change"],
    },
  ],
  unitId: [
    {
      required: true,
      message: "商品单位不能为空",
      trigger: ["blur", "change"],
    },
  ],
});

// ************************************************  SKU部分 ******************************************************
// SKU数据列表
const specs = ref([{ name: "", values: [""], selected: false }]);
// SKU表单列表
const productSkuList = ref([]);
const newProductSkuList = ref([]);
// 修改时传递的初始 productSkuList
let initProductSkuList = [];
let initSelectedSpecs = [];
let names = [];

/** 构造一个只有单个 value 的新 spec */
const exist = (spec, index) => {
  // 直接提取单个 value
  const singleValue = spec.values[index]; 
  // 使用 `some` 查找是否存在匹配的 name 且 values 包含该 value
  let res = initSelectedSpecs.some(
    (s) => s.name === spec.name && s.values.includes(singleValue)
  );
  return res;
};

/** SKU列表 -> 过滤掉 空sku、空规格值 */ 
const filteredSpecs = computed(() => {
  return specs.value
    .filter((spec) => spec.name.trim() !== "")
    .map((spec) => ({
      ...spec,
      values: spec.values.filter((value) => value.trim() !== ""),
    }))
    .filter((spec) => spec.values.length > 0);
});

/** 已勾选的SKU组合列表 */ 
const selectedSpecs = computed(() =>
  filteredSpecs.value.filter((spec) => spec.selected)
);

/** 递归多种SKU组合 */ 
const generateCombinations = () => {
  const selected = selectedSpecs.value;
  if (selected.length === 0) {
    productSkuList.value = [];
    return;
  }
  // 递归方法
  const combine = (current, specs) => {
    if (specs.length === 0) {
      return [current];
    }
    const [first, ...rest] = specs;
    return first.values.flatMap((value) =>
      combine({ ...current, [first.name]: value }, rest)
    );
  };
  // spects 变化 生成新的 productSkuList
  newProductSkuList.value = combine({}, selected).map((skuValue) => ({
    skuValue,
    skuCode: "",
    skuImage: "",
    skuPrice1: "",
    skuPrice2: "",
    skuPrice3: "",
    skuStock: 0,
    skuStatus: "0",
    productId: form.value.productId,
    productCode: form.value.productCode,
    productName: form.value.productName,
  }));

  // 通过 productSkuList 与 newProductSkuList 进行对比，存在相同的skuValue 就替换 -> 进一步融合 newProductSkuList
  // 将 productSkuList 构建为一个 Map，使用 JSON.stringify(skuValue) 作为 key，便于快速查找
  const skuValueMap = new Map(
    productSkuList.value.map((item) => [JSON.stringify(item.skuValue), item])
  );
  // 基于 newProductSkuList 遍历并进行替换操作
  productSkuList.value = newProductSkuList.value.map((item) => {
    const skuValueStr = JSON.stringify(item.skuValue);
    // 如果在 productSkuList 中找到相同的 skuValue，则用 productSkuList 中的项替换
    if (skuValueMap.has(skuValueStr)) {
      return skuValueMap.get(skuValueStr);
    }
    // 否则保持 newProductSkuList 中的原始值
    return item;
  });
  console.log("&&&&&&&&&&&&&&&&&&&&&&", productSkuList.value);
};

/** 监听 配置规格变化 -> 更新 productSkuList */ 
watch(specs, generateCombinations, { deep: true });

/** 通过修改传递的productId 获取商品信息 */
const getInfoById = () => {
  // 获取修改传递的参数 productId
  const _productId = route.query.productId;

  if (_productId) {
    getProduct(_productId).then((response) => {
      form.value = response.data;
      // 获取初始数据
      initSelectedSpecs = JSON.parse(form.value.skuSelected) || [];
      // 控制删除规格的数组（去除没有sku的名称）
      names =
        initSelectedSpecs
          .map((spec) => spec.name)
          .filter((name) => name !== "" && name !== '""') || [];
      initProductSkuList = response.data.productSkuList;
      initProductSkuList.forEach((item) => {
        item.skuValue = JSON.parse(item.skuValue);
      });
      // 初始化 specs 和 productSkuList
      specs.value = cloneDeep(initSelectedSpecs);
      productSkuList.value = cloneDeep(initProductSkuList);
      
    });
  }
};

/** 同步价格 */
const syncSkuPrice1 = () => {
  productSkuList.value.forEach((item) => {
    item.skuPrice1 = form.value.productPrice;
  });
};

/** 商品价格取价格1中的最小值 */
const syncProductPriceMin1 = () => {
  form.value.productPrice = Math.min(...productSkuList.value.map((item) => item.skuPrice1));
};

/**  商品价格取价格2中的最小值 */
const syncProductPriceMin2 = () => {
  form.value.productPrice = Math.min(...productSkuList.value.map((item) => item.skuPrice2));
};

/**  商品价格取价格3中的最小值 */
const syncProductPriceMin3 = () => {
  form.value.productPrice = Math.min(...productSkuList.value.map((item) => item.skuPrice3));
};

// ****************************************************    新增/修改逻辑  ******************************************************
const submitHandler = async () => {
  try {
    // 1. 通用验证逻辑
    if (productSkuList.value.length === 0) {
      initData();
      return;
    }

    // 2. SKU 数据验证
    const validateSkuData = (skuList) => {
      for (const item of skuList) {
        if (!item.skuCode) {
          ElMessage.error("请完善 规格编码 信息！");
          return false;
        }
        if (!item.skuPrice1) {
          ElMessage.error("请完善 价格1 信息！");
          return false;
        }
      }
      return true;
    };

    if (!validateSkuData(productSkuList.value)) {
      return;
    }

    // 3. 准备提交数据
    const prepareSubmitData = () => {
      // 深拷贝防止直接修改原始数据
      const processedSkuList = cloneDeep(productSkuList.value);

      // 只在未处理过的情况下进行 JSON.stringify
      processedSkuList.forEach(item => {
        if (typeof item.skuValue === 'object') {
          item.skuValue = JSON.stringify(item.skuValue);
        }
        // 同步禁用状态
        if (form.value.productStatus === '1') {
          item.skuStatus = '1';
        }
      });

      return {
        ...form.value,
        skuSelected: JSON.stringify(selectedSpecs.value),
        productSkuList: processedSkuList
      };
    };

    // 4. 处理修改或新增逻辑
    const submitData = prepareSubmitData();

    if (form.value.productId != null) {
      // 修改逻辑
      const initSkuValueMap = new Map(
        initProductSkuList.map(item => [
          typeof item.skuValue === 'string' ? item.skuValue : JSON.stringify(item.skuValue),
          item.skuId
        ])
      );

      // 更新 skuId
      submitData.productSkuList = submitData.productSkuList.map(item => ({
        ...item,
        skuId: initSkuValueMap.get(item.skuValue) || item.skuId
      }));

      await updateProduct(submitData);
      proxy.$modal.msgSuccess("产品sku 修改成功");
    } else {
      // 新增逻辑
      await addProduct(submitData);
      proxy.$modal.msgSuccess("产品sku 新增成功");
    }

    goBack();
  } catch (error) {
    proxy.$modal.msgError(`产品sku 操作失败: ${error.message}`);
  }
};

// --------------------------------------  处理没有sku信息的 新增修改 ------------------------------------------------
const initData = async () => {
  try {
    // 初始化 form
    form.value.skuSelected = JSON.stringify([
      { name: "", values: [""], selected: false },
    ]);
    // 初始化 skuList
    productSkuList.value = [
      {
        skuId: null,
        skuValue: { skuName: "skuValue" },
        skuCode: form.value.productCode,
        skuImage: form.value.productImage,
        skuPrice1: form.value.productPrice,
        skuPrice2: null,
        skuPrice3: null,
        skuStock: null,
        skuStatus: form.value.productStatus,
        productId: form.value.productId,
        productCode: form.value.productCode,
        productName: form.value.productName,
      },
    ];
    // 如果productId不为空，则同步skuId
    if (form.value.productId != null) {
      productSkuList.value[0].skuId = initProductSkuList[0].skuId;
    }
    // 新增默认数据
    productSkuList.value.forEach((item) => {
      item.skuValue = JSON.stringify(item.skuValue);
    });
    form.value.productSkuList = productSkuList.value;
    console.log("**** 无SKU 的新增 *******", form.value);
    // 如果productId为空，则新增数据
    if (form.value.productId == null) {
      await addProduct(form.value);
      proxy.$modal.msgSuccess("产品 新增成功！");
      goBack();
      return;
    } else {
      await updateProduct(form.value);
      proxy.$modal.msgSuccess("产品 修改成功！");
      goBack();
      return;
    }
  } catch (error) {
    proxy.$modal.msgError(`产品 操作失败: ${error.message}`);
  }
};

// ****************************************************  SKU 布局样式处理 ******************************************************
//增加规格
const addSpec = () => {
  specs.value.push({ name: "", values: [""], selected: true });
};
// 删除规格
const removeSpec = (index) => {
  specs.value.splice(index, 1);
};
// 增加规格值
const addSpecValue = (specIndex) => {
  specs.value[specIndex].values.push("");
};
// 减少规格值
const removeSpecValue = (specIndex, valueIndex) => {
  specs.value[specIndex].values.splice(valueIndex, 1);
};
// 表格自动调节宽度
const calculateWidth = (specName) => {
  // 这里的逻辑可以根据需要调整
  return `${Math.max(specName.length * 15, 100)}px`;
};
// 页面跳转
const goToFirst = () => {
  activeName.value = "first";
};
const goToSecond = () => {
  activeName.value = "second";
};
const goBack = () => {
  router.push({
    path: "/productManagement/product",
  });
};
// taps 界面切换之前的校验 newValue当前标签名、oldValue将要前往的标签名
const beforeLeave = async (oldValue, newValue) => {
  // 如果是从第一个标签切换到第二个标签
  if (newValue === "first" && oldValue === "second") {
    try {
      // 验证表单
      await proxy.$refs["productRef"].validate();
      console.log("验证通过");
      // 验证通过，允许切换
      return true;
    } catch (error) {
      // 验证失败，阻止切换并显示错误消息
      ElMessage.error("请先完成必填项");
      console.log("验证不通过");
      // 从新赋值，解决 goToSecond() 重复调用的BUG
      activeName.value = "first";
      return false;
    }
  } else {
    // 其他情况下允许自由切换
    return true;
  }
};

// ****************************************************  基础数据获取 ******************************************************
/** 获取商品分类下拉框数据 */
function getCategoryList() {
  listCategory()
    .then((response) => {
      categoryList.value = proxy.handleTree(
        response.data,
        "categoryId",
        "parentId"
      );
      console.log("categoryList:", categoryList.value);
    })
    .catch((error) => {
      console.error("获取分类列表时出错:", error);
    });
}
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit({})
    .then((response) => {
      // 产品只赋值基础单位
      unitList.value = response.rows.filter((row) => row.unitType === baseUnit);
      if (unitList.value.length > 0) {
        form.value.unitId = unitList.value[0].unitId;
        form.value.costMethod = product_cost_method.value[0].value;
      } else {
        console.log("提示：请维护计量单位！！");
      }
    })
    .catch((error) => {
      console.error("获取计量单位列表时出错:", error);
    });
}
/** 获取品牌下拉框数据 */
function getBrandList() {
  listBrand({})
    .then((response) => {
      brandList.value = response.rows;
    })
    .catch((error) => {
      console.error("获取品牌列表时出错:", error);
    });
}
/** 获取sku名称下拉框数据 */
function getSkuNameList() {
  listSkuName({})
    .then((response) => {
      skuNameList.value = response.rows;
    })
    .catch((error) => {
      console.error("获取sku名称列表时出错:", error);
    });
}

getCategoryList();
getUnitList();
getBrandList();
getSkuNameList();
getInfoById(); // 获取修改传递的ID 然后继续进行初始化数据
// 控制标题
const title = computed(() => {
  return form.value.productId != null ? "修改商品 ：" : "新增商品 ：";
});
</script>
  
<style scoped lang="scss">
.spec-selection,
.spec-combinations {
  margin-bottom: 20px;
}
.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.spec-values .el-input {
  width: 150px;
}
.add-spec {
  margin-top: 10px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.button-group {
  display: flex;
  gap: 8px;
  /* 按钮之间的间距 */
}
</style>