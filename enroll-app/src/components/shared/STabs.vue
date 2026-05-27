<template>
  <view class="stabs-wrapper">
    <view class="stabs">
      <view
        v-for="(tab, idx) in tabs"
        :key="idx"
        class="stab"
        :class="{ active: idx === activeIndex }"
        hover-class="stab-pressed"
        :hover-stay-time="80"
        @tap="onSelect(idx)"
      >
        <text class="stab-label">{{ tab.label }}</text>
        <text v-if="tab.count !== undefined" class="stab-count">{{ tab.count }}</text>
      </view>
    </view>
  </view>
</template>

<script>
const STORAGE_PREFIX = 'enroll_status_tab_v1_'

export default {
  name: 'STabs',
  props: {
    tabs: { type: Array, default: () => [] },
    modelValue: { type: Number, default: 0 },
    storageKey: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    activeIndex() {
      const max = Math.max(this.tabs.length - 1, 0)
      const idx = Number(this.modelValue)
      return Number.isInteger(idx) && idx >= 0 ? Math.min(idx, max) : 0
    },
    persistenceKey() {
      if (this.storageKey) return `${STORAGE_PREFIX}${this.storageKey}`
      try {
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
        const page = pages[pages.length - 1]
        const route = page?.route || page?.$page?.fullPath || ''
        return route ? `${STORAGE_PREFIX}${route}` : ''
      } catch (e) {
        return ''
      }
    }
  },
  watch: {
    modelValue(value) {
      this.saveSelection(value)
    },
    tabs() {
      if (this.tabs.length && this.modelValue >= this.tabs.length) {
        this.onSelect(0)
      }
    }
  },
  mounted() {
    this.restoreSelection()
  },
  methods: {
    onSelect(idx) {
      if (idx < 0 || idx >= this.tabs.length) return
      this.saveSelection(idx)
      this.$emit('update:modelValue', idx)
      this.$emit('change', idx)
    },
    saveSelection(idx) {
      if (!this.persistenceKey || idx < 0) return
      try {
        uni.setStorageSync(this.persistenceKey, String(idx))
      } catch (e) { /* storage is optional */ }
    },
    restoreSelection() {
      if (!this.persistenceKey) return
      try {
        const stored = Number(uni.getStorageSync(this.persistenceKey))
        if (Number.isInteger(stored) && stored >= 0 && (!this.tabs.length || stored < this.tabs.length)) {
          this.$emit('update:modelValue', stored)
          this.$emit('change', stored)
          return
        }
        this.saveSelection(this.modelValue)
      } catch (e) { /* storage is optional */ }
    }
  }
}
</script>

<style lang="scss" scoped>
.stabs-wrapper {
  background: var(--white);
  border-bottom: 1px solid var(--N200);
  flex-shrink: 0;
}
.stabs {
  display: flex;
  width: 100%;
  background: var(--white);
  position: relative;
}
.stab {
  position: relative;
  flex: 1;
  min-width: 0;
  font-size: var(--fs-13);
  min-height: 80rpx;
  padding: 0 8rpx;
  background: transparent;
  color: var(--N800);
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-bottom: 6rpx solid transparent;
  transition: background-color .18s ease, border-bottom-color .18s ease;
}
.stab.active {
  color: var(--N800);
  background: transparent;
  font-weight: 500;
  border-bottom-color: var(--brand);
}
.stab-pressed { background: var(--N50); }
.stab.active.stab-pressed { background: var(--N50); }
.stab-label { color: inherit; font-size: inherit; font-weight: inherit; }
.stab-count {
  margin-left: 6rpx;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}
</style>
