<template>
  <view class="page">
    <SNavBar title="换宿审核" :showBack="true" />
    <STabs v-model="activeTab" :tabs="tabs" />
    <scroll-view scroll-y class="body">
      <view
        class="review-card"
        v-for="item in filteredList"
        :key="item.uid"
        @click="goReview(item)"
      >
        <view class="avatar">{{ item.avatar }}</view>
        <view class="info">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
          </view>
          <text class="meta">{{ item.id }} · {{ item.className }}</text>
          <text class="desc">{{ item.oldDorm }} → {{ item.targetDorm }}</text>
          <text class="time">申请时间：{{ item.applyTime }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <SEmpty v-if="filteredList.length === 0" text="暂无换宿申请" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildDormReviewTabs, filterDormReviewByTab, getDormReviewList } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'TeacherRoomChange',
  components: { SNavBar, STabs, SBadge, SEmpty },
  data() {
    return { activeTab: 0, list: [] }
  },
  computed: {
    tabs() {
      return buildDormReviewTabs(this.list)
    },
    filteredList() {
      return filterDormReviewByTab(this.list, this.activeTab)
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'roomChanges') this.refresh()
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    await this.refresh()
  },
  methods: {
    refresh() {
      this.list = getDormReviewList('roomChanges')
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/teacher/room-change/index')
      uni.navigateTo({ url: `/pages/teacher/room-change-review/index?uid=${item.uid}&apiId=${item.applicationId || item.uid}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding: 28rpx; box-sizing: border-box; }
.review-card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  padding: 28rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.review-card:active { transform: scale(.995); background: var(--N50); }
.review-card > * + * { margin-left: 20rpx; }
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  background: var(--brand-t);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-15);
  font-weight: 700;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; justify-content: space-between; }
.name { font-size: var(--fs-15); font-weight: 700; color: var(--N900); }
.meta,
.desc,
.time { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desc { color: var(--N700); font-weight: 600; }
.arrow { color: var(--N400); font-size: 32rpx; flex-shrink: 0; }
</style>
