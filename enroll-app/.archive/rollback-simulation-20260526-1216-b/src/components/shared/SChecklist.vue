<template>
  <view class="schecklist">
    <view
      v-for="(item, idx) in items"
      :key="idx"
      class="schecklist-item"
      @click="onItemClick(item, idx)"
    >
      <view class="schecklist-ico" :class="'schecklist-' + item.state">
        <text v-if="item.state === 'done'">&#10003;</text>
        <text v-else-if="item.state === 'cur'">&#8943;</text>
        <text v-else-if="item.state === 'err'">!</text>
        <text v-else>{{ idx + 1 }}</text>
      </view>
      <view class="schecklist-body">
        <text class="schecklist-title">{{ item.title }}</text>
        <text v-if="item.sub" class="schecklist-sub">{{ item.sub }}</text>
      </view>
      <text v-if="item.tag" class="schecklist-tag" :class="'schecklist-tag-' + (item.tagType || 'gy')">
        {{ item.tag }}
      </text>
      <text v-if="item.arrow" class="schecklist-arrow">&#8250;</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SChecklist',
  props: {
    items: { type: Array, default: () => [] }
  },
  emits: ['item-click'],
  methods: {
    onItemClick(item, idx) {
      this.$emit('item-click', { item, index: idx })
    }
  }
}
</script>

<style lang="scss" scoped>
.schecklist {
  display: flex;
  flex-direction: column;
}

.schecklist-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.schecklist-item:last-child { border-bottom: none; }
.schecklist-item > * + * { margin-left: 20rpx; }

.schecklist-ico {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
}
.schecklist-done { background: var(--ok); color: #fff; }
.schecklist-cur  { background: var(--brand); color: #fff; }
.schecklist-todo { background: var(--N200); color: var(--N400); }
.schecklist-err  { background: var(--er); color: #fff; }

.schecklist-body { flex: 1; min-width: 0; }
.schecklist-title {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N900);
  display: block;
}
.schecklist-sub {
  font-size: var(--fs-11);
  color: var(--N500);
  margin-top: 2rpx;
  display: block;
}

.schecklist-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 40rpx;
  font-size: var(--fs-11);
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}
.schecklist-tag-ok { color: var(--ok); background: var(--ok-bg); border-color: var(--ok-bd); }
.schecklist-tag-wa { color: #92400E; background: var(--wa-bg); border-color: var(--wa-bd); }
.schecklist-tag-er { color: var(--er); background: var(--er-bg); border-color: var(--er-bd); }
.schecklist-tag-in { color: var(--in); background: var(--in-bg); border-color: var(--in-bd); }
.schecklist-tag-gy { color: var(--N500); background: var(--N50); border-color: var(--N200); }

.schecklist-arrow {
  font-size: 28rpx;
  color: var(--N400);
  flex-shrink: 0;
}
</style>
