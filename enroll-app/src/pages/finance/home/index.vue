<template>
  <view class="page">
    <!-- §6.4 Banner -->
    <SBanner :avatar="finance.avatar" :name="finance.name" :sub="finance.subtitle">
      <template #actions>
        <view class="banner-bell" @click="goMessages">
          <text class="bell-icon">🔔</text>
          <view class="bell-dot" v-if="unreadCount > 0" />
        </view>
        <view class="banner-gear" @click="goSettings">
          <text class="gear-icon">⚙</text>
        </view>
      </template>
    </SBanner>

    <!-- §6.5 Float Card — 迎新工作人员看报到统计 -->
    <SFloatCard v-if="currentSubRole === 'checkin_staff'">
      <text class="fc-label">今日报到统计</text>
      <text class="fc-amount">{{ checkinStats.checkedIn }}<text class="fc-unit"> 人</text></text>
      <view class="fc-stats">
        <view class="fc-stat">
          <text class="fc-num">{{ checkinStats.checkedIn }}</text>
          <text class="fc-lbl">已报到</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num wa">{{ checkinStats.unchecked }}</text>
          <text class="fc-lbl">待报到</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num">{{ checkinStats.rate }}%</text>
          <text class="fc-lbl">报到率</text>
        </view>
      </view>
      <SProgressBar :percent="checkinStats.rate" color="brand" />
    </SFloatCard>

    <!-- §6.5 Float Card — 财务人员看收款统计 -->
    <SFloatCard v-else>
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
    </SFloatCard>

    <!-- §7.1 Content -->
    <view class="sc">
      <SCard title="待办事项">
        <view class="todo-item" v-for="todo in todos" :key="todo.key" @click="goTo(todo.url)">
          <view class="todo-ico" :style="{ background: todo.bg }">{{ todo.icon }}</view>
          <view class="todo-body">
            <text class="todo-ttl">{{ todo.label }}</text>
            <text class="todo-sub">{{ todo.desc }}</text>
          </view>
          <SBadge :color="todo.badgeColor" customStyle="margin-right: 8rpx">{{ todo.count }}</SBadge>
          <text class="todo-arrow">›</text>
        </view>
      </SCard>
    </view>

    <!-- §6.3 Bottom TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import STabBar from '@/components/shared/STabBar.vue'
import { getClassSummary, getDifferenceRefundList, getFeeList, getOfflineCollectionList, getReceiptList, getReviewList, getRefundList, getUnreadCount, getUrgeTasks, REVIEW_STATUS, REFUND_STATUS } from '@/utils/businessState.js'
import { getSubRole, getAllowedTodoKeys, SUB_ROLES } from '@/utils/permissions.js'

export default {
  name: 'FinanceHome',
  components: { SBanner, SFloatCard, SCard, SBadge, STabBar, SProgressBar },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      currentSubRole: '',
      finance: {
        avatar: '陈',
        name: '陈美玲',
        subtitle: '财务处 · 收费专员'
      },
      financeStats: { receivedAmount: '0', paid: 0, unpaid: 0, refundPending: 0 },
      checkinStats: { checkedIn: 0, unchecked: 0, total: 0, rate: 0 },
      allTodos: [
        // 收费专员
        { key: 'collect', label: '线下收款确认', desc: '待财务核对的现场收款', icon: '💵', bg: 'var(--brand-t)', badgeColor: 'wa', count: 0, url: '/pages/finance/collect/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'aid-payout', label: '待打款助学金', desc: '教师终审通过后进入打款', icon: '💰', bg: 'var(--ok-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/payout-aid/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'loan-payout', label: '待打款助学贷款', desc: '教师终审通过后进入打款', icon: '🏦', bg: 'var(--in-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/payout-loan/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'refund', label: '退费审核', desc: '学生退费申请待处理', icon: '↩️', bg: 'var(--er-bg)', badgeColor: 'er', count: 0, url: '/pages/finance/refund/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'diff', label: '补差退款处理', desc: '处理差额小于零的退款', icon: '🔄', bg: 'var(--pu-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/diff/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'receipt', label: '票据管理', desc: '补打与作废票据', icon: '🧾', bg: 'var(--in-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/receipt/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'urge', label: '催缴任务', desc: '发送范围催缴通知', icon: '📢', bg: 'var(--wa-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/urge/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        { key: 'processed', label: '已处理记录', desc: '查看已打款与退费记录', icon: '✅', bg: 'var(--brand-t)', badgeColor: 'ok', count: 0, url: '/pages/finance/processed/index', subRoles: [SUB_ROLES.FEE_COLLECTOR] },
        // 审批专员
        { key: 'aid-review', label: '助学金审批', desc: '待审批的助学金申请', icon: '⭐', bg: 'var(--wa-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/aid-review/index', subRoles: [SUB_ROLES.FEE_APPROVER] },
        { key: 'loan-review', label: '助学贷款审批', desc: '待审批的贷款申请', icon: '🏦', bg: 'var(--in-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/loan-review/index', subRoles: [SUB_ROLES.FEE_APPROVER] },
        { key: 'approver-processed', label: '已处理记录', desc: '查看已审批的记录', icon: '✅', bg: 'var(--brand-t)', badgeColor: 'ok', count: 0, url: '/pages/finance/processed/index', subRoles: [SUB_ROLES.FEE_APPROVER] },
        // 迎新工作人员
        { key: 'verify', label: '缴费核验', desc: '扫码/输入学号核验缴费状态', icon: '🔍', bg: 'var(--brand-t)', badgeColor: 'wa', count: 0, url: '/pages/finance/verify/index', subRoles: [SUB_ROLES.CHECKIN_STAFF] },
        { key: 'onsite', label: '现场收款登记', desc: '登记现场缴纳的费用', icon: '💵', bg: 'var(--ok-bg)', badgeColor: 'wa', count: 0, url: '/pages/finance/onsite/index', subRoles: [SUB_ROLES.CHECKIN_STAFF] },
        { key: 'checkin-todo', label: '报到统计', desc: '查看实时报到数据', icon: '✅', bg: 'var(--in-bg)', badgeColor: 'ok', count: 0, url: '/pages/finance/checkin/index', subRoles: [SUB_ROLES.CHECKIN_STAFF] }
      ],
      todos: [],
      tabItems: [
        { text: '首页', icon: '🏠' },
        { text: '收款', icon: '💵', badge: '18' },
        { text: '退费', icon: '↩️', badge: '12' },
        { text: '催缴', icon: '📞' },
        { text: '消息', icon: '🔔' }
      ]
    }
  },
  onShow() {
    const subRole = getSubRole()
    this.currentSubRole = subRole
    const summary = getClassSummary()
    this.unreadCount = getUnreadCount('finance')
    this.checkinStats = summary.checkin
    const fees = getFeeList()
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

    this.financeStats = {
      receivedAmount: fees.filter(i => i.payStatus === 'paid').reduce((sum, i) => sum + Number(String(i.amount).replace(/,/g, '')), 0).toLocaleString(),
      paid: summary.fees.tabs[2].count,
      unpaid: summary.fees.tabs[0].count + summary.fees.tabs[1].count,
      refundPending: refundActionCount
    }

    this.todos = this.allTodos
      .filter(todo => todo.subRoles.includes(subRole))
      .map(todo => {
        if (todo.key === 'collect') return { ...todo, count: pendingCollection }
        if (todo.key === 'aid-payout') return { ...todo, count: aids.filter(i => i.status === REVIEW_STATUS.PAYMENT_PENDING).length }
        if (todo.key === 'loan-payout') return { ...todo, count: loans.filter(i => i.status === REVIEW_STATUS.PAYMENT_PENDING).length }
        if (todo.key === 'refund') return { ...todo, count: refundActionCount, desc: '待审核及待确认打款申请' }
        if (todo.key === 'diff') return { ...todo, count: diffs.filter(item => item.status === 'pending').length }
        if (todo.key === 'receipt') return { ...todo, count: receipts.filter(item => item.status === 'pending').length }
        if (todo.key === 'urge') return { ...todo, count: urgeTasks.filter(item => item.status === 'running').length }
        if (todo.key === 'processed') return { ...todo, count: doneAid + doneLoan + doneRefund }
        if (todo.key === 'aid-review') return { ...todo, count: summary.aids.tabs[0] ? summary.aids.tabs[0].count : 0, desc: '待审批的助学金申请' }
        if (todo.key === 'loan-review') return { ...todo, count: summary.loans.tabs[0] ? summary.loans.tabs[0].count : 0, desc: '待审批的贷款申请' }
        if (todo.key === 'approver-processed') return { ...todo, count: doneAid + doneLoan }
        if (todo.key === 'verify') return { ...todo, count: summary.checkin ? summary.checkin.unchecked : 0, desc: '待核验缴费状态的学生' }
        if (todo.key === 'onsite') return { ...todo, count: pendingCollection, desc: '待登记的现场收款' }
        if (todo.key === 'checkin-todo') return { ...todo, count: summary.checkin ? summary.checkin.checkedIn : 0, desc: '今日已报到学生' }
        return todo
      })

    const subRoleLabels = {
      [SUB_ROLES.FEE_COLLECTOR]: '财务处 · 收费专员',
      [SUB_ROLES.FEE_APPROVER]: '财务处 · 审批专员',
      [SUB_ROLES.CHECKIN_STAFF]: '迎新工作处'
    }
    this.finance.subtitle = subRoleLabels[subRole] || '财务处'

    if (subRole === SUB_ROLES.FEE_COLLECTOR) {
      this.tabItems = [
        { text: '首页', icon: '🏠' },
        { text: '收款', icon: '💵', badge: String(pendingCollection) },
        { text: '退费', icon: '↩️', badge: String(refundActionCount) },
        { text: '催缴', icon: '📞' },
        { text: '消息', icon: '🔔' }
      ]
    } else if (subRole === SUB_ROLES.FEE_APPROVER) {
      this.tabItems = [
        { text: '首页', icon: '🏠' },
        { text: '助学金', icon: '⭐', badge: String(summary.aids.tabs[0] ? summary.aids.tabs[0].count : 0) },
        { text: '贷款', icon: '🏦', badge: String(summary.loans.tabs[0] ? summary.loans.tabs[0].count : 0) },
        { text: '记录', icon: '📋' },
        { text: '消息', icon: '🔔' }
      ]
    } else if (subRole === SUB_ROLES.CHECKIN_STAFF) {
      this.tabItems = [
        { text: '首页', icon: '🏠' },
        { text: '核验', icon: '🔍' },
        { text: '登记', icon: '💵' },
        { text: '报到', icon: '✅' },
        { text: '消息', icon: '🔔' }
      ]
    }
  },
  methods: {
    goTo(url) { uni.navigateTo({ url }) },
    goMessages() { uni.navigateTo({ url: '/pages/finance/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/finance/settings/index' }) },
    onTabSwitch(idx) {
      const subRole = getSubRole()
      let routes
      if (subRole === SUB_ROLES.FEE_COLLECTOR) {
        routes = [null, '/pages/finance/collect/index', '/pages/finance/refund/index', '/pages/finance/urge/index', '/pages/finance/messages/index']
      } else if (subRole === SUB_ROLES.FEE_APPROVER) {
        routes = [null, '/pages/finance/aid-review/index', '/pages/finance/loan-review/index', '/pages/finance/processed/index', '/pages/finance/messages/index']
      } else if (subRole === SUB_ROLES.CHECKIN_STAFF) {
        routes = [null, '/pages/finance/verify/index', '/pages/finance/onsite/index', '/pages/finance/checkin/index', '/pages/finance/messages/index']
      } else {
        routes = [null, '/pages/finance/collect/index', '/pages/finance/refund/index', '/pages/finance/urge/index', '/pages/finance/messages/index']
      }
      if (idx > 0 && routes[idx]) { uni.navigateTo({ url: routes[idx] }) }
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

/* Banner actions */
.banner-bell, .banner-gear {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
.banner-gear:active { opacity: 0.7; }
.bell-icon, .gear-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx; height: 16rpx;
  background: var(--er);
  border-radius: var(--r-full);
  position: absolute;
  top: 12rpx; right: 12rpx;
  border: 3rpx solid var(--brand);
}

/* Float Card custom */
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
.fc-unit {
  font-size: var(--fs-16);
  font-weight: 400;
  color: var(--N400);
}
.fc-stats { display: flex; margin-top: 24rpx; }
.fc-stat {
  flex: 1; text-align: center; padding: 8rpx 0;
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
.fc-lbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

/* Content */
.sc { padding: 28rpx; margin-top: 20rpx; }

/* Todo items */
.todo-item {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
  > * + * { margin-left: 20rpx; }
}
.todo-item:last-child { border-bottom: none; }
.todo-item:active { background: var(--N50); }
.todo-ico {
  width: 72rpx; height: 72rpx; border-radius: var(--r-8);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-20);
}
.todo-body { flex: 1; min-width: 0; }
.todo-ttl { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.todo-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 2rpx; display: block; }
.todo-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
