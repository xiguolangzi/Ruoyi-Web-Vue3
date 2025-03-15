<template>
  <el-image :src="realSrcList[realSrcList.length - 1]" fit="cover" :style="`width:${realWidth};height:${realHeight};`" />
</template>

<script setup>
import { isExternal } from "@/utils/validate";

const props = defineProps({
  src: {
    type: String,
    default: ""
  },
  width: {
    type: [Number, String],
    default: ""
  },
  height: {
    type: [Number, String],
    default: ""
  },
});

const realSrc = computed(() => {
  if (!props.src) {
    return;
  }
  let real_src = props.src.split(",")[0];
  if (isExternal(real_src)) {
    return real_src;
  }
  return import.meta.env.VITE_APP_BASE_API + real_src;
});

const realSrcList = computed(() => {
  if (!props.src) {
    return [];
  }
  let real_src_list = props.src.split(",");
  let srcList = [];
  real_src_list.forEach(item => {
    if (isExternal(item)) {
      return srcList.push(item);
    }
    return srcList.push(import.meta.env.VITE_APP_BASE_API + item);
  });
  return srcList;
});

const realWidth = computed(() =>
  typeof props.width == "string" ? props.width : `${props.width}px`
);

const realHeight = computed(() =>
  typeof props.height == "string" ? props.height : `${props.height}px`
);
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  background-color: #ebeef5;
  box-shadow: 0 0 5px 1px #ccc;
  margin: 0px !important;
  padding: 0px !important;
}
</style>
