import { reactive } from 'vue'

const state = reactive({})

export function getActiveKey(namespace, defaultKey) {
  if (!(namespace in state)) {
    state[namespace] = defaultKey
    console.log('[tabState] INIT', namespace, '=', defaultKey)
  }
  console.log('[tabState] GET', namespace, '=', state[namespace])
  return state[namespace]
}

export function setActiveKey(namespace, key) {
  console.log('[tabState] SET', namespace, '=', key)
  state[namespace] = key
}
