<template>
  <view class="page">
    <SNavBar title="换宿审核" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <StatusTabs tabGroup="teacherRoomChange" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view
        class="review-card"
        v-for="item in filteredList"
        :key="filterVersion + '-' + item.uid"
        @click="goReview(item)"
      >
        <view class="avatar">{{ item.avatar }}</view>
        <view class="info">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
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
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildDormReviewTabs, filterDormReviewByTab, getDormReviewList, getLastBusinessChange } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const DORM_KEY_MAP = ['pending', 'approved', 'rejected']

export default {
  name: 'TeacherRoomChange',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return buildDormReviewTabs(this.list).map((tab, i) => ({
        ...tab,
        key: DORM_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = DORM_KEY_MAP.indexOf(this.activeTab)
      return filterDormReviewByTab(this.list, idx >= 0 ? idx : 0)
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'roomChanges') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    this.filterVersion++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    this.refresh(true)
    this.activeTab = getActiveKey('teacherRoomChange', 'pending')
  },
  methods: {
    onTabClick(key) {
      console.log('[room-change] onTabClick key=', key)
      this.activeTab = key
      setActiveKey('teacherRoomChange', key)
    },
    refresh(syncChangedTab = false) {
      this.list = getDormReviewList('roomChanges')
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('roomChanges')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      const index = item.status === 'approved' ? 1 : item.status === 'rejected' ? 2 : 0
      setActiveKey('teacherRoomChange', DORM_KEY_MAP[index] || 'pending')
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
