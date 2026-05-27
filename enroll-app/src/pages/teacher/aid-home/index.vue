<template>
  <view class="page">
    <SNavBar title="助学金审核" showBack>
      <template #right>
        <text class="nav-right">初审</text>
      </template>
    </SNavBar>

    <STabs v-model="activeTab" :tabs="tabs" storage-key="teacher-aid-review" @change="selectTab" />

    <scroll-view scroll-y class="body">
      <SCard :padding="0" v-if="filteredList.length">
        <SListItem
          v-for="item in filteredList"
          :key="item.uid"
          :avatar="item.name.charAt(0)"
          :avatarBg="'var(--brand-t)'"
          showArrow
          @click="goReview(item)"
        >
          <view class="item-body">
            <view class="item-row">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-sid">{{ item.sid }}</text>
            </view>
            <view class="item-row">
              <text class="item-label">申请档位</text>
              <text class="item-amount">¥{{ item.amount }}</text>
              <text class="item-sep">|</text>
              <text class="item-type">{{ item.type }}</text>
            </view>
            <view class="item-row">
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="item-date">{{ item.date }}</text>
            </view>
          </view>
        </SListItem>
      </SCard>
      <SEmpty v-else icon="📋" text="当前状态暂无助学金申请" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SCard from '@/components/shared/SCard.vue'
import SListItem from '@/components/shared/SListItem.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildReviewTabs, filterReviewByTab, getLastBusinessChange, getReviewList, getReviewTabIndex } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'TeacherAidHome',
  components: { SNavBar, STabs, SCard, SListItem, SBadge, SEmpty },
  data() {
    return {
      activeTab: 0,
      list: [],
      lastSyncedChange: ''
    }
  },
  computed: {
    tabs() {
      return buildReviewTabs(this.list, 'teacher')
    },
    filteredList() {
      return filterReviewByTab(this.list, 'teacher', this.activeTab)
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'aids') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    this.refresh(true)
  },
  methods: {
    selectTab(index) {
      this.activeTab = Number(index) || 0
    },
    refresh(syncChangedTab = false) {
      this.list = getReviewList('aids')
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('aids')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      this.activeTab = getReviewTabIndex(item, 'teacher')
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/teacher/aid-home/index')
      uni.navigateTo({ url: '/pages/teacher/aid-review/index?uid=' + item.uid })
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-right { font-size: 22rpx; color: var(--brand); font-weight: 600; }
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding: 28rpx; box-sizing: border-box; }
.item-body { flex: 1; min-width: 0; }
.item-body > * + * { margin-top: 8rpx; }
.item-row { display: flex; align-items: center; }
.item-row > * + * { margin-left: 12rpx; }
.item-name { font-size: 28rpx; font-weight: 600; color: var(--N900); }
.item-sid { font-size: 24rpx; color: var(--N500); }
.item-label { font-size: 22rpx; color: var(--N500); }
.item-amount { font-size: 24rpx; font-weight: 600; color: var(--N900); }
.item-sep { font-size: 22rpx; color: var(--N200); }
.item-type { font-size: 22rpx; color: var(--N500); }
.item-date { font-size: 22rpx; color: var(--N400); }
.item-info { font-size: 22rpx; color: var(--in); }
</style>
