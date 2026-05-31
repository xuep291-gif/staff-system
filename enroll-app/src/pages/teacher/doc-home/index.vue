<template>
  <view class="page">
    <SNavBar title="资料审核" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <StatusTabs tabGroup="teacherDocHome" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }} · {{ item.submittedAt }}</text>
              </view>
              <text class="li-arrow">›</text>
            </view>
          </view>
          <view class="card-ft" v-if="activeTab === 'pending' && item.tags && item.tags.length">
            <SBadge v-for="(tag, ti) in item.tags" :key="ti" color="wa" customStyle="margin-right: 12rpx; margin-bottom: 8rpx;">{{ tag }}</SBadge>
          </view>
          <view class="card-ft reason" v-if="activeTab === 'rejected' && item.reason">
            <text class="reason-text">退回原因：{{ item.reason }}</text>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无资料" />
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
import { documentApi } from '@/common/api/document.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const DOC_KEY_STATUS_MAP = {
  pending: ['pending'],
  passed: ['first_pass', 'department_review', 'final_pass'],
  rejected: ['rejected']
}

const DOC_TAB_KEYS = ['pending', 'passed', 'rejected']

export default {
  name: 'TeacherDocHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return [
        { key: 'pending', label: '待审核', count: this.list.filter(i => DOC_KEY_STATUS_MAP.pending.includes(i.status)).length },
        { key: 'passed', label: '已通过', count: this.list.filter(i => DOC_KEY_STATUS_MAP.passed.includes(i.status)).length },
        { key: 'rejected', label: '已退回', count: this.list.filter(i => DOC_KEY_STATUS_MAP.rejected.includes(i.status)).length }
      ]
    },
    filteredList() {
      const statuses = DOC_KEY_STATUS_MAP[this.activeTab] || DOC_KEY_STATUS_MAP.pending
      return this.list.filter(i => statuses.includes(i.status))
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
  },
  async onShow() { this.filterVersion++; try{uni.removeStorageSync("staff_back_target")}catch(e){} await this.refresh(); this.activeTab=getActiveKey("teacherDocHome","pending") }, methods:{ onTabClick(key){ this.activeTab=key; setActiveKey("teacherDocHome",key) }, async refresh(){ try{ const res=await documentApi.getReviewList({pageNum:1,pageSize:200}); if(res?.code===0) this.list=(res.data.items||[]).map(i=>({...i,uid:i.documentReviewId||i.uid,badgeColor:i.status==="pending"?"wa":i.status==="rejected"?"er":"ok"})) }catch(e){} }, goReview(item) {
      rememberStaffBackTarget('/pages/teacher/doc-home/index')
      uni.navigateTo({ url: '/pages/teacher/doc-review/index?uid=' + item.uid })
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
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }

.card-ft { padding: 0 28rpx 20rpx; display: flex; flex-wrap: wrap; }
.card-ft.reason { flex-direction: column; }
.reason-text { font-size: var(--fs-11); color: var(--N600); line-height: 1.5; display: block; }
</style>
