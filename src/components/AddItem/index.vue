<template>
  <div>
    固定相
  </div>
</template>

<script setup>
import { ref } from "vue";


const itemDetail = ref({
  detailId: null,
  itemId: null,
  skuId: null,
  skuPrice: 0.00,
  quantity: 0,
})

const data = ref([])

</script>

<style lang="scss" scoped>

</style>