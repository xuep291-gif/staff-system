<template>
  <view class="page">
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

    <SFloatCard>
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

    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import STabBar from '@/components/shared/STabBar.vue'
import { getClassSummary, getDifferenceRefundList, getFeeList, getOfflineCollectionList, getReceiptList, getRefundList, getUnreadCount, getUrgeTasks, REFUND_STATUS } from '@/utils/businessState.js'

export default {
  name: 'FinanceHome',
  components: { SBanner, SFloatCard, SCard, SBadge, STabBar },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      finance: { avatar: '陈', name: '陈美玲', subtitle: '财务处 · 收费专员' },
      financeStats: { receivedAmount: '0', paid: 0, unpaid: 0, refundPending: 0 },
      todos: [],
      tabItems: [
        { text: '首页', icon: '🏠' },
        { text: '收款', icon: '💵', badge: '' },
        { text: '退费', icon: '↩️', badge: '' },
        { text: '催缴', icon: '📞' },
        { text: '消息', icon: '🔔' }
      ]
    }
  },
  onShow() {
    const summary = getClassSummary()
    this.unreadCount = getUnreadCount('finance')

    const fees = getFeeList()
    const collections = getOfflineCollectionList()
    const refunds = getRefundList()
    const diffs = getDifferenceRefundList()
    const receipts = getReceiptList()

    const pendingCollection = collections.filter(i => i.status === 'pending').length
    const pendingRefund = refunds.filter(i => i.status === REFUND_STATUS.PENDING).length
    const pendingDiff = diffs.filter(i => i.status === 'pending').length
    const pendingReceipt = receipts.filter(i => i.status === 'pending').length

    this.financeStats = {
      receivedAmount: fees.filter(i => i.payStatus === 'paid').reduce((sum, i) => sum + Number(String(i.amount).replace(/,/g, '')), 0).toLocaleString(),
      paid: summary.fees.tabs[2]?.count || 0,
      unpaid: (summary.fees.tabs[0]?.count || 0) + (summary.fees.tabs[1]?.count || 0),
      refundPending: pendingRefund
    }

    this.todos = [
      { key: 'collect', label: '线下收款待确认', desc: pendingCollection + ' 笔待确认到账', icon: '💵', bg: 'var(--brand-t)', badgeColor: 'wa', count: pendingCollection, url: '/pages/finance/collect/index' },
      { key: 'refund',  label: '退费审批',      desc: pendingRefund + ' 笔待审核',     icon: '↩️', bg: 'var(--er-bg)',   badgeColor: 'er', count: pendingRefund,  url: '/pages/finance/refund/index' },
      { key: 'diff',    label: '宿舍补差退款',  desc: pendingDiff + ' 笔待处理',       icon: '🔄', bg: 'var(--pu-bg)',   badgeColor: 'wa', count: pendingDiff,    url: '/pages/finance/diff/index' },
      { key: 'receipt', label: '票据补打申请',  desc: pendingReceipt + ' 笔待处理',     icon: '🧾', bg: 'var(--in-bg)',   badgeColor: 'wa', count: pendingReceipt, url: '/pages/finance/receipt/index' }
    ]

    this.tabItems[1].badge = String(pendingCollection)
    this.tabItems[2].badge = String(pendingRefund)
  },
  methods: {
    goTo(url) { uni.navigateTo({ url }) },
    goMessages() { uni.navigateTo({ url: '/pages/finance/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/finance/settings/index' }) },
    onTabSwitch(idx) {
      const routes = [null, '/pages/finance/collect/index', '/pages/finance/refund/index', '/pages/finance/urge/index', '/pages/finance/messages/index']
      if (idx > 0 && routes[idx]) { uni.navigateTo({ url: routes[idx] }) }
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: var(--tabbar-h); }

.banner-bell, .banner-gear {
  width: 72rpx; height: 72rpx; background: rgba(255,255,255,.15);
  border-radius: var(--r-full); display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0;
}
.banner-gear:active { opacity: 0.7; }
.bell-icon, .gear-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx; height: 16rpx; background: var(--er); border-radius: var(--r-full);
  position: absolute; top: 12rpx; right: 12rpx; border: 3rpx solid var(--brand);
}

.fc-label { font-size: var(--fs-11); color: var(--N500); display: block; margin-bottom: 4rpx; }
.fc-amount { font-size: 56rpx; font-weight: 700; color: var(--brand); }
.fc-unit { font-size: var(--fs-16); font-weight: 400; color: var(--N400); }
.fc-stats { display: flex; margin-top: 24rpx; }
.fc-stat { flex: 1; text-align: center; padding: 8rpx 0; border-right: 1px solid var(--N200); }
.fc-stat:last-child { border-right: none; }
.fc-num { font-size: var(--fs-16); font-weight: 700; color: var(--brand); line-height: 1.2; }
.fc-num.wa { color: var(--wa); }
.fc-num.er { color: var(--er); }
.fc-lbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

.sc { padding: 28rpx; margin-top: 20rpx; }

.todo-item { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1px solid var(--N50); }
.todo-item > * + * { margin-left: 20rpx; }
.todo-item:last-child { border-bottom: none; }
.todo-item:active { background: var(--N50); }
.todo-ico { width: 72rpx; height: 72rpx; border-radius: var(--r-8); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: var(--fs-20); }
.todo-body { flex: 1; min-width: 0; }
.todo-ttl { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.todo-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 2rpx; display: block; }
.todo-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
