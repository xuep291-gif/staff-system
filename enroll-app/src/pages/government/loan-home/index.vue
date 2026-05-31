<template>
  <view class="page">
    <SNavBar title="学院负责人复审" :showBack="true" fallbackUrl="/pages/government/home/index" />
    <StatusTabs tabGroup="govLoanHome" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }}</text>
                <text class="li-amount">¥{{ item.amount }} · {{ item.type }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无贷款记录" />
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
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'GovernmentLoanHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return [
        { key: 'pending', label: '待审批', count: this.list.filter(i => i.status === REVIEW_STATUS.FIRST_PASS).length },
        { key: 'processing', label: '审批中', count: this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS).length },
        { key: 'completed', label: '已完结', count: this.list.filter(i => [REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status)).length }
      ]
    },
    filteredList() {
      const labelMap = {
        pending: ['待审批', 'wa'],
        processing: ['审批中', 'in'],
        completed: ['已完结', 'ok']
      }
      const [label, color] = labelMap[this.activeTab] || ['', 'wa']
      let rows
      if (this.activeTab === 'pending') rows = this.list.filter(i => i.status === REVIEW_STATUS.FIRST_PASS)
      else if (this.activeTab === 'processing') rows = this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS)
      else rows = this.list.filter(i => [REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status))
      return rows.map(item => ({ ...item, listStatusLabel: label, listBadgeColor: color }))
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
  },
  
  
  async onShow(){ this.filterVersion++; await this.refresh() }, methods:{
    onTabClick(key) {
      this.activeTab = key
      setActiveKey('govLoanHome', key)
    },
    async refresh(){ try{ var r=await scholarshipApi.getLoanList({pageNum:1,pageSize:200,tab:"todo",role:"government"}); if(r&&r.code===0) this.list=(r.data.items||[]).map(function(i){return Object.assign({},i,{uid:i.loanId})}) }catch(e){} },
}}
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
