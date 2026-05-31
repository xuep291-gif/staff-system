<template>
  <view class="page">
    <SNavBar title="助学金审核" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <StatusTabs tabGroup="teacherAidHome" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }}</text>
                <text class="li-amount">申请金额：¥{{ item.amount }} · {{ item.type }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无补助申请" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { scholarshipApi } from '@/common/api/scholarship.js'
import { buildReviewTabs, filterReviewByTab } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const REVIEW_KEY_MAP = ['pending', 'processing', 'completed']

export default {
  name: 'TeacherAidHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return {
      activeTab: 'pending',
      filterVersion: 0,
      list: [],
      lastSyncedChange: ''
    }
  },
  computed: {
    tabs() {
      return buildReviewTabs(this.list, 'teacher').map((tab, i) => ({
        ...tab,
        key: REVIEW_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = REVIEW_KEY_MAP.indexOf(this.activeTab)
      return filterReviewByTab(this.list, 'teacher', idx >= 0 ? idx : 0)
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
  },
  async onShow() { this.filterVersion++; try{uni.removeStorageSync("staff_back_target")}catch(e){} await this.refresh(); this.activeTab=getActiveKey("teacherAidHome","todo") }, methods:{ onTabClick(key){ this.activeTab=key; setActiveKey("teacherAidHome",key) }, async refresh(){ try{ const res=await scholarshipApi.getScholarshipList({pageNum:1,pageSize:200,role:"teacher"}); if(res?.code===0) this.list=(res.data.items||[]).map(i=>({...i,uid:i.scholarshipId||i.uid})) }catch(e){} }, goReview(item) {
      rememberStaffBackTarget('/pages/teacher/aid-home/index')
      uni.navigateTo({ url: '/pages/teacher/aid-review/index?uid=' + item.uid })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }

.sc { padding: 20rpx 28rpx 28rpx; display: flex; flex-direction: column; }
.sc > view + view { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > view + view { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-amount { font-size: var(--fs-11); color: var(--brand); display: block; margin-top: 4rpx; font-weight: 500; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
