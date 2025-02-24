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