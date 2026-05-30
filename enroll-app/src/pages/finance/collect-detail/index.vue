<template>
  <view class="page">
    <SNavBar title="线下收款确认" :showBack="true" />

    <scroll-view v-if="item" scroll-y class="body">
      <!-- 学生信息卡片 -->
      <view class="student-card">
        <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.studentNo }} · {{ item.college || '计算机学院' }} {{ item.className || '2026级1班' }}</text>
        </view>
      </view>

      <!-- 收款进度 -->
      <SReviewProgress :steps="statusSteps" />

      <!-- 收款信息 -->
      <SCard title="收款信息" :padding="16">
        <SInfoRow label="缴费金额">
          <text class="amount-highlight">¥{{ fmt(item.amount) }}</text>
        </SInfoRow>
        <SInfoRow label="原收款方式">{{ item.method || '—' }}</SInfoRow>
        <SInfoRow label="收款地点">{{ item.location || '—' }}</SInfoRow>
        <SInfoRow label="提交时间">{{ item.time || '—' }}</SInfoRow>
        <SInfoRow label="当前状态">
          <SBadge :color="item.badgeColor || 'wa'">{{ item.statusLabel || '待确认' }}</SBadge>
        </SInfoRow>
        <SInfoRow v-if="item.receiptNo" label="收据编号">
          <text class="mono">{{ item.receiptNo }}</text>
        </SInfoRow>
        <SInfoRow v-if="item.confirmTime" label="确认时间">{{ item.confirmTime }}</SInfoRow>
        <SInfoRow v-if="item.confirmedBy" label="确认人">{{ item.confirmedBy }}</SInfoRow>
      </SCard>

      <!-- 收款凭证 -->
      <SCard title="收款凭证" :padding="16">
        <view class="preview-entry" @click="showPreview = true">
          <view class="preview-icon">📄</view>
          <view class="preview-main">
            <text class="preview-title">现场收款凭证</text>
            <text class="preview-sub">查看学生提交的现场收款凭证</text>
          </view>
          <text class="preview-arrow">›</text>
        </view>
      </SCard>

      <!-- 审核记录 -->
      <SCard title="操作记录" :padding="16" v-if="item.logs && item.logs.length">
        <view class="log" v-for="log in item.logs" :key="log.time + log.node">
          <text class="log-title">{{ log.node }} · {{ log.result }}</text>
          <text class="log-time">{{ log.time }}</text>
          <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
        </view>
      </SCard>

      <!-- 财务确认（待确认状态） -->
      <SCard title="财务确认" :padding="16" v-if="isPending">
        <text class="field-label">确认收款方式 <text class="required">*</text></text>
        <view class="method-picker" @click.stop="showMethodPicker = !showMethodPicker">
          <text :class="{ 'ph': !form.collectionType }">{{ form.collectionType || '请选择收款方式' }}</text>
          <text class="arrow" :class="{ open: showMethodPicker }">›</text>
        </view>
        <view class="method-dropdown" v-if="showMethodPicker">
          <view
            class="method-option"
            :class="{ active: form.collectionType === m }"
            v-for="m in collectionTypes"
            :key="m"
            @click.stop="selectMethod(m)"
          >{{ m }}</view>
        </view>
        <view v-if="showMethodPicker" class="method-mask" @click.stop="showMethodPicker = false" />

        <text class="field-label" style="margin-top: 24rpx;">收款备注</text>
        <textarea class="remark-area" v-model="form.remark" placeholder="可填写票据号或现场说明" maxlength="100" />
      </SCard>

      <!-- 操作按钮（待确认） -->
      <view class="action-row" v-if="isPending">
        <view class="btn-cancel" @click="goBack"><text>返回</text></view>
        <view class="btn-confirm" :class="{ 'btn-disabled': !form.collectionType }" @click="onConfirmClick"><text>确认收款</text></view>
      </view>

      <!-- 已确认可作废 -->
      <view class="action-row" v-if="isConfirmed && canVoid">
        <view class="btn-cancel" @click="goBack"><text>返回</text></view>
        <view class="btn-void" @click="showVoid = true"><text>作废此记录</text></view>
      </view>

      <!-- 已作废提示 -->
      <view class="voided-card" v-if="isVoided">
        <text class="voided-icon">⚠️</text>
        <text class="voided-text">此收款记录已作废，账单金额已回退</text>
      </view>

      <view class="body-foot" />
    </scroll-view>
    <SEmpty v-else text="未找到该收款记录" />

    <!-- 凭证预览弹窗 -->
    <view v-if="showPreview" class="ovl on" @click="showPreview = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">收款凭证</text>
        <view class="sbody2">
          <text class="smsg">学生提交的现场收款凭证将在此处展示。</text>
          <view class="preview-file">
            <text class="preview-file-name">现场收款凭证</text>
            <SBadge color="in">可预览</SBadge>
          </view>
        </view>
      </view>
    </view>

    <!-- 作废确认弹窗 -->
    <view v-if="showVoid" class="ovl on" @click="showVoid = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">确认作废</text>
        <view class="sbody2">
          <SInfoRow label="学生">{{ item ? item.name : '' }}</SInfoRow>
          <SInfoRow label="金额">
            <text class="amount-highlight">¥{{ item ? fmt(item.amount) : '0' }}</text>
          </SInfoRow>
          <SInfoRow v-if="item && item.receiptNo" label="收据编号">{{ item.receiptNo }}</SInfoRow>
          <text class="smsg">作废后将回退账单已缴金额，此操作不可撤销。</text>
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
        <text class="stitle">✅ 确认成功</text>
        <view class="sbody2">
          <text class="success-msg">收款已确认，账单状态已同步更新</text>
          <view class="success-info">
            <text>学生：{{ successData.name }}</text>
            <text>金额：¥{{ fmt(successData.amount) }}</text>
            <text v-if="successData.receiptNo">收据号：{{ successData.receiptNo }}</text>
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
import { getOfflineCollectionList, confirmOfflineCollection, voidOfflineCollection, generateReceiptNumber } from '@/utils/businessState.js'
import { hasPermission } from '@/utils/permissions.js'

export default {
  name: 'FinanceCollectDetail',
  components: { SNavBar, SCard, SInfoRow, SBadge, SEmpty, SReviewProgress },
  data() {
    return {
      itemId: '',
      item: null,
      showPreview: false,
      showVoid: false,
      showSuccess: false,
      showMethodPicker: false,
      submitting: false,
      collectionTypes: ['现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      form: { collectionType: '', remark: '' },
      successData: { name: '', amount: 0, receiptNo: '' }
    }
  },
  computed: {
    canVoid() { return hasPermission('finance:void') || hasPermission('finance:admin') },
    isPending() { return this.item && this.item.status === 'pending' },
    isConfirmed() { return this.item && this.item.status === 'confirmed' },
    isVoided() { return this.item && this.item.status === 'voided' },
    statusSteps() {
      if (!this.item) return []
      const steps = [
        { label: '学生线下缴费', sub: this.item.time || '已提交', done: true, current: false, popping: false },
        { label: '财务确认收款', sub: '待确认', done: false, current: false, popping: false },
        { label: '账单更新完成', sub: '—', done: false, current: false, popping: false }
      ]
      if (this.isPending) {
        steps[1] = { ...steps[1], sub: '当前步骤', current: true }
      } else if (this.isConfirmed) {
        steps[1] = { ...steps[1], sub: this.item.confirmTime || '已确认', done: true }
        steps[2] = { ...steps[2], sub: '账单已更新', done: true }
      } else if (this.isVoided) {
        steps[1] = { ...steps[1], sub: this.item.confirmTime || '已确认', done: true }
        steps[2] = { ...steps[2], sub: '已回退', done: true }
      }
      return steps
    }
  },
  onLoad(options) {
    this.itemId = options.id || ''
    this.refresh()
  },
  onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      if (this.itemId) {
        const list = getOfflineCollectionList()
        this.item = list.find(i => i.id === this.itemId) || null
      }
    },
    fmt(v) { const n = Number(v); return isNaN(n) ? '0' : n.toLocaleString() },
    selectMethod(m) {
      this.form.collectionType = m
      this.showMethodPicker = false
    },
    onConfirmClick() {
      if (!this.form.collectionType) {
        uni.showToast({ title: '请先选择收款方式', icon: 'none' })
        return
      }
      const that = this
      uni.showModal({
        title: '确认收款',
        content: '确认收到 ' + (this.item ? this.item.name : '') + ' 的线下收款 ¥' + this.fmt(this.item ? this.item.amount : 0) + '？\n收款方式：' + this.form.collectionType,
        confirmText: '确认收款',
        success(res) {
          if (res.confirm) that.doConfirm()
        }
      })
    },
    doConfirm() {
      if (this.submitting) return
      this.submitting = true
      try {
        const result = confirmOfflineCollection(this.item.id, {
          collectionType: this.form.collectionType,
          remark: this.form.remark.trim(),
          confirmedBy: '陈美玲'
        })
        if (!result) {
          uni.showToast({ title: '确认失败，请重试', icon: 'none' })
          this.submitting = false
          return
        }
        this.refresh()
        this.successData = {
          name: this.item.name,
          amount: this.item.amount,
          receiptNo: this.item.receiptNo || generateReceiptNumber()
        }
        this.showSuccess = true
      } catch (e) {
        uni.showToast({ title: '确认失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    onVoid() {
      if (!this.item) return
      this.showVoid = false
      const r = voidOfflineCollection(this.item.id)
      if (r.success) {
        this.refresh()
        uni.showToast({ title: '单据已作废', icon: 'success' })
      } else {
        uni.showToast({ title: r.message || '作废失败', icon: 'none' })
      }
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

/* ── 凭证预览 ── */
.preview-entry { display: flex; align-items: center; min-height: 96rpx; }
.preview-entry > * + * { margin-left: 20rpx; }
.preview-icon { width: 72rpx; height: 72rpx; border-radius: var(--r-12); background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-20); }
.preview-main { flex: 1; min-width: 0; }
.preview-title { display: block; font-size: var(--fs-14); color: var(--N900); font-weight: 600; }
.preview-sub { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N500); }
.preview-arrow { color: var(--N400); font-size: 32rpx; }
.preview-file { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; border-radius: var(--r-12); background: var(--N50); }
.preview-file-name { font-size: var(--fs-13); color: var(--N900); font-weight: 600; }

/* ── 操作记录 ── */
.log + .log { margin-top: 20rpx; }
.log-title { display: block; font-size: var(--fs-13); font-weight: 600; color: var(--N900); }
.log-time { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N400); }
.log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); }

/* ── 财务确认表单 ── */
.field-label { font-size: var(--fs-13); font-weight: 600; color: var(--N700); display: block; margin-bottom: 12rpx; }
.required { color: var(--er); }
.method-picker {
  height: 88rpx;
  padding: 0 24rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-12);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-14);
  color: var(--N900);
}
.method-picker:active { background: var(--N25); }
.method-picker .ph { color: var(--N400); }
.method-picker .arrow { font-size: 28rpx; color: var(--N400); transition: transform .2s; }
.method-picker .arrow.open { transform: rotate(90deg); }
.method-dropdown { position: relative; z-index: 10; background: var(--white); border-radius: var(--r-8); box-shadow: 0 8rpx 24rpx rgba(0,0,0,.12); margin-top: 8rpx; overflow: hidden; }
.method-option { padding: 22rpx 24rpx; font-size: var(--fs-13); color: var(--N700); border-bottom: 1px solid var(--N50); }
.method-option:last-child { border-bottom: none; }
.method-option:active { background: var(--N50); }
.method-option.active { color: var(--brand); font-weight: 600; background: var(--brand-t); }
.method-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 5; }
.remark-area {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx 24rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-12);
  font-size: var(--fs-13);
  color: var(--N900);
  background: var(--white);
  box-sizing: border-box;
  line-height: 1.5;
  margin-top: 12rpx;
}

/* ── 操作按钮行 ── */
.action-row { display: flex; margin: 28rpx; }
.action-row > * { flex: 1; }
.action-row > * + * { margin-left: 20rpx; }

.btn-confirm { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-confirm:active { background: var(--brand-d); transform: scale(0.97); }

.btn-cancel { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--N200); color: var(--N600); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); }
.btn-cancel:active { background: var(--N50); }

.btn-void { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--er); color: var(--er); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); }
.btn-void:active { background: var(--er-bg); }

/* ── 已作废提示 ── */
.voided-card { margin: 28rpx; padding: 48rpx 28rpx; text-align: center; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow-low); }
.voided-icon { font-size: 48rpx; display: block; margin-bottom: 12rpx; }
.voided-text { font-size: var(--fs-14); color: var(--N700); font-weight: 600; display: block; }

/* ── 弹窗（与 aid-review 一致） ── */
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { font-size: var(--fs-16); font-weight: 600; color: var(--N900); padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); display: block; text-align: center; }
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }

/* ── 弹窗按钮 ── */
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
.brow > * { flex: 1; }
.btn-p { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-p:active { background: var(--brand-d); }
.btn-disabled { opacity: 0.4; pointer-events: none; }
.btn-e { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er-bg); color: var(--er); font-size: var(--fs-15); font-weight: 600; border: 1px solid var(--er-bd); display: flex; align-items: center; justify-content: center; }
.btn-e:active { background: var(--er); color: #fff; }
.btn-e-outline-sheet { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er); color: #fff; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-e-outline-sheet:active { opacity: 0.8; }

/* ── 成功页 ── */
.success-msg { font-size: var(--fs-14); color: var(--ok); font-weight: 600; text-align: center; display: block; }
.success-info { display: flex; flex-direction: column; gap: 8rpx; padding: 20rpx; background: var(--N25); border-radius: var(--r-8); font-size: var(--fs-13); color: var(--N700); }
</style>
