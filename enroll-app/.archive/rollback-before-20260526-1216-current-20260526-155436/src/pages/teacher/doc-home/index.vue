<template>
  <view class="page">
    <SNavBar title="资料审核" showBack>
      <template #right>
        <text class="nav-right-text">班主任初核</text>
      </template>
    </SNavBar>

    <STabs :tabs="tabs" :model-value="activeTab" storage-key="teacher-doc-review" @change="selectTab" />

    <view class="tab-content">
      <view
        class="student-card"
        v-for="item in filteredList"
        :key="item.uid"
      >
        <view class="card-row-between">
          <view class="card-left" @click="goDetail(item)">
            <view class="avatar">{{ item.name.charAt(0) }}</view>
            <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="meta">{{ item.id }} · 提交于 {{ item.submittedAt }}</text>
            </view>
          </view>
          <view class="review-entry" @click.stop="goReview(item)">
            <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            <text class="card-arrow">›</text>
          </view>
        </view>
        <view class="doc-tags" v-if="activeTab === 0">
          <SBadge v-for="(tag, ti) in item.tags" :key="ti" color="wa" customStyle="margin-right: 12rpx; margin-bottom: 8rpx;">{{ tag }}</SBadge>
        </view>
        <view class="reason" v-if="activeTab === 2 && item.reason">
          <text class="reason-text">{{ item.reason }}</text>
        </view>
      </view>
      <view v-if="filteredList.length === 0" class="empty-state">
        <text class="empty-text">{{ emptyText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { buildMaterialTabs, filterMaterialByTab, getLastBusinessChange, getMaterialTabIndex, getReviewList } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'TeacherDocHome',
  components: { SNavBar, STabs, SBadge },
  data() {
    return { activeTab: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return buildMaterialTabs(this.list)
    },
    filteredList() { return filterMaterialByTab(this.list, this.activeTab) },
    emptyText() {
      return ['暂无待审核资料', '暂无已通过记录', '暂无已退回记录'][this.activeTab] || '暂无资料'
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'documents') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  onShow() {
    this.refresh(true)
  },
  methods: {
    selectTab(index) {
      this.activeTab = Number(index) || 0
    },
    refresh(syncChangedTab = false) {
      this.list = getReviewList('documents')
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('documents')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      this.activeTab = getMaterialTabIndex(item)
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/teacher/doc-home/index')
      uni.navigateTo({ url: '/pages/teacher/doc-review/index?uid=' + item.uid })
    },
    goDetail(item) {
      rememberStaffBackTarget('/pages/teacher/doc-home/index')
      uni.navigateTo({ url: `/pages/teacher/student-detail/index?id=${item.studentId || ''}&sid=${item.sid || item.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 40rpx; }
.nav-right-text { font-size: var(--fs-13); color: var(--brand); font-weight: 600; }
.tab-content { padding: 28rpx 28rpx 0; }
.student-card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); padding: 28rpx; margin-bottom: 20rpx; }
.card-row-between { display: flex; align-items: center; justify-content: space-between; }
.card-left { display: flex; align-items: center; flex: 1; min-width: 0; }
.card-left > * + * { margin-left: 20rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info { flex: 1; min-width: 0; }
.name { font-size: var(--fs-15); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); margin-top: 6rpx; display: block; }
.review-entry { display: flex; align-items: center; margin-left: 16rpx; min-height: 64rpx; flex-shrink: 0; }
.review-entry > * + * { margin-left: 12rpx; }
.card-arrow { color: var(--N400); font-size: 32rpx; line-height: 1; }
.doc-tags { margin-top: 20rpx; display: flex; flex-wrap: wrap; }
.reason { margin-top: 20rpx; padding: 20rpx; background: var(--N50); border-radius: var(--r-8); }
.reason-text { font-size: var(--fs-12); color: var(--N700); }
.empty-state { padding: 72rpx 0; text-align: center; }
.empty-text { color: var(--N400); font-size: var(--fs-13); }
</style>
