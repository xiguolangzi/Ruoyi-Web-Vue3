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
            <el-select-v2 v-model="scope.row.skuId" filterable :options="formattedSkuList"
              placeholder="请输入 SKU Code" style="width: 100%" @change="handleSkuChange(scope.row)" :fit-input-width="false"/>
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

const props = defineProps({
  giftScopeType: [String, Number],
  salesPromotionScopeGiftList: Array,
  formattedSkuList: Array,
  categoryList: Array,
  ScopeTypeEnum: Object,
  StatusEnum: Object
});

const isSkuScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.SKU);
const isCategoryScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.CATEGORY);
const isAllScopeGift = computed(() => props.giftScopeType == props.ScopeTypeEnum.ALL);

const emit = defineEmits(['handleSkuChange', 'removePromotionScopeGiftDetail', 'addPromotionScopeGiftDetail']);

const handleSkuChange = (row) => emit('handleSkuChange', row);
const removeGiftDetail = (index) => emit('removePromotionScopeGiftDetail', index);
const addGiftDetail = () => emit('addPromotionScopeGiftDetail');
</script>
