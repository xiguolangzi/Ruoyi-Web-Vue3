<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" class="tab-container" type="border-card">
      <el-tab-pane label="退货处理" name="return" class="pane-container">
        <ReturnForm />
      </el-tab-pane>
      <el-tab-pane label="退货记录" name="history" class="pane-container">
        <ReturnHistory />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReturnForm from '@/components/sales/ReturnForm/index.vue'
import ReturnHistory from '@/components/sales/ReturnHistory/index.vue'

const activeTab = ref('return')
</script>

<style scoped lang="scss">
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许滚动 */

  .tab-container{
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    overflow-y: auto; /* 允许滚动 */

    .pane-container{
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  } 
}
</style>