<template>
  <view class="page">
    <SNavBar title="票据管理" :showBack="true" fallbackUrl="/pages/finance/home/index" />

    <!-- Search Bar -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model.trim="keyword"
        placeholder="学号 / 票据编号 / 姓名"
        confirm-type="search"
      />
      <view class="search-clear" v-if="keyword" @click="keyword = ''">
        <text>✕</text>
      </view>
    </view>

    <!-- Tabs -->
    <StatusTabs tabGroup="financeReceipt" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />

    <scroll-view scroll-y class="body">
      <SEmpty v-if="!filteredList.length" :text="emptyText" />

      <view class="receipt-list" v-for="item in filteredList" :key="activeTab + '-' + filterVersion + '-' + item.id">
        <view class="receipt-card" @tap="openDetail(item)">
          <view class="card-top">
            <view class="avatar" :style="{ background: avatarBg(item) }">
              <text :style="{ color: avatarColor(item) }">{{ item.name.charAt(0) }}</text>
            </view>
            <view class="card-info">
              <view class="info-top-row">
                <text class="info-name">{{ item.name }}</text>
                <text class="info-no">{{ item.studentNo }}</text>
              </view>
              <text class="info-receipt-no">票据号：{{ item.receiptNo }}</text>
              <text class="info-meta">{{ item.receiptType }} · ¥{{ fmt(item.amount) }}</text>
            </view>
            <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
          </view>
          <view class="card-bottom" v-if="item.status !== 'pending'">
            <text class="bottom-text">{{ item.status === 'voided' ? '作废于 ' + item.voidTime : '补打于 ' + item.reprintTime }}</text>
            <text class="bottom-count" v-if="item.status === 'reprinted'">已补打 {{ item.reprintCount }}/{{ item.maxReprint }} 次</text>
          </view>
        </view>
      </view>
      <view class="body-foot" />
    </scroll-view>

    <!-- Detail Sheet -->
    <SBottomSheet v-model="showDetail" :title="sheetTitle">
      <view v-if="detail" class="detail-body">
        <SInfoRow label="票据编号">
          <text class="mono-text">{{ detail.receiptNo }}</text>
        </SInfoRow>
        <SInfoRow label="票据状态">
          <SBadge :color="detail.badgeColor">{{ detail.statusLabel }}</SBadge>
        </SInfoRow>
        <SInfoRow label="开票日期">{{ detail.issueDate }}</SInfoRow>
        <SInfoRow label="付款人">{{ detail.name }}（{{ detail.studentNo }}）</SInfoRow>
        <SInfoRow label="收款单位">{{ detail.schoolName || '华东科技大学' }}</SInfoRow>
        <SInfoRow label="票据类型">{{ detail.receiptType }}</SInfoRow>
        <SInfoRow label="票据金额">
          <text class="detail-amount">¥{{ fmt(detail.amount) }}</text>
        </SInfoRow>
        <SInfoRow v-if="detail.items && detail.items.length" label="收费明细">
          <view class="items-box">
            <view class="item-row" v-for="(it, idx) in detail.items" :key="idx">
              <text>{{ it.name }} ×{{ it.qty }}</text>
              <text>¥{{ fmt(it.amount) }}</text>
            </view>
          </view>
        </SInfoRow>
        <SInfoRow label="支付方式">{{ detail.payMethod }}</SInfoRow>
        <SInfoRow label="支付时间">{{ detail.payTime }}</SInfoRow>
        <SInfoRow label="申请原因">{{ detail.reason }}</SInfoRow>
        <SInfoRow label="数字签名">
          <text class="mono-text sm">{{ detail.signature || '—' }}</text>
        </SInfoRow>
        <SInfoRow label="验证二维码">
          <text class="qr-hint">扫码可验证票据真伪</text>
        </SInfoRow>
        <view v-if="detail.reprintCount > 0" class="reprint-info">
          <text>已补打 {{ detail.reprintCount }}/{{ detail.maxReprint }} 次</text>
          <text v-if="detail.reprintCount >= detail.maxReprint" class="warn-text">已达补打上限</text>
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions" v-if="detail.status === 'pending'">
          <view class="sheet-hint">
            <text v-if="detail.reprintCount >= detail.maxReprint" class="limit-warn">该票据已补打 3 次，不可继续补打</text>
            <text v-else>确认补打后将标记"补打"字样</text>
          </view>
          <view class="btn-row">
            <SButton variant="danger" size="md" @click="onVoidConfirm">作废票据</SButton>
            <SButton variant="primary" size="md" :disabled="detail.reprintCount >= detail.maxReprint" @click="onReprint">确认补打</SButton>
          </view>
        </view>
        <view class="sheet-actions" v-else-if="detail.status === 'reprinted'">
          <SButton variant="danger" size="md" block @click="onVoidConfirm">作废票据</SButton>
        </view>
        <view class="sheet-actions" v-else>
          <text class="voided-hint">票据已作废，不可恢复</text>
        </view>
      </template>
    </SBottomSheet>

    <!-- Void Confirmation -->
    <SBottomSheet v-model="showVoidConfirm" title="确认作废票据">
      <view class="void-body">
        <SAlertBar type="error" message="作废操作不可恢复，请谨慎操作" />
        <view class="void-info">
          <text class="void-label">票据编号</text>
          <text class="void-value mono-text">{{ detail.receiptNo }}</text>
        </view>
        <view class="void-info">
          <text class="void-label">持票人</text>
          <text class="void-value">{{ detail.name }}（{{ detail.studentNo }}）</text>
        </view>
        <view class="void-info">
          <text class="void-label">金额</text>
          <text class="void-value amount">¥{{ fmt(detail.amount) }}</text>
        </view>
      </view>
      <template #footer>
        <view class="btn-row">
          <SButton variant="secondary" size="md" @click="showVoidConfirm = false">取消</SButton>
          <SButton variant="danger" size="md" @click="onVoid">确认作废</SButton>
        </view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import { getReceiptList, updateReceipt } from '@/utils/businessState.js'

const TABS = [
  { key: 'pending', label: '待处理' },
  { key: 'reprinted', label: '已补打' },
  { key: 'voided', label: '已作废' }
]

export default {
  name: 'FinanceReceipt',
  components: { SNavBar, StatusTabs, SBadge, SButton, SBottomSheet, SInfoRow, SEmpty, SAlertBar },
  data() {
    return {
      activeTab: 'pending',
      filterVersion: 0,
      keyword: '',
      list: [],
      showDetail: false,
      showVoidConfirm: false,
      detail: {}
    }
  },
  computed: {
    tabs() {
      const counts = {}
      this.list.forEach(item => { counts[item.status] = (counts[item.status] || 0) + 1 })
      return TABS.map(t => ({ key: t.key, label: t.label, count: counts[t.key] || 0 }))
    },
    filteredList() {
      let items = this.list.filter(item => item.status === this.activeTab)
      if (this.keyword) {
        const kw = this.keyword.trim().toLowerCase()
        items = items.filter(item =>
          String(item.studentNo || '').toLowerCase().includes(kw) ||
          String(item.receiptNo || '').toLowerCase().includes(kw) ||
          String(item.name || '').toLowerCase().includes(kw)
        )
      }
      return items
    },
    sheetTitle() { return this.detail.status === 'pending' ? '确认补打' : '票据详情' },
    emptyText() {
      const map = { pending: '当前暂无待处理票据', reprinted: '暂无已补打票据', voided: '暂无已作废票据' }
      return map[this.activeTab] || '暂无票据记录'
    }
  },
  onShow() { this.filterVersion++; this.refresh() },
  methods: {
    refresh() {
      this.list = getReceiptList()
      if (this.detail && this.detail.id) {
        this.detail = this.list.find(item => item.id === this.detail.id) || this.detail
      }
    },
    fmt(v) {
      const n = Number(v)
      return isNaN(n) ? '0' : n.toLocaleString()
    },
    avatarBg(item) {
      const map = { pending: 'var(--wa-bg)', reprinted: 'var(--ok-bg)', voided: 'var(--er-bg)' }
      return map[item.status] || 'var(--in-bg)'
    },
    avatarColor(item) {
      const map = { pending: 'var(--wa)', reprinted: 'var(--ok)', voided: 'var(--er)' }
      return map[item.status] || 'var(--in)'
    },
    onTabClick(key) { if (this.activeTab === key) return; this.activeTab = key; this.filterVersion++ },
    openDetail(item) {
      this.detail = item
      this.showDetail = true
    },
    onReprint() {
      const that = this
      uni.showModal({
        title: '确认补打',
        content: '确认为 ' + (this.detail.name || '') + '（' + (this.detail.studentNo || '') + '）补打票据吗？\n票据编号：' + (this.detail.receiptNo || '') + '\n票据金额：¥' + this.fmt(this.detail.amount) + '\n已补打次数：' + (this.detail.reprintCount || 0) + '/' + (this.detail.maxReprint || 3),
        confirmText: '确认补打',
        success(res) {
          if (res.confirm) that.doReprint()
        }
      })
    },
    doReprint() {
      const result = updateReceipt(this.detail.id, 'reprint')
      if (result && result.error) {
        uni.showToast({ title: result.message, icon: 'none' })
        return
      }
      this.showDetail = false
      this.refresh()
      uni.showToast({ title: '票据已补打', icon: 'success' })
    },
    onVoid() {
      const result = updateReceipt(this.detail.id, 'void')
      if (result && result.error) {
        uni.showToast({ title: result.message, icon: 'none' })
        return
      }
      this.showVoidConfirm = false
      this.showDetail = false
      this.refresh()
      uni.showToast({ title: '票据已作废，不可恢复', icon: 'none' })
    },
    onVoidConfirm() {
      this.showDetail = false
      this.$nextTick(() => { this.showVoidConfirm = true })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  display: flex;
  flex-direction: column;
}

/* ── Search ── */
.search-bar {
  padding: 16rpx 28rpx;
  position: relative;
  flex-shrink: 0;
}
.search-input {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: var(--r-8);
  background: var(--white);
  font-size: var(--fs-13);
  color: var(--N900);
  box-shadow: var(--card-shadow-low);
}
.search-input::placeholder { color: var(--N400); }
.search-clear {
  position: absolute;
  right: 44rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--r-full);
  background: var(--N200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-11);
  color: var(--N600);
}

/* ── Body ── */
.body { flex: 1; min-height: 0; }
.body-foot { height: 48rpx; }
.receipt-list { padding: 0 28rpx; }

/* ── Card ── */
.receipt-card {
  background: var(--white);
  border-radius: var(--r-12);
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--card-shadow-low);
}
.receipt-card:active { background: var(--N25); }
.card-top {
  display: flex;
  align-items: center;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.info-top-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.info-name {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.info-no {
  font-size: var(--fs-12);
  color: var(--N500);
}
.info-receipt-no {
  font-size: var(--fs-10);
  color: var(--N400);
  font-family: monospace;
  display: block;
  margin-top: 4rpx;
}
.info-meta {
  font-size: var(--fs-11);
  color: var(--N500);
  display: block;
  margin-top: 4rpx;
}
.card-bottom {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid var(--N50);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bottom-text {
  font-size: var(--fs-10);
  color: var(--N400);
}
.bottom-count {
  font-size: var(--fs-10);
  color: var(--in);
  font-weight: 600;
}

/* ── Detail ── */
.detail-body { padding: 8rpx 0; }
.mono-text { font-family: monospace; font-size: var(--fs-11); color: var(--N600); word-break: break-all; }
.mono-text.sm { font-size: var(--fs-9); }
.detail-amount { font-size: var(--fs-18); font-weight: 700; color: var(--brand); }
.items-box {
  background: var(--N25);
  border-radius: var(--r-8);
  padding: 12rpx 16rpx;
  width: 100%;
}
.item-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  font-size: var(--fs-11);
  color: var(--N700);
}
.item-row + .item-row { border-top: 1px solid var(--N100); }
.qr-hint {
  font-size: var(--fs-11);
  color: var(--in);
  text-decoration: underline;
}
.reprint-info {
  margin-top: 16rpx;
  padding: 16rpx;
  background: var(--in-bg);
  border-radius: var(--r-8);
  font-size: var(--fs-12);
  color: var(--N600);
  display: flex;
  justify-content: space-between;
}
.warn-text { color: var(--er); font-weight: 600; }

/* ── Actions ── */
.sheet-actions { }
.sheet-hint {
  text-align: center;
  font-size: var(--fs-11);
  color: var(--N500);
  margin-bottom: 16rpx;
}
.limit-warn { color: var(--er); font-weight: 600; }
.btn-row {
  display: flex;
  gap: 20rpx;
}
.btn-row > * { flex: 1; }
.voided-hint {
  display: block;
  text-align: center;
  padding: 24rpx 0;
  font-size: var(--fs-12);
  color: var(--N400);
}

/* ── Void Confirm ── */
.void-body {
  padding: 8rpx 0;
}
.void-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.void-label { font-size: var(--fs-13); color: var(--N500); }
.void-value { font-size: var(--fs-13); color: var(--N900); font-weight: 500; }
.void-value.amount { font-size: var(--fs-16); font-weight: 700; color: var(--er); }
</style>
