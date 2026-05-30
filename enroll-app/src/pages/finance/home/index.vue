<template>
  <view class="page">
    <!-- Banner 横幅 -->
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

    <!-- FloatCard 统计卡片 -->
    <SFloatCard>
      <view class="fc-stats">
        <view class="fc-stat">
          <text class="fc-num">{{ financeStats.todayAmount }}</text>
          <text class="fc-lbl">今日实收(元)</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num">{{ financeStats.todayCount }}</text>
          <text class="fc-lbl">当日笔数</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num wa">{{ financeStats.unpaid }}</text>
          <text class="fc-lbl">未缴人数</text>
        </view>
      </view>
      <view class="fc-methods" v-if="financeStats.methodBreakdown.length">
        <text class="fc-methods-title">各支付方式占比</text>
        <view class="fc-method-list">
          <view class="fc-method-item" v-for="m in financeStats.methodBreakdown" :key="m.name">
            <text class="fc-method-name">{{ m.name }}</text>
            <view class="fc-method-bar">
              <view class="fc-method-fill" :style="{ width: m.pct + '%' }" />
            </view>
            <text class="fc-method-pct">{{ m.pct }}%</text>
          </view>
        </view>
      </view>
    </SFloatCard>

    <!-- 内容区 -->
    <view class="sc">
      <!-- 待办事项 -->
      <SCard title="待办事项" :actionText="'共' + todoTotal + '项'">
        <view class="todo-item" v-for="todo in todos" :key="todo.key" @click="goTo(todo.url)">
          <view class="todo-ico" :style="{ background: todo.bg }">{{ todo.icon }}</view>
          <view class="todo-body">
            <text class="todo-ttl">{{ todo.label }}</text>
            <text class="todo-sub">{{ todo.desc }}</text>
          </view>
          <SBadge :color="todo.badgeColor">{{ todo.count }}</SBadge>
          <text class="todo-arrow">›</text>
        </view>
        <SEmpty v-if="!todos.length" text="暂无待办事项" />
      </SCard>

      <!-- 快捷功能 -->
      <SCard title="快捷功能">
        <view class="grid-3">
          <view class="grid-item" v-for="fn in quickFns" :key="fn.key" @click="goTo(fn.url)">
            <text class="grid-ico">{{ fn.icon }}</text>
            <text class="grid-lbl">{{ fn.label }}</text>
          </view>
        </view>
      </SCard>
    </view>

    <!-- 底部 TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import STabBar from '@/components/shared/STabBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { applyTheme } from '@/utils/role.js'
import {
  getClassSummary, getPaymentRecordList, getFeeList,
  getOfflineCollectionList, getRefundList, getDifferenceRefundList,
  getReceiptList, getUnreadCount, REFUND_STATUS,
  getReviewList
} from '@/utils/businessState.js'

export default {
  name: 'FinanceHome',
  components: { SBanner, SFloatCard, SCard, SBadge, STabBar, SEmpty },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      finance: {
        avatar: '陈',
        name: '陈美玲',
        subtitle: '工号 F2026001 · 财务处 · 收费专员'
      },
      financeStats: {
        todayAmount: '0',
        todayCount: 0,
        unpaid: 0,
        methodBreakdown: []
      },
      todos: [],
      quickFns: [],
      tabItems: [
        { text: '首页', icon: '🏠' },
        { text: '收款', icon: '💵', badge: '' },
        { text: '退费', icon: '↩️', badge: '' },
        { text: '催缴', icon: '📞' },
        { text: '消息', icon: '🔔' }
      ]
    }
  },
  computed: {
    todoTotal() { return this.todos.reduce((s, t) => s + t.count, 0) }
  },
  onShow() {
    applyTheme('finance')
    this.unreadCount = getUnreadCount('finance')

    const summary = getClassSummary()
    const fees = getFeeList()
    const records = getPaymentRecordList()
    const collections = getOfflineCollectionList()
    const refunds = getRefundList()
    const diffs = getDifferenceRefundList()
    const receipts = getReceiptList()

    // 统计待办数量
    const pendingCollection = collections.filter(i => i.status === 'pending').length
    const pendingRefund = refunds.filter(i => i.status === REFUND_STATUS.PENDING).length
    const processingRefund = refunds.filter(i => i.status === REFUND_STATUS.PROCESSING).length
    const failedRefund = refunds.filter(i => i.status === REFUND_STATUS.FAILED).length
    const pendingDiff = diffs.filter(i => i.status === 'pending').length
    const pendingReceipt = receipts.filter(i => i.status === 'pending').length

    // 各支付方式占比
    const methods = {}
    records.forEach(r => {
      const key = r.method || '其他'
      methods[key] = (methods[key] || 0) + Number(r.amount || 0)
    })
    const totalMethodAmount = Object.values(methods).reduce((s, v) => s + v, 0) || 1
    const methodBreakdown = Object.entries(methods).map(([name, amount]) => ({
      name,
      amount: amount.toLocaleString(),
      pct: Math.round((amount / totalMethodAmount) * 100)
    }))

    const totalRecordsAmount = records.reduce((s, r) => s + Number(r.amount || 0), 0)

    this.financeStats = {
      todayAmount: totalRecordsAmount.toLocaleString(),
      todayCount: records.length,
      unpaid: (summary.fees.tabs[0]?.count || 0) + (summary.fees.tabs[1]?.count || 0),
      methodBreakdown
    }

    // 待办事项列表
    this.todos = [
      { key: 'collect', label: '线下收款待确认', desc: pendingCollection + ' 笔待确认到账', icon: '💵', bg: 'var(--brand-t)', badgeColor: 'wa', count: pendingCollection, url: '/pages/finance/collect/index' },
      { key: 'refund',  label: '退费申请待审核', desc: pendingRefund + ' 笔待审核',       icon: '↩️', bg: 'var(--er-bg)',   badgeColor: 'er', count: pendingRefund,  url: '/pages/finance/refund/index' },
      { key: 'diff',    label: '宿舍补差退款',   desc: pendingDiff + ' 笔待处理',         icon: '🔄', bg: 'var(--pu-bg)',   badgeColor: 'wa', count: pendingDiff,    url: '/pages/finance/diff/index' },
      { key: 'receipt', label: '票据补打申请',   desc: pendingReceipt + ' 笔待处理',       icon: '🧾', bg: 'var(--in-bg)',   badgeColor: 'wa', count: pendingReceipt, url: '/pages/finance/receipt/index' },
      { key: 'refund-processing', label: '退费处理中', desc: processingRefund + ' 笔处理中', icon: '⏳', bg: 'var(--in-bg)',   badgeColor: 'in', count: processingRefund, url: '/pages/finance/refund/index' },
      { key: 'refund-failed',     label: '退费失败待处理', desc: failedRefund + ' 笔需重新发起', icon: '⚠️', bg: 'var(--wa-bg)',   badgeColor: 'er', count: failedRefund,     url: '/pages/finance/refund/index' }
    ].filter(t => t.count > 0)

    // 快捷功能网格
    this.quickFns = [
      { key: 'collect', icon: '💵', label: '线下收款确认', url: '/pages/finance/collect/index' },
      { key: 'records', icon: '📋', label: '收款记录查询', url: '/pages/finance/records/index' },
      { key: 'refund',  icon: '↩️', label: '退费处理',     url: '/pages/finance/refund/index' },
      { key: 'diff',    icon: '🔄', label: '补差退款',     url: '/pages/finance/diff/index' },
      { key: 'receipt', icon: '🧾', label: '票据管理',     url: '/pages/finance/receipt/index' },
      { key: 'urge',    icon: '📞', label: '催缴任务',     url: '/pages/finance/urge/index' },
      { key: 'payout-aid',  icon: '⭐', label: '助学金打款', url: '/pages/finance/payout-aid/index' },
      { key: 'payout-loan', icon: '🏦', label: '贷款打款',  url: '/pages/finance/payout-loan/index' },
      { key: 'messages',    icon: '🔔', label: '消息通知',  url: '/pages/finance/messages/index' }
    ]

    this.tabItems[1].badge = String(pendingCollection)
    this.tabItems[2].badge = String(pendingRefund + processingRefund + failedRefund)
  },
  methods: {
    goTo(url) { if (url) uni.navigateTo({ url }) },
    goMessages() { uni.navigateTo({ url: '/pages/finance/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/finance/settings/index' }) },
    onTabSwitch(idx) {
      const routes = [
        null,
        '/pages/finance/collect/index',
        '/pages/finance/refund/index',
        '/pages/finance/urge/index',
        '/pages/finance/messages/index'
      ]
      if (idx > 0 && routes[idx]) uni.navigateTo({ url: routes[idx] })
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

/* Banner 操作按钮 */
.banner-bell, .banner-gear {
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,.15);
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0;
}
.banner-gear:active { opacity: 0.7; }
.bell-icon, .gear-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx; height: 16rpx;
  background: var(--er); border-radius: var(--r-full);
  position: absolute; top: 12rpx; right: 12rpx;
  border: 3rpx solid var(--fc);
}

/* FloatCard 统计行 */
.fc-stats { display: flex; }
.fc-stat {
  flex: 1; text-align: center; padding: 8rpx 0;
  border-right: 1px solid var(--N200);
}
.fc-stat:last-child { border-right: none; }
.fc-num {
  font-size: var(--fs-22); font-weight: 700;
  color: var(--brand); line-height: 1.2;
}
.fc-num.wa { color: var(--wa); }
.fc-lbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

/* 支付方式占比 */
.fc-methods { margin-top: 24rpx; padding-top: 20rpx; border-top: 1px solid var(--N50); }
.fc-methods-title { font-size: var(--fs-11); font-weight: 600; color: var(--N600); margin-bottom: 12rpx; display: block; }
.fc-method-list { display: flex; flex-direction: column; gap: 10rpx; }
.fc-method-item { display: flex; align-items: center; gap: 12rpx; }
.fc-method-name { font-size: var(--fs-11); color: var(--N600); min-width: 100rpx; flex-shrink: 0; }
.fc-method-bar { flex: 1; height: 12rpx; background: var(--N100); border-radius: 6rpx; overflow: hidden; }
.fc-method-fill { height: 100%; background: var(--brand); border-radius: 6rpx; transition: width 0.6s; min-width: 4rpx; }
.fc-method-pct { font-size: var(--fs-10); color: var(--N500); min-width: 48rpx; text-align: right; flex-shrink: 0; }

/* 内容区 */
.sc {
  padding: 0;
  display: flex; flex-direction: column;
}
.sc > view + view { margin-top: 20rpx; }

/* 待办列表项 */
.todo-item {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.todo-item > view + view { margin-left: 20rpx; }
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

/* 快捷功能网格（与教师端一致） */
.grid-3 {
  display: flex; flex-wrap: wrap;
  background: var(--N50);
}
.grid-3 > view { width: calc(100% / 3); }
.grid-item {
  background: var(--white);
  padding: 28rpx 16rpx; text-align: center;
  border: 1px solid var(--N50);
  box-sizing: border-box;
}
.grid-item:active { background: var(--N25); }
.grid-ico { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.grid-lbl { font-size: var(--fs-11); font-weight: 600; color: var(--N700); display: block; }
</style>
