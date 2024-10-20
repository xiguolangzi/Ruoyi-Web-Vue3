<template>
  <el-tabs
  v-model="activeName"
  type="border-card"
  class="demo-tabs"
  style="margin: 20px;"
  :before-leave="beforeLeave"
  >
    <el-tab-pane label="基础信息" name="first" >
      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
        <el-card>
          <template #header>
            <span>必要信息</span>
          </template>
          
          <el-row gutter="20">
            <el-col span="8">
              <el-form-item label="商品分类:" prop="categoryId">
                <el-tree-select
                v-model="form.categoryId"
                :data="categoryList"
                :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"          
                value-key="categoryId"
                placeholder="请选择商品分类"
                style="width: 195px;"
                clearable
                />
              </el-form-item>
            </el-col>
            <el-col span="8">
              <el-form-item label="商品名称:" prop="productName" >
                <el-input v-model="form.productName" placeholder="请输入商品名称" />
              </el-form-item>
            </el-col>
            <el-col span="8">
            <el-form-item label="商品品牌:" prop="brandId">
              <el-select v-model="form.brandId" placeholder="请选择商品品牌" style="width: 195px">
              <el-option
                v-for="items in brandList"
                :key="items.brandId"
                :label="items.brandName"
                :value="items.brandId"
              />
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
                <el-select v-model="form.unitId" placeholder="请选择计量单位" >
                <el-option
                  v-for="items in unitList"
                  :key="items.unitId"
                  :label="items.unitCode"
                  :value="items.unitId"
                />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row gutter="80">
            <el-col span="12">
            <el-form-item label="商品状态:" prop="productStatus">
              <el-radio-group v-model="form.productStatus">
              <el-radio
                v-for="dict in product_status"
                :key="dict.value"
                :label="dict.value"
              >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            </el-col>
            <el-col span="12">
            <el-form-item label="成本计算:" prop="costMethod">
              <el-select v-model="form.costMethod" placeholder="请选择成本计算" style="width: 200px;">
              <el-option
                v-for="dict in product_cost_method"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
              </el-select>
            </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="商品主图" prop="productImage">
            <image-upload v-model="form.productImage"/>
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
              <el-form-item label="长(cm):" prop="length" style=" margin-right: 20px;">
                <el-input v-model="form.length" placeholder="请输入长(cm)" type="number" style="width: 125px;" />
              </el-form-item>
            </el-col>
            <el-col span="4">
              <el-form-item label="宽(cm):" prop="width"  style=" margin-right: 20px; ">
                <el-input v-model="form.width" placeholder="请输入宽(cm)"  type="number" style="width: 125px;" />
              </el-form-item>
            </el-col>
            <el-col span="4">
              <el-form-item label="高(cm):" prop="height"  style=" margin-right: 20px; ">
                <el-input v-model="form.height" placeholder="请输入高(cm)" type="number" style="width: 125px;" />
              </el-form-item>
            </el-col>
            <el-col span="6">
              <el-form-item label="体积(m3):" prop="volume"  style=" margin-right: 20px; ">
                <el-input v-model="form.volume" placeholder="请输入体积(m3)" type="number" style="width: 150px;" />
              </el-form-item>
            </el-col>
            <el-col span="6">
              <el-form-item label="重量(kg):" prop="weight"  style=" margin-right: 20px; ">
                <el-input v-model="form.weight" placeholder="请输入重量(kg)" type="number" style="width: 150px;" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>
      <div class="footer" style="margin: 20px; padding: 20px;">
          <el-button type="primary" @click="goToSecond">下一步</el-button>
          <el-button type="info" @click="goBack">取 消</el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="规格设置" name="second" >
      <div class="product-spec-editor">
        <el-card>
            <!-- 规格选择部分 -->
            <template #header>
              <span>规格配置:</span>
            </template>
            <div class="spec-selection">
                <el-table :data="specs" style="width: 100%">
                  <el-table-column label="应用选择" width="80px" align="center">
                    <template #default="scope">
                      <el-checkbox v-model="scope.row.selected"></el-checkbox>
                    </template>
                  </el-table-column>
                  <el-table-column label="SKU规格名称" width="220px" >
                    <template #default="scope">
                      <el-select v-model="scope.row.name" placeholder="请选择">
                          <el-option :label="item.skuName" :value="item.skuName" v-for="item in skuNameList" :key="item.id"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="SKU规格 - 值" >
                    <template #default="scope">
                      <div class="spec-values">
                        <el-input
                        v-for="(value, index) in scope.row.values"
                        :key="index"
                        v-model="scope.row.values[index]"
                        placeholder="规格值"
                        >
                          <template #append>
                            <el-button @click="removeSpecValue(scope.$index, index)" icon="Minus"></el-button>
                          </template>
                        </el-input>
                        <el-button @click="addSpecValue(scope.$index)" type="primary" icon="Plus" v-if="scope.row.values.length<10"></el-button>
                      </div>
                    </template>
                  </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                    <template #default="scope">
                    <el-button @click="removeSpec(scope.$index)" type="danger" size="small">删除规格</el-button>
                    </template>
                </el-table-column>
                </el-table>
                <div class="add-spec">
                <el-button @click="addSpec" type="primary" v-if="specs.length<2">+ 添加规格</el-button>
                </div>
            </div>
        </el-card>
        <el-card>
            <!-- 规格组合表格 -->
            <template #header>
                <span>规格明细：</span>
              </template>
            <div class="spec-combinations">
                <el-table :data="productSkuList" style="width: 100%" >
                    <el-table-column label="规格图片" prop="skuImage" width="100px">
                        <template #default="scope">
                            <le-image :src="scope.row.skuImage"></le-image>
                        </template>
                    </el-table-column>
                    <el-table-column 
                    v-for="spec in selectedSpecs" 
                    :key="spec.name" 
                    :prop="`skuValue.${spec.name}`" 
                    :label="spec.name"
                    :width="calculateWidth(spec.name)"
                    ></el-table-column>
                    <el-table-column label="规格编码" prop="skuCode">
                        <template #default="scope">
                            <el-input v-model="scope.row.skuCode"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="价格1" prop="skuPrice1">
                        <template #default="scope">
                            <el-input v-model.number="scope.row.skuPrice1" type="number"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="价格2" prop="skuPrice2">
                        <template #default="scope">
                            <el-input v-model.number="scope.row.skuPrice2" type="number"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="价格3" prop="skuPrice3">
                        <template #default="scope">
                            <el-input v-model.number="scope.row.skuPrice3" type="number"></el-input>
                        </template>
                    </el-table-column>
                    
                </el-table>
            </div>
        </el-card>  
      </div>
      <div class="footer" style="margin: 20px; padding: 20px;">
          <el-button type="success" @click="goToFirst"> 返回上一步 </el-button>
          <el-button type="primary" @click="submitHandler"> 提 交 </el-button>
          <el-button type="info" @click="goBack"> 取消 </el-button>
      </div>
    </el-tab-pane>
  </el-tabs> 
</template>
  
<script setup>
  import { ref, computed, watch } from 'vue'
  import { getProduct, addProduct, updateProduct } from "@/api/product/product";
  import { listCategory } from "@/api/product/category";
  import { listUnit } from "@/api/product/unit";
  import { listBrand } from "@/api/product/brand";
  import { listSkuName } from '@/api/product/skuName';
  import { useRouter,useRoute } from "vue-router";
  import {ElMessage} from 'element-plus'

  const router = useRouter();
  const route = useRoute();
  const categoryList = ref([]);
  const unitList = ref([]);
  const brandList = ref([]);
  const skuNameList = ref([]);
  // 默认选择计量单位
  const baseUnit = "0"
  // 标签菜单默认首页
  const activeName = ref('first')
  const getInfoById = () => {
    // 获取修改传递的参数 productId
    const _productId = route.query.productId;

    if (_productId) {
      getProduct(_productId).then(response => {
        form.value = response.data;
        specs.value = JSON.parse(form.value.skuSelected);
        productSkuList.value = response.data.productSkuList;
        productSkuList.value.forEach(item => {
          item.skuValue = JSON.parse(item.skuValue)
        })
      })
    }
  }


  // ************************************************  基础资料部门 ******************************************************
  const { proxy } = getCurrentInstance();
  const { product_cost_method, product_status } = proxy.useDict('product_cost_method', 'product_status');

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
  })

  const rules =  ref({
      productName: [
        { required: true, message: "商品名称不能为空", trigger: ['blur','change'] }
      ],
      categoryId: [
        { required: true, message: "商品分类ID不能为空", trigger: ['blur','change'] }
      ],
      productPrice: [
        { required: true, message: "商品价格不能为空", trigger: ['blur','change'] }
      ],
      productCode: [
        { required: true, message: "商品编码不能为空", trigger: ['blur','change'] }
      ],
      unitId: [
        { required: true, message: "商品单位不能为空", trigger: ['blur','change']}
      ]
  })
  
    // ************************************************  SKU部分 ******************************************************
  // SKU数据列表
  const specs = ref([
    { name: '', values: ['', ], selected: false },
  ])
  // SKU表单列表
  const productSkuList = ref([]);
  
  // SKU列表 -> 过滤掉 空sku、空规格值
  const filteredSpecs = computed(() => {
    return specs.value
        .filter(spec => spec.name.trim() !== '')
        .map(spec => ({
        ...spec,
        values: spec.values.filter(value => value.trim() !== '')
        }))
        .filter(spec => spec.values.length > 0)
  })
  
  // 已勾选的SKU组合列表
  const selectedSpecs = computed(() => filteredSpecs.value.filter(spec => spec.selected))

  // 递归多种SKU组合
  const generateCombinations = () => {
    const selected = selectedSpecs.value
    if (selected.length === 0) {
      productSkuList.value = [];
      return
    }
    // 递归方法
    const combine = (current, specs) => {
      if (specs.length === 0) {
        return [current]
      }
      const [first, ...rest] = specs
      return first.values.flatMap(value => combine({ ...current, [first.name]: value }, rest))
    }
    // SKU组合列表 赋新属性
    productSkuList.value = combine({}, selected).map(skuValue => ({
      skuValue,
      skuCode: '',
      skuImage: '',
      skuPrice1: '',
      skuPrice2: '',
      skuPrice3: '',
    }))
    
    console.log('********************************22',specs.value)
   console.log('################################22',productSkuList.value)
  }
  // 监听 配置规格变化 -> 更新 productSkuList
  //watch(specs, generateCombinations, { deep: true })
  
  // ****************************************************    新增/修改逻辑  ******************************************************
  const submitHandler = async () => {
    try {
      if (form.value.productId != null) {
        // 修改逻辑
        if (productSkuList.value.length === 0) {
          initData();
        } 
        // sku校验
        let isValid = true; // 标志变量
        for (const item of productSkuList.value) {
          if (item.skuCode == '') {
            ElMessage.error('请完善 规格编码 信息！');
            isValid = false; // 校验失败
            break; // 结束循环
          }
          if (item.skuPrice1 == '') {
            ElMessage.error('请完善 价格1 信息！');
            isValid = false; // 校验失败
            break; // 结束循环
          }
        }

        if (!isValid) {
          return; // 如果校验不通过，退出函数
        }
        form.value.skuSelected = JSON.stringify(selectedSpecs.value);
        productSkuList.value.forEach(item => {
          item.skuValue = JSON.stringify(item.skuValue);
        })
        form.value.productSkuList = productSkuList.value;
        console.log('提交的数据********',form.value)
        await updateProduct(form.value);
        proxy.$modal.msgSuccess("修改成功");
        
        
      } else {
        // 新增逻辑
        if (productSkuList.value.length === 0) {
          initData();
        } 
        // sku校验
        let isValid = true; // 标志变量
        for (const item of productSkuList.value) {
          if (item.skuCode == '') {
            ElMessage.error('请完善 规格编码 信息！');
            isValid = false; // 校验失败
            break; // 结束循环
          }
          if (item.skuPrice1 == '') {
            ElMessage.error('请完善 价格1 信息！');
            isValid = false; // 校验失败
            break; // 结束循环
          }
        }

        if (!isValid) {
          return; // 如果校验不通过，退出函数
        }
        form.value.skuSelected = JSON.stringify(selectedSpecs.value);
        productSkuList.value.forEach(item => {
          item.skuValue = JSON.stringify(item.skuValue);
        })
        form.value.productSkuList = productSkuList.value;
        console.log('提交的数据********',form.value)
        await addProduct(form.value);
        proxy.$modal.msgSuccess("新增成功");
      }
      goBack()
    } catch (error) {
      proxy.$modal.msgError(`操作失败: ${error.message}`);
    }
  };

  const initData = () => {
    // 初始化 skuList
    productSkuList.value = [{
      skuId: null,
      skuValue: [{'skuName':'skuValue'}],
      skuCode: form.value.productCode,
      skuImage: form.value.productImage,
      skuPrice1: form.value.productPrice,
      skuPrice2: null,
      skuPrice3: null,
      skuStock: null,
    }]
  }
  
  // ****************************************************  SKU 布局样式处理 ******************************************************
  //增加规格
  const addSpec = () => {
    specs.value.push({ name: '', values: [''], selected: true })
  }
  // 删除规格
  const removeSpec = (index) => {
    specs.value.splice(index, 1)
  }
  // 增加规格值
  const addSpecValue = (specIndex) => {
    specs.value[specIndex].values.push('')
  }
  // 减少规格值
  const removeSpecValue = (specIndex, valueIndex) => {
    specs.value[specIndex].values.splice(valueIndex, 1)
  }
  // 表格自动调节宽度
  const calculateWidth = (specName) => {
    // 这里的逻辑可以根据需要调整
    return `${Math.max(specName.length * 15, 100)}px`;
  }
  // 页面跳转
  const goToFirst = () => {
    activeName.value="first"
  }
  const goToSecond = () => {
    activeName.value="second"
  }
  const goBack = () => {
    router.push("/productManagement/product")
  }
  // taps 界面切换之前的校验 newValue当前标签名、oldValue将要前往的标签名
  const beforeLeave  = async (oldValue, newValue) => {
    // 如果是从第一个标签切换到第二个标签 
    if (newValue === 'first' && oldValue === 'second') {
      try {
        // 验证表单
        await proxy.$refs['productRef'].validate()
        console.log("验证通过")
        // 验证通过，允许切换
        return true
      } catch (error) {
        // 验证失败，阻止切换并显示错误消息
        ElMessage.error('请先完成必填项')
        console.log("验证不通过")
        // 从新赋值，解决 goToSecond() 重复调用的BUG
        activeName.value="first"
        return false
      }
    } else {
      // 其他情况下允许自由切换
      return true
    }
  }
  
  // ****************************************************  基础数据获取 ******************************************************

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
      if(unitList.value.length > 0){
        form.value.unitId =  unitList.value[0].unitId
        form.value.costMethod = product_cost_method.value[0].value
      } else {
        console.log("提示：请维护计量单位！！")
      }
      
      
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
  /** 获取sku名称下拉框数据 */
  function getSkuNameList() {
    listSkuName({}).then(response => {
      skuNameList.value = response.rows;
    }).catch(error => {
      console.error("获取sku名称列表时出错:", error);
    });
  }

  getCategoryList();
  getUnitList();
  getBrandList();
  getSkuNameList();
  getInfoById();
</script>
  
<style scoped lang="scss">
  .spec-selection, .spec-combinations {
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
  

</style>