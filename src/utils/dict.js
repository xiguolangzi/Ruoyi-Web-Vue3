import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  const dictStore = useDictStore();

  args.forEach(dictType => {
    res.value[dictType] = dictStore.getDict(dictType) || [];

    if (!dictStore.getDict(dictType)) {
      getDicts(dictType).then(resp => {
        const dictData = resp.data.map(p => ({
          label: p.dictLabel,
          value: p.dictValue,
          elTagType: p.listClass,
          elTagClass: p.cssClass
        }));
        res.value[dictType] = dictData;
        dictStore.setDict(dictType, dictData);
      });
    }
  });
  return toRefs(res.value);
}

/**
 * 根据字典标签获取字典值
 */
export function useDictLabel(dictList, label) {
  console.log("--字典数据：", dictList);
  console.log("--字典标签：", label);
  let item = dictList.value.find(item => item.label === label);
  console.log("--字典值：", item);

  return item ? item.value : null;
}


/**
 * 根据字典值获取字典标签
 */
export function useDictLabelByValue(dictList, value) {
  const item = dictList.value.find(item => item.value === value);
  return item ? item.label : null;
}