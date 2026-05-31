<template>
  <view class="page">
    <!-- Banner -->
    <view class="banner">
      <view class="banner-avatar">{{ profile.name.charAt(0) }}</view>
      <view class="banner-info">
        <text class="banner-name">{{ profile.name }}</text>
        <text class="banner-sub">{{ profile.positionLabel }}</text>
      </view>
      <view class="banner-bell" @click="goMessages">
        <text class="bell-icon">🔔</text>
        <view class="bell-dot" v-if="unreadCount > 0" />
      </view>
      <view class="banner-gear" @click="goSettings">
        <text class="gear-icon">⚙</text>
      </view>
    </view>

    <!-- Float Card -->
    <view class="fc" v-if="profile.position === STAFF_POSITIONS.CASHIER">
      <text class="fc-label">今日实收</text>
      <text class="fc-amount">¥{{ financeStats.receivedAmount }}</text>
      <view class="fc-stats">
        <view class="fc-stat">
          <text class="fc-num">{{ financeStats.paid }}</text>
          <text class="fc-lbl">已缴人数</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num wa">{{ financeStats.unpaid }}</text>
          <text class="fc-lbl">未缴人数</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num er">{{ financeStats.refundPending }}</text>
          <text class="fc-lbl">退费待办</text>
        </view>
      </view>
    </view>
    <view class="fc scope-card" v-else-if="isApprovalRole">
      <text class="fc-label">数据范围</text>
      <text class="scope-title">{{ profile.college || '全校授权范围' }}</text>
      <view class="fc-stats">
        <view class="fc-stat">
          <text class="fc-num">{{ approvalStats.aidPending }}</text>
          <text class="fc-lbl">助学金待办</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num">{{ approvalStats.loanPending }}</text>
          <text class="fc-lbl">贷款待办</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num wa">{{ approvalStats.processing }}</text>
          <text class="fc-lbl">审批中</text>
        </view>
      </view>
    </view>
    <view class="fc scope-card" v-else>
      <text class="fc-label">迎新现场服务</text>
      <text class="scope-title">缴费核验与现场收款登记</text>
      <text class="scope-tip">现场登记即更新缴费状态，后续由财务内部核对。</text>
    </view>

    <!-- Todo Card -->
    <view class="sc">
      <view class="card">
        <view class="card-hd">
          <text class="card-ttl">待办事项</text>
        </view>
        <view class="card-bd">
          <view class="todo-item" v-for="todo in todos" :key="todo.key" @click="goTo(todo.url)">
            <view class="todo-ico" :style="{ background: todo.bg }">{{ todo.icon }}</view>
            <view class="todo-body">
              <text class="todo-ttl">{{ todo.label }}</text>
              <text class="todo-sub">{{ todo.desc }}</text>
            </view>
            <SBadge :color="todo.badgeColor" customStyle="margin-right: 8rpx">{{ todo.count }}</SBadge>
            <text class="todo-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBadge from '@/components/shared/SBadge.vue'
import STabBar from '@/components/shared/STabBar.vue'
import { getClassSummary, getDifferenceRefundList, getOfflineCollectionList, getReceiptList, getReviewList, getRefundList, getUnreadCount, getUrgeTasks, REVIEW_STATUS, REFUND_STATUS } from '@/utils/businessState.js'
import { getFeeList } from '@/utils/businessApi.js'
import { getStaffProfile, STAFF_POSITIONS } from '@/utils/staffAccess.js'

export default {
  name: 'FinanceHome',
  components: { SBadge, STabBar },
  data() {
    return {
      activeTab: 0,
      STAFF_POSITIONS,
      profile: { name: '', position: STAFF_POSITIONS.CASHIER, positionLabel: '', college: '' },
      unreadCount: 0,
      financeStats: { receivedAmount: '0', paid: 0, unpaid: 0, refundPending: 0 },
      approvalStats: { aidPending: 0, loanPending: 0, processing: 0 },
      todos: [],
      tabItems: []
    }
  },
  computed: {
    isApprovalRole() {
      return [STAFF_POSITIONS.STUDENT_AFFAIRS, STAFF_POSITIONS.COLLEGE_LEADER].includes(this.profile.position)
    }
  },
  async onShow() {
    this.profile = getStaffProfile()
    const summary = getClassSummary()
    this.unreadCount = getUnreadCount('finance')
    const fees = await getFeeList()
    const aids = getReviewList('aids')
    const loans = getReviewList('loans')
    const refunds = getRefundList()
    const collections = getOfflineCollectionList()
    const diffs = getDifferenceRefundList()
    const receipts = getReceiptList()
    const urgeTasks = getUrgeTasks()
    const pendingCollection = collections.filter(i => i.status === 'pending').length
    const refundActionCount = summary.refunds.tabs[0].count + summary.refunds.tabs[1].count
    const doneAid = aids.filter(i => [REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED].includes(i.status)).length
    const doneLoan = loans.filter(i => [REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED].includes(i.status)).length
    const doneRefund = refunds.filter(i => i.status !== REFUND_STATUS.PENDING).length
    // 从 API 数据直接计算缴费统计（不再依赖 businessState 本地数据）
    const paidCount = fees.filter(i => i.paymentStatus === 'paid').length
    const unpaidCount = fees.filter(i => ['unpaid', 'overdue'].includes(i.paymentStatus)).length
    const partialCount = fees.filter(i => i.paymentStatus === 'partial').length
    this.financeStats = {
      receivedAmount: fees.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0).toLocaleString(),
      paid: paidCount,
      unpaid: unpaidCount + partialCount,
      refundPending: refundActionCount
    }
    this.approvalStats = {
      aidPending: aids.filter(item => item.status === REVIEW_STATUS.PENDING || item.status === REVIEW_STATUS.FIRST_PASS).length,
      loanPending: loans.filter(item => item.status === REVIEW_STATUS.PENDING || item.status === REVIEW_STATUS.FIRST_PASS).length,
      processing: [...aids, ...loans].filter(item => [REVIEW_STATUS.FIRST_PASS, REVIEW_STATUS.REVIEW_PASS, REVIEW_STATUS.FINAL_PASS].includes(item.status)).length
    }
    if (this.profile.position === STAFF_POSITIONS.CASHIER) {
      this.todos = [
        { key: 'collect', label: '线下收款确认', desc: '查看待确认与收款记录', icon: '收', bg: 'var(--brand-t)', badgeColor: 'wa', count: pendingCollection, url: '/pages/finance/collect/index' },
        { key: 'refund', label: '退费处理', desc: '待审核及待确认打款申请', icon: '退', bg: 'var(--er-bg)', badgeColor: 'er', count: refundActionCount, url: '/pages/finance/refund/index' },
        { key: 'diff', label: '补差退款处理', desc: '处理差额小于零的退款', icon: '差', bg: 'var(--pu-bg)', badgeColor: 'wa', count: diffs.filter(item => item.status === 'pending').length, url: '/pages/finance/diff/index' },
        { key: 'receipt', label: '票据管理', desc: '查询、补打与作废票据', icon: '票', bg: 'var(--in-bg)', badgeColor: 'wa', count: receipts.filter(item => item.status === 'pending').length, url: '/pages/finance/receipt/index' },
        { key: 'urge', label: '催缴任务', desc: '发送范围催缴通知', icon: '催', bg: 'var(--wa-bg)', badgeColor: 'wa', count: urgeTasks.filter(item => item.status === 'running').length, url: '/pages/finance/urge/index' },
        { key: 'aid-payout', label: '待打款助学金', desc: '审批通过后的发放确认', icon: '助', bg: 'var(--ok-bg)', badgeColor: 'wa', count: aids.filter(i => i.status === REVIEW_STATUS.PAYMENT_PENDING).length, url: '/pages/finance/payout-aid/index' },
        { key: 'loan-payout', label: '待打款助学贷款', desc: '审批通过后的发放确认', icon: '贷', bg: 'var(--in-bg)', badgeColor: 'wa', count: loans.filter(i => i.status === REVIEW_STATUS.PAYMENT_PENDING).length, url: '/pages/finance/payout-loan/index' },
        { key: 'processed', label: '已处理记录', desc: '查看已打款与退费记录', icon: '查', bg: 'var(--brand-t)', badgeColor: 'ok', count: doneAid + doneLoan + doneRefund, url: '/pages/finance/processed/index' }
      ]
      this.tabItems = [
        { text: '首页', icon: '⌂' },
        { text: '收款', icon: '收', badge: String(pendingCollection), url: '/pages/finance/collect/index' },
        { text: '退费', icon: '退', badge: String(refundActionCount), url: '/pages/finance/refund/index' },
        { text: '催缴', icon: '催', url: '/pages/finance/urge/index' },
        { text: '消息', icon: '信', url: '/pages/finance/messages/index' }
      ]
    } else if (this.isApprovalRole) {
      this.todos = [
        { key: 'approval-aid', label: '助学金审批', desc: '查看材料、审批与调整发放金额', icon: '助', bg: 'var(--brand-t)', badgeColor: 'wa', count: this.approvalStats.aidPending, url: '/pages/finance/approval/index?type=aids' },
        { key: 'approval-loan', label: '助学贷款审批', desc: '查看材料与审批历史', icon: '贷', bg: 'var(--in-bg)', badgeColor: 'wa', count: this.approvalStats.loanPending, url: '/pages/finance/approval/index?type=loans' },
        { key: 'stats', label: '统计概览', desc: '查看授权范围内缴费与资助情况', icon: '统', bg: 'var(--ok-bg)', badgeColor: 'ok', count: this.approvalStats.processing, url: '/pages/finance/stats/index' }
      ]
      this.tabItems = [
        { text: '首页', icon: '⌂' },
        { text: '审批', icon: '审', badge: String(this.approvalStats.aidPending + this.approvalStats.loanPending), url: '/pages/finance/approval/index?type=aids' },
        { text: '统计', icon: '统', url: '/pages/finance/stats/index' },
        { text: '消息', icon: '信', url: '/pages/finance/messages/index' }
      ]
    } else {
      this.todos = [
        { key: 'verify', label: '学生缴费核验', desc: '查询缴费状态并提供放行提示', icon: '验', bg: 'var(--brand-t)', badgeColor: 'ok', count: 0, url: '/pages/finance/verify/index' },
        { key: 'onsite', label: '现场收款登记', desc: '登记金额、方式与凭证', icon: '登', bg: 'var(--ok-bg)', badgeColor: 'wa', count: pendingCollection, url: '/pages/finance/onsite/index' }
      ]
      this.tabItems = [
        { text: '首页', icon: '⌂' },
        { text: '核验', icon: '验', url: '/pages/finance/verify/index' },
        { text: '登记', icon: '登', url: '/pages/finance/onsite/index' },
        { text: '消息', icon: '信', url: '/pages/finance/messages/index' }
      ]
    }
  },
  methods: {
    goTo(url) { uni.navigateTo({ url }) },
    goMessages() { uni.navigateTo({ url: '/pages/finance/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/finance/settings/index' }) },
    onTabSwitch(idx) {
      const target = this.tabItems[idx]?.url
      if (idx > 0 && target) { uni.navigateTo({ url: target }) }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  padding-bottom: var(--tabbar-h);
}

/* Banner */
.banner {
  background: var(--brand);
  padding: var(--banner-padding);
  display: flex;
  align-items: center;

  > * + * { margin-left: 24rpx; }
}
.banner-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: var(--r-full);
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
  font-weight: 700;
  color: var(--white);
  flex-shrink: 0;
  border: 4rpx solid rgba(255,255,255,0.3);
}
.banner-info { flex: 1; min-width: 0; }
.banner-name {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--white);
  display: block;
}
.banner-sub {
  font-size: var(--fs-11);
  color: rgba(255,255,255,0.7);
  margin-top: 4rpx;
  display: block;
}
.banner-bell {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
.bell-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx;
  height: 16rpx;
  background: var(--er);
  border-radius: var(--r-full);
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  border: 3rpx solid var(--brand);
}
.banner-gear {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.banner-gear:active { opacity: 0.7; }
.gear-icon { font-size: var(--fs-20); }

/* Float Card */
.fc {
  background: var(--fc-bg);
  border-radius: var(--fc-radius);
  box-shadow: var(--fc-shadow);
  margin: var(--fc-offset) 28rpx 0;
  padding: var(--fc-padding);
  position: relative;
  z-index: 2;
}
.fc-label {
  font-size: var(--fs-11);
  color: var(--N500);
  display: block;
  margin-bottom: 4rpx;
}
.fc-amount {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--brand);
}
.scope-title {
  display: block;
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--brand);
  margin-top: 8rpx;
}
.scope-tip {
  display: block;
  margin-top: 18rpx;
  font-size: var(--fs-11);
  line-height: 1.6;
  color: var(--N500);
}
.fc-stats {
  display: flex;
  margin-top: 24rpx;
}
.fc-stat {
  flex: 1;
  text-align: center;
  padding: 8rpx 0;
  border-right: 1px solid var(--N200);
}
.fc-stat:last-child { border-right: none; }
.fc-num {
  font-size: var(--fs-16);
  font-weight: 700;
  color: var(--brand);
  line-height: 1.2;
}
.fc-num.wa { color: var(--wa); }
.fc-num.er { color: var(--er); }
.fc-lbl {
  font-size: var(--fs-10);
  color: var(--N400);
  margin-top: 4rpx;
}

/* Section */
.sc {
  padding: 28rpx;
  margin-top: 20rpx;
}

/* Card */
.card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-header-padding);
  border-bottom: 1px solid var(--N50);
}
.card-ttl {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.card-bd {
  padding: var(--card-body-padding);
}

/* Todo */
.todo-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);

  > * + * { margin-left: 20rpx; }
}
.todo-item:last-child { border-bottom: none; }
.todo-item:active { background: var(--N50); }
.todo-ico {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--r-8);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
}
.todo-body { flex: 1; min-width: 0; }
.todo-ttl {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N900);
  display: block;
}
.todo-sub {
  font-size: var(--fs-11);
  color: var(--N500);
  margin-top: 2rpx;
  display: block;
}
.todo-arrow {
  font-size: 28rpx;
  color: var(--N400);
  flex-shrink: 0;
}
</style>
