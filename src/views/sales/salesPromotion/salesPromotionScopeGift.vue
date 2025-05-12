<template>
  <el-card v-if="giftScopeType" shadow="hover">
    <!-- 添加 slot 钩子，让父组件能够传递 el-form-item 进来 -->
    <slot name="gift-scope-label"></slot>

    <el-divider content-position="left">
      <span>
        {{
          isSkuScopeGift ? "赠送范围 SKU" :
          isCategoryScopeGift ? "赠送范围 商品分类" :
          "赠送范围 全场所有商品"
        }}
      </span>
    </el-divider>

    <!-- 全场所有商品 -->
    <template v-if="isAllScopeGift">
      <p style="text-align: center; padding: 20px; font-weight: bold;">
        该赠品适用于所有商品，无需额外选择 SKU 或分类。
      </p>
    </template>

    <!-- SKU 绑定 -->
    <template v-if="isSkuScopeGift">
      <el-table :data="salesPromotionScopeGiftList" border style="width: 100%">
        <el-table-column label="SKU 条码" prop="skuId" align="center" min-width="120px">
          <template #default="scope">
            <div @click.stop="handleCellClick(scope.row)">
              <!-- 显示模式 - 失去焦点时显示SKU Code -->
              <span v-if="!scope.row.isEditing" style="color: blue;">
                {{ scope.row.productSkuVo?.skuCode || '请单击选择SKU' }}
              </span>
              
              <!-- 编辑模式 - 聚焦时显示SkuSelect组件 -->
              <SkuSelect 
                v-else
                ref="skuSelectRef" 
                @selectedData="(data) => handleSkuSelected(data, scope.row)"
                @blur="handleBlur(scope.row)"
                style="width: 100%"
                :teleported="true"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="SKU 名称" align="left" header-align="center" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.productSkuVo?.skuName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU 规格" align="left" header-align="center" show-overflow-tooltip>
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
        <el-table-column label="单价" prop="detailPrice" align="right" header-align="center" min-width="60px" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ formatTwo(scope.row.productSkuVo?.skuPrice) }} € </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="75" align="center">
          <template #default="scope">
            <el-button type="danger" size="small" plain @click="removeGiftDetail(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 分类绑定 -->
    <template v-if="isCategoryScopeGift">
      <el-table :data="salesPromotionScopeGiftList" border style="width: 100%">
        <el-table-column label="商品分类" prop="categoryId" align="center" min-width="120px">
          <template #default="scope">
            <el-tree-select v-model="scope.row.categoryId" :data="categoryList"
              :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
              value-key="categoryId" placeholder="请选择商品分类" style="width: 195px" clearable />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="75" align="center">
          <template #default="scope">
            <el-button type="danger" size="small" plain @click="removeGiftDetail(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 添加 SKU 或 商品分类 -->
    <el-button type="primary" plain @click="addGiftDetail"
      v-if="!isAllScopeGift && salesPromotionScopeGiftList.length < 10"
      style="margin-top: 10px;">
      {{ isSkuScopeGift ? "添加 SKU" : "添加 商品分类" }}
    </el-button>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';

const props = defineProps({
  giftScopeType: [String,Number],
  salesPromotionScopeGiftList: Array,
  categoryList: Array,
  ScopeTypeEnum: Object,
  StatusEnum: Object
});

// 添加编辑状态管理
const editingRow = ref(null);
const skuSelectRef = ref(null);

// 处理单元格点击事件
const handleCellClick = (row) => {
  // 设置当前行为编辑状态
  row.isEditing = true;
  editingRow.value = row;
  
  // 下一个tick聚焦输入框
  nextTick(() => {
    const selectRef = skuSelectRef.value;
    if (selectRef && selectRef.focus) {
      selectRef.focus();
    }
  });
};

// 处理失去焦点事件
const handleBlur = (row) => {
  row.isEditing = false;
  editingRow.value = null;
};

// 修改handleSkuSelected，添加自动失去焦点逻辑
const handleSkuSelected = (data, row) => {
  row.productSkuVo = data;
  // 选择后自动退出编辑模式
  handleBlur(row);
};

// 确保每行数据都有isEditing属性
onMounted(() => {
  props.salesPromotionScopeGiftList.forEach(row => {
    if (row.isEditing === undefined) {
      row.isEditing = false;
    }
  });
});

const isSkuScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.SKU);
const isCategoryScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.CATEGORY);
const isAllScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.ALL);

const emit = defineEmits(['removePromotionScopeGiftDetail', 'addPromotionScopeGiftDetail']);

const removeGiftDetail = (index) => emit('removePromotionScopeGiftDetail', index);
const addGiftDetail = () => emit('addPromotionScopeGiftDetail');
</script>
