<template>
  <view class="upload-grid">
    <view
      v-for="(file, idx) in files"
      :key="idx"
      class="ug-item"
      :class="{ 'ug-done': file.url }"
    >
      <image v-if="file.url" :src="file.url" mode="aspectFill" class="ug-image" />
      <!-- §6.27 已上传标记 -->
      <view class="ug-ok" v-if="file.url">
        <text>✓</text>
      </view>
      <view class="ug-remove" v-if="file.url && removable" @click="onRemove(idx)">
        <text>✕</text>
      </view>
      <view class="ug-progress" v-if="file.progress > 0 && file.progress < 100">
        <text>{{ file.progress }}%</text>
      </view>
    </view>
    <view class="ug-item ug-add" v-if="files.length < maxCount" @click="onAdd">
      <text class="ug-add-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SUploadGrid',
  props: {
    files: { type: Array, default: () => [] },
    maxCount: { type: Number, default: 9 },
    removable: { type: Boolean, default: true }
  },
  emits: ['add', 'remove'],
  methods: {
    onAdd() { this.$emit('add') },
    onRemove(idx) { this.$emit('remove', idx) }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.27 素材缩略图网格 ── */
.upload-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -8rpx;
  > view { margin: 8rpx; }
}

.ug-item {
  width: 144rpx;
  height: 144rpx;
  border-radius: var(--r-8);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--N200);
  background: var(--N50);
}

.ug-image {
  width: 100%;
  height: 100%;
}

/* §6.27 已上传标记 14×14px */
.ug-ok {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: var(--r-full);
  background: var(--ok);
  color: var(--white);
  font-size: var(--fs-9);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ug-remove {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--r-full);
  background: rgba(0,0,0,.5);
  color: var(--white);
  font-size: var(--fs-10);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ug-progress {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0,0,0,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: var(--fs-12);
}

.ug-add {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--N200);
  background: var(--N25);
}
.ug-add-icon {
  font-size: 64rpx;
  color: var(--N400);
  line-height: 1;
}
</style>
