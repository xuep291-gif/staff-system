<template>
  <view class="page">
    <SNavBar title="票据补打确认" :showBack="true" />

    <scroll-view v-if="item" scroll-y class="body">
      <!-- 学生卡片 -->
      <view class="student-card">
        <view class="avatar">{{ item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.studentNo }} · {{ item.college || '计算机学院' }} {{ item.className || '2026级1班' }}</text>
        </view>
      </view>

      <!-- 票据进度 -->
      <SReviewProgress :steps="statusSteps" />

      <!-- 票据信息 -->
      <SCard title="票据信息" :padding="16">
        <SInfoRow label="票据编号">
          <text class="mono">{{ item.receiptNo }}</text>
        </SInfoRow>
        <SInfoRow label="票据类型">{{ item.receiptType }}</SInfoRow>
        <SInfoRow label="票据金额">
          <text class="amount-highlight">¥{{ fmt(item.amount) }}</text>
        </SInfoRow>
        <SInfoRow label="开票日期">{{ item.issueDate || '—' }}</SInfoRow>
        <SInfoRow label="支付方式">{{ item.payMethod || '—' }}</SInfoRow>
        <SInfoRow label="支付时间">{{ item.payTime || '—' }}</SInfoRow>
        <SInfoRow label="收款单位">{{ item.schoolName || '华东科技大学' }}</SInfoRow>
        <SInfoRow label="当前状态">
          <SBadge :color="item.badgeColor || 'wa'">{{ item.statusLabel || '待处理' }}</SBadge>
        </SInfoRow>
        <SInfoRow v-if="item.status !== 'pending'" label="补打次数">
          <text>{{ item.reprintCount || 0 }} / {{ item.maxReprint || 3 }}</text>
        </SInfoRow>
        <SInfoRow v-if="item.status === 'reprinted'" label="补打时间">{{ item.reprintTime || '—' }}</SInfoRow>
        <SInfoRow v-if="item.status === 'voided'" label="作废时间">{{ item.voidTime || '—' }}</SInfoRow>
      </SCard>

      <!-- 收费明细 -->
      <SCard title="收费明细" :padding="16" v-if="item.items && item.items.length">
        <view class="items-box">
          <view class="item-row" v-for="(it, idx) in item.items" :key="idx">
            <text>{{ it.name }} ×{{ it.qty }}</text>
            <text>¥{{ fmt(it.amount) }}</text>
          </view>
        </view>
      </SCard>

      <!-- 数字签名 -->
      <SCard title="票据验证" :padding="16">
        <SInfoRow label="数字签名">
          <text class="mono sm">{{ item.signature || '—' }}</text>
        </SInfoRow>
        <SInfoRow label="验证方式">
          <text class="qr-hint">扫码可验证票据真伪</text>
        </SInfoRow>
      </SCard>

      <!-- 补打确认（待处理状态） -->
      <SCard title="补打确认" :padding="16" v-if="isPending">
        <text class="smsg">确认后将标记"补打"字样，请核实票据信息与申请人身份。</text>
        <view v-if="item.reprintCount >= item.maxReprint" class="limit-warn">
          <text>⚠️ 该票据已补打 {{ item.reprintCount }} 次，已达上限不可继续补打</text>
        </view>
      </SCard>

      <!-- 操作按钮（待处理） -->
      <view class="action-row" v-if="isPending">
        <view class="btn-cancel" @click="goBack"><text>返回</text></view>
        <view class="btn-confirm" :class="{ 'btn-disabled': item.reprintCount >= item.maxReprint }" @click="onReprintClick">
          <text>确认补打</text>
        </view>
      </view>

      <!-- 已补打可作废 -->
      <view class="action-row" v-if="isReprinted">
        <view class="btn-cancel" @click="goBack"><text>返回</text></view>
        <view class="btn-void" @click="showVoid = true"><text>作废票据</text></view>
      </view>

      <!-- 已作废提示 -->
      <view class="voided-card" v-if="isVoided">
        <text class="voided-icon">⚠️</text>
        <text class="voided-text">票据已作废，不可恢复</text>
      </view>

      <view class="body-foot" />
    </scroll-view>
    <SEmpty v-else text="未找到该票据记录" />

    <!-- 作废确认弹窗 -->
    <view v-if="showVoid" class="ovl on" @click="showVoid = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">确认作废</text>
        <view class="sbody2">
          <SInfoRow label="票据编号">{{ item ? item.receiptNo : '' }}</SInfoRow>
          <SInfoRow label="持票人">{{ item ? item.name : '' }}（{{ item ? item.studentNo : '' }}）</SInfoRow>
          <SInfoRow label="金额">
            <text class="amount-highlight">¥{{ item ? fmt(item.amount) : '0' }}</text>
          </SInfoRow>
          <text class="smsg">作废操作不可恢复，确认后将标记"作废"字样。</text>
          <view class="brow">
            <view class="btn-e" @click="showVoid = false"><text>取消</text></view>
            <view class="btn-e-outline-sheet" @click="onVoid"><text>确认作废</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 成功页 -->
    <view v-if="showSuccess" class="ovl on">
      <view class="sheet">
        <view class="shandle" />
        <text class="stitle">✅ {{ successTitle }}</text>
        <view class="sbody2">
          <text class="success-msg">{{ successMsg }}</text>
          <view class="success-info">
            <text>持票人：{{ successData.name }}</text>
            <text>票据编号：{{ successData.receiptNo }}</text>
            <text>金额：¥{{ fmt(successData.amount) }}</text>
          </view>
          <view class="btn-p" @click="goBack"><text>返回列表</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SReviewProgress from '@/components/shared/SReviewProgress.vue'
import { getReceiptList, updateReceipt } from '@/utils/businessState.js'

export default {
  name: 'FinanceReceiptDetail',
  components: { SNavBar, SCard, SInfoRow, SBadge, SEmpty, SReviewProgress },
  data() {
    return {
      itemId: '',
      item: null,
      showVoid: false,
      showSuccess: false,
      successTitle: '',
      successMsg: '',
      successData: { name: '', receiptNo: '', amount: 0 }
    }
  },
  computed: {
    isPending() { return this.item && this.item.status === 'pending' },
    isReprinted() { return this.item && this.item.status === 'reprinted' },
    isVoided() { return this.item && this.item.status === 'voided' },
    statusSteps() {
      if (!this.item) return []
      const steps = [
        { label: '学生申请补打', sub: this.item.submittedAt || '已提交', done: true, current: false, popping: false },
        { label: '财务确认补打', sub: '待确认', done: false, current: false, popping: false },
        { label: '票据补打完成', sub: '—', done: false, current: false, popping: false }
      ]
      if (this.isPending) {
        steps[1] = { ...steps[1], sub: '当前步骤', current: true }
      } else if (this.isReprinted) {
        steps[1] = { ...steps[1], sub: this.item.reprintTime || '已补打', done: true }
        steps[2] = { ...steps[2], sub: '补打已完成', done: true }
      } else if (this.isVoided) {
        steps[1] = { ...steps[1], sub: '已作废', done: true }
        steps[2] = { ...steps[2], sub: '已作废', done: true }
      }
      return steps
    }
  },
  onLoad(options) {
    this.itemId = options.id || ''
    this.refresh()
  },
  onShow() { this.refresh() },
  methods: {
    refresh() {
      if (this.itemId) {
        const list = getReceiptList()
        this.item = list.find(i => i.id === this.itemId) || null
      }
    },
    fmt(v) { const n = Number(v); return isNaN(n) ? '0' : n.toLocaleString() },
    onReprintClick() {
      if (!this.item || this.item.reprintCount >= (this.item.maxReprint || 3)) return
      const that = this
      uni.showModal({
        title: '确认补打',
        content: '确认为 ' + this.item.name + '（' + this.item.studentNo + '）补打票据？\n票据编号：' + this.item.receiptNo + '\n票据金额：¥' + this.fmt(this.item.amount) + '\n已补打次数：' + (this.item.reprintCount || 0) + '/' + (this.item.maxReprint || 3),
        confirmText: '确认补打',
        success(res) {
          if (res.confirm) that.doReprint()
        }
      })
    },
    doReprint() {
      const result = updateReceipt(this.item.id, 'reprint')
      if (result && result.error) {
        uni.showToast({ title: result.message, icon: 'none' })
        return
      }
      this.refresh()
      this.successTitle = '补打成功'
      this.successMsg = '票据已补打，标记"补打"字样。'
      this.successData = { name: this.item.name, receiptNo: this.item.receiptNo, amount: this.item.amount }
      this.showSuccess = true
    },
    onVoid() {
      this.showVoid = false
      const result = updateReceipt(this.item.id, 'void')
      if (result && result.error) {
        uni.showToast({ title: result.message, icon: 'none' })
        return
      }
      this.refresh()
      this.successTitle = '作废成功'
      this.successMsg = '票据已作废，不可恢复。'
      this.successData = { name: this.item.name, receiptNo: this.item.receiptNo, amount: this.item.amount }
      this.showSuccess = true
    },
    goBack() { uni.navigateBack() }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }
.body-foot { height: 48rpx; }

/* ── 学生卡片 ── */
.student-card { display: flex; align-items: center; margin: 28rpx; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow-low); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); font-size: var(--fs-16); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.info { flex: 1; margin-left: 24rpx; min-width: 0; }
.name { font-size: var(--fs-16); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 8rpx; }
.amount-highlight { color: var(--er); font-weight: 700; font-size: var(--fs-15); }
.mono { font-family: monospace; font-size: var(--fs-12); color: var(--N600); }
.mono.sm { font-size: var(--fs-10); word-break: break-all; }
.qr-hint { color: var(--in); font-size: var(--fs-12); }

/* ── 收费明细 ── */
.items-box { background: var(--N25); border-radius: var(--r-8); padding: 8rpx 16rpx; }
.item-row { display: flex; justify-content: space-between; padding: 10rpx 0; font-size: var(--fs-12); color: var(--N700); }
.item-row + .item-row { border-top: 1px solid var(--N100); }

/* ── 补打确认 ── */
.smsg { font-size: var(--fs-13); color: var(--N500); line-height: 1.6; }
.limit-warn { margin-top: 12rpx; padding: 16rpx; background: var(--er-bg); border-radius: var(--r-8); }
.limit-warn text { font-size: var(--fs-12); color: var(--er); line-height: 1.5; }

/* ── 操作按钮 ── */
.action-row { display: flex; margin: 28rpx; }
.action-row > view { flex: 1; }
.action-row > view + view { margin-left: 20rpx; }
.btn-confirm { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-confirm:active { background: var(--brand-d); transform: scale(0.97); }
.btn-disabled { opacity: 0.4; pointer-events: none; }
.btn-cancel { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--N200); color: var(--N600); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); }
.btn-cancel:active { background: var(--N50); }
.btn-void { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--er); color: var(--er); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); }
.btn-void:active { background: var(--er-bg); }

/* ── 已作废 ── */
.voided-card { margin: 28rpx; padding: 48rpx 28rpx; text-align: center; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow-low); }
.voided-icon { font-size: 48rpx; display: block; margin-bottom: 12rpx; }
.voided-text { font-size: var(--fs-14); color: var(--N700); font-weight: 600; display: block; }

/* ── 弹窗 ── */
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { font-size: var(--fs-16); font-weight: 600; color: var(--N900); padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); display: block; text-align: center; }
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > view + view { margin-top: 24rpx; }
.brow { display: flex; }
.brow > view + view { margin-left: 16rpx; }
.brow > view { flex: 1; }
.btn-e { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er-bg); color: var(--er); font-size: var(--fs-15); font-weight: 600; border: 1px solid var(--er-bd); display: flex; align-items: center; justify-content: center; }
.btn-e:active { background: var(--er); color: #fff; }
.btn-e-outline-sheet { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er); color: #fff; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-e-outline-sheet:active { opacity: 0.8; }
.btn-p { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-p:active { background: var(--brand-d); }

/* ── 成功页 ── */
.success-msg { font-size: var(--fs-14); color: var(--ok); font-weight: 600; text-align: center; display: block; }
.success-info { display: flex; flex-direction: column; gap: 8rpx; padding: 20rpx; background: var(--N25); border-radius: var(--r-8); font-size: var(--fs-13); color: var(--N700); }
</style>
