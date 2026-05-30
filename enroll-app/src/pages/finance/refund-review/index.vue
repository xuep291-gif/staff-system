<template>
  <view class="page">
    <SNavBar title="退费审核" :showBack="true" />
    <scroll-view v-if="item" scroll-y class="body">
      <!-- 学生信息卡片 -->
      <view class="student-card">
        <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.sid }} · {{ item.className || '计算机学院 2026级1班' }}</text>
        </view>
      </view>

      <!-- 退费信息 -->
      <SCard title="退费信息" :padding="16">
        <SInfoRow label="退费类型">{{ item.type || item.feeType || '—' }}</SInfoRow>
        <SInfoRow label="退费金额">
          <text class="val-amount">¥{{ fmt(item.amount) }}</text>
        </SInfoRow>
        <SInfoRow label="退费原因">
          <text class="reason-text">{{ item.reason || '—' }}</text>
        </SInfoRow>
        <SInfoRow label="提交时间">{{ item.applyTime || '—' }}</SInfoRow>
        <SInfoRow label="审核状态">
          <SBadge :color="item.badgeColor || 'wa'">{{ item.statusLabel || '待审核' }}</SBadge>
        </SInfoRow>
        <!-- 失败原因 -->
        <view v-if="item.status === 'failed' && item.failReason" class="fail-box">
          <text class="fail-label">失败原因</text>
          <text class="fail-text">{{ item.failReason }}</text>
        </view>
      </SCard>

      <!-- 财务意见（仅待审核状态） -->
      <SCard title="财务意见" :padding="16" v-if="canAudit">
        <textarea v-model="opinion" class="opinion-textarea" placeholder="请输入审核意见…" />
      </SCard>

      <!-- 操作按钮 -->
      <view class="action-row" v-if="canAudit">
        <view class="btn-e-outline" @click="showReject = true"><text>驳回</text></view>
        <view class="btn-p" @click="showConfirm = true"><text>确认退费</text></view>
      </view>

      <!-- 失败重试按钮 -->
      <view class="action-row" v-if="canRetry">
        <view class="btn-p" @click="onRetry"><text>重新发起退款</text></view>
      </view>

      <!-- 处理中提示 -->
      <view v-if="isProcessing" class="processing-card">
        <text class="processing-icon">⏳</text>
        <text class="processing-text">退款处理中，请耐心等待第三方回调结果</text>
      </view>

      <!-- 审核记录 -->
      <SCard title="审核记录" :padding="16" v-if="item.logs && item.logs.length">
        <view class="log-item" v-for="log in item.logs" :key="log.time + log.node">
          <text class="log-title">{{ log.node }} · {{ log.result }}</text>
          <text class="log-time">{{ log.time }}</text>
          <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
        </view>
      </SCard>

      <view class="body-foot" />
    </scroll-view>

    <SEmpty v-if="!item" text="未找到该退费申请" />

    <!-- 确认弹窗 -->
    <view v-if="showConfirm" class="ovl on" @click="showConfirm = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">确认退费</text>
        <view class="sbody2">
          <SInfoRow label="学生">{{ item.name }}</SInfoRow>
          <SInfoRow label="退费类型">{{ item.type || item.feeType }}</SInfoRow>
          <SInfoRow label="金额"><text class="amount-highlight">¥{{ fmt(item.amount) }}</text></SInfoRow>
          <view class="brow">
            <view class="btn-e" @click="showConfirm = false"><text>取消</text></view>
            <view class="btn-p" @click="onApprove"><text>确认</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 驳回弹窗 -->
    <view v-if="showReject" class="ovl on" @click="showReject = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">驳回原因</text>
        <view class="sbody2">
          <text class="smsg">请输入驳回原因</text>
          <textarea class="sheet-textarea" v-model="rejectReason" placeholder="请输入驳回原因…" />
          <view class="brow">
            <view class="btn-e" @click="showReject = false"><text>取消</text></view>
            <view class="btn-p" @click="onReject"><text>确认驳回</text></view>
          </view>
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
import { getRefundItem, updateRefund, REFUND_STATUS } from '@/utils/businessState.js'
import { refundApi } from '@/common/api/refund.js'

export default {
  name: 'FinanceRefundReview',
  components: { SNavBar, SCard, SInfoRow, SBadge, SEmpty },
  data() {
    return {
      REFUND_STATUS,
      uid: '',
      item: null,
      opinion: '确认退款，提交第三方处理。',
      rejectReason: '',
      showConfirm: false,
      showReject: false,
      submitting: false
    }
  },
  computed: {
    canAudit() {
      return this.item && this.item.status === REFUND_STATUS.PENDING
    },
    canRetry() {
      return this.item && this.item.status === REFUND_STATUS.FAILED
    },
    isProcessing() {
      return this.item && this.item.status === REFUND_STATUS.PROCESSING
    }
  },
  onLoad(options) {
    this.uid = options.uid || ''
    // 先从本地加载
    const local = this.uid ? getRefundItem(this.uid) : null
    if (local) this.item = local
    this.refresh()
  },
  methods: {
    async refresh() {
      if (!this.uid) return
      // 尝试 API 获取最新数据
      try {
        const res = await refundApi.getRefundDetail(this.uid)
        if (res?.data?.code === 0 && res.data.data) {
          this.item = { ...(this.item || {}), ...res.data.data }
        }
      } catch (e) {
        // API 失败，继续使用本地数据
      }
    },
    fmt(v) {
      const n = Number(v)
      return isNaN(n) ? '0' : n.toLocaleString()
    },
    async onApprove() {
      if (this.submitting) return
      this.submitting = true
      this.showConfirm = false
      try {
        await refundApi.approveRefund(this.uid, {
          opinion: this.opinion,
          approvedAmount: this.item.amount
        })
      } catch (e) {
        // API 失败继续
      }
      updateRefund(this.uid, REFUND_STATUS.PROCESSING, {
        node: '财务确认退款',
        result: '已提交第三方退款接口，处理中',
        remark: this.opinion
      })
      this.item = getRefundItem(this.uid) || this.item
      this.submitting = false
      uni.showToast({ title: '已提交退款处理', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 500)
    },
    async onReject() {
      if (this.submitting) return
      this.submitting = true
      this.showReject = false
      try {
        await refundApi.rejectRefund(this.uid, { rejectReason: this.rejectReason || '财务审核驳回' })
      } catch (e) {
        // API 失败继续
      }
      updateRefund(this.uid, REFUND_STATUS.FAILED, {
        node: '财务退费审核',
        result: '退款失败',
        remark: this.rejectReason || '财务审核驳回'
      })
      this.item = getRefundItem(this.uid) || this.item
      this.submitting = false
      uni.showToast({ title: '已驳回', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 500)
    },
    async onRetry() {
      if (this.submitting) return
      this.submitting = true
      try {
        await refundApi.retryRefund(this.uid)
      } catch (e) {
        // API 失败继续
      }
      updateRefund(this.uid, REFUND_STATUS.PROCESSING, {
        node: '财务重新发起退款',
        result: '重新提交第三方退款接口，处理中'
      })
      this.item = getRefundItem(this.uid) || this.item
      this.submitting = false
      uni.showToast({ title: '已重新发起退款', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }

/* 学生卡片 */
.student-card { display: flex; align-items: center; margin: 28rpx; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); font-size: var(--fs-16); font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info { flex: 1; margin-left: 24rpx; min-width: 0; }
.name { font-size: var(--fs-16); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 8rpx; }

/* 金额 */
.val-amount { font-size: var(--fs-18); font-weight: 700; color: var(--er); }
.amount-highlight { color: var(--er); font-weight: 700; font-size: var(--fs-15); }
.reason-text { color: var(--N500); font-size: var(--fs-12); line-height: 1.6; }

/* 失败信息 */
.fail-box { margin-top: 20rpx; padding: 20rpx 24rpx; border-radius: var(--r-12); background: var(--er-bg); border: 1px solid var(--er-bd); }
.fail-label { display: block; font-size: var(--fs-11); font-weight: 600; color: var(--er); margin-bottom: 8rpx; }
.fail-text { font-size: var(--fs-12); color: var(--er); line-height: 1.5; display: block; }

/* 材料预览 */

/* 财务意见 */
.opinion-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }

/* 操作按钮 */
.action-row { display: flex; margin: 28rpx; }
.action-row > * { flex: 1; }
.action-row > * + * { margin-left: 20rpx; }
.btn-p { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-p:active { background: var(--brand-d); transform: scale(0.97); }
.btn-e-outline { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--er); color: var(--er); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); }
.btn-e-outline:active { background: var(--er-bg); }
.btn-e { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er-bg); color: var(--er); font-size: var(--fs-15); font-weight: 600; border: 1px solid var(--er-bd); display: flex; align-items: center; justify-content: center; }
.btn-e:active { background: var(--er); color: #fff; }

/* 处理中 */
.processing-card { margin: 28rpx; padding: 40rpx 28rpx; text-align: center; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.processing-icon { font-size: 48rpx; display: block; margin-bottom: 16rpx; }
.processing-text { font-size: var(--fs-13); color: var(--N500); display: block; line-height: 1.5; }

/* 审核记录 */
.log-item { padding: 16rpx 0; border-bottom: 1px solid var(--N50); }
.log-item:last-child { border-bottom: none; }
.log-title { display: block; font-size: var(--fs-12); font-weight: 600; color: var(--N900); }
.log-time { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N400); }
.log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); }

/* 弹窗 */
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { font-size: var(--fs-16); font-weight: 600; color: var(--N900); padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); display: block; text-align: center; }
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.sheet-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }

.body-foot { height: 48rpx; }
</style>
