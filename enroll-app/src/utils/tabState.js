import { reactive } from 'vue'

const state = reactive({})

export function getActiveKey(namespace, defaultKey) {
  if (!(namespace in state)) {
    state[namespace] = defaultKey
  }
  return state[namespace]
}

export function setActiveKey(namespace, key) {
  state[namespace] = key
}
