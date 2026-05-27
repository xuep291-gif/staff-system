<template>
  <view class="page">
    <SNavBar :title="pageTitle" :showBack="true" />
    <STabs :tabs="tabs" v-model="activeTab" :storage-key="'staff-approval-' + collection + '-' + profile.position" />
    <scroll-view scroll-y class="body">
      <view v-if="filteredList.length" class="list">
        <SListItem v-for="item in filteredList" :key="item.uid" clickable @click="openItem(item)">
          <template #avatar><view class="avatar">{{ item.avatar }}</view></template>
          <view class="row-main">
            <view class="row-top">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            </view>
            <text class="meta">{{ item.sid }} · {{ item.className }}</text>
            <text class="meta">{{ item.type }}</text>
            <text class="amount">¥{{ item.amount }}</text>
          </view>
        </SListItem>
      </view>
      <SEmpty v-else text="当前状态暂无申请" />
    </scroll-view>

    <SBottomSheet v-model="showDetail" :title="pageTitle + '详情'">
      <view v-if="currentItem" class="detail">
        <view class="student-card">
          <view class="detail-avatar">{{ currentItem.avatar }}</view>
          <view class="student-main">
            <text class="student-name">{{ currentItem.name }}</text>
            <text class="student-meta">{{ currentItem.sid }} · {{ currentItem.className }}</text>
          </view>
          <SBadge :color="currentItem.badgeColor">{{ currentItem.statusLabel }}</SBadge>
        </view>
        <SReviewProgress :steps="steps" />
        <SCard title="申请信息">
          <SInfoRow :label="collection === 'aids' ? '申请档位' : '贷款金额'">
            <text class="detail-amount">¥{{ currentItem.amount }}</text>
          </SInfoRow>
          <SInfoRow :label="collection === 'aids' ? '资助类型' : '贷款类型'">{{ currentItem.type }}</SInfoRow>
          <SInfoRow label="申请说明">家庭经济困难，申请本学年资助支持。</SInfoRow>
        </SCard>
        <SCard title="佐证材料">
          <view class="preview-entry" @click="showPreview = true">
            <view class="preview-body">
              <text class="preview-title">预览材料</text>
              <text class="preview-sub">查看学生提交的申请材料</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </SCard>
        <SCard v-if="canAudit" title="审批意见">
          <view v-if="collection === 'aids'" class="field">
            <text class="field-label">调整发放金额</text>
            <input class="field-input" type="digit" v-model="approvedAmount" />
          </view>
          <view class="field">
            <text class="field-label">审批意见</text>
            <textarea class="textarea" v-model="opinion" placeholder="请输入审批意见" />
          </view>
        </SCard>
        <SCard v-if="currentItem.logs && currentItem.logs.length" title="审批记录">
          <view class="log" v-for="log in currentItem.logs" :key="log.time + log.node">
            <text class="log-title">{{ log.node }} · {{ log.result }}</text>
            <text class="log-time">{{ log.time }}</text>
            <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
          </view>
        </SCard>
      </view>
      <template #footer>
        <view class="actions" v-if="canAudit">
          <SButton variant="danger" :disabled="submitting" @click="rejectItem">拒绝</SButton>
          <SButton variant="primary" :disabled="submitting" @click="approveItem">审批通过</SButton>
        </view>
      </template>
    </SBottomSheet>

    <SBottomSheet v-model="showPreview" title="材料预览">
      <SAlertBar type="info" message="申请材料已统一收纳，此处仅提供查看入口。" />
      <view class="material-file">
        <text class="preview-title">申请材料包</text>
        <SBadge color="in">可预览</SBadge>
      </view>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SListItem from '@/components/shared/SListItem.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SReviewProgress from '@/components/shared/SReviewProgress.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SButton from '@/components/shared/SButton.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import { buildFundingReviewSteps, buildReviewTabs, filterReviewByTab, getReviewItem, getReviewList, updateReview, REVIEW_STATUS } from '@/utils/businessState.js'
import { getStaffProfile, guardStaffFeature, STAFF_POSITIONS } from '@/utils/staffAccess.js'

export default {
  name: 'StaffApproval',
  components: { SNavBar, STabs, SListItem, SBadge, SEmpty, SBottomSheet, SReviewProgress, SCard, SInfoRow, SButton, SAlertBar },
  data() {
    return {
      collection: 'aids',
      activeTab: 0,
      list: [],
      profile: { position: STAFF_POSITIONS.COLLEGE_LEADER },
      currentItem: null,
      showDetail: false,
      showPreview: false,
      opinion: '材料核验无误，建议通过。',
      approvedAmount: '',
      submitting: false
    }
  },
  computed: {
    pageTitle() {
      return this.collection === 'loans' ? '助学贷款审批' : '助学金审批'
    },
    tabs() {
      return buildReviewTabs(this.list, 'finance')
    },
    filteredList() {
      return filterReviewByTab(this.list, 'finance', this.activeTab)
    },
    canAudit() {
      if (!this.currentItem) return false
      if (this.profile.position === STAFF_POSITIONS.COLLEGE_LEADER) return this.currentItem.status === REVIEW_STATUS.PENDING
      if (this.profile.position === STAFF_POSITIONS.STUDENT_AFFAIRS) return this.currentItem.status === REVIEW_STATUS.FIRST_PASS
      return false
    },
    steps() {
      return buildFundingReviewSteps(this.currentItem || {})
    }
  },
  onLoad(options) {
    if (!guardStaffFeature('approval')) return
    this.profile = getStaffProfile()
    this.collection = options.type === 'loans' ? 'loans' : 'aids'
  },
  onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.list = getReviewList(this.collection)
      if (this.currentItem) this.currentItem = getReviewItem(this.collection, this.currentItem.uid)
    },
    openItem(item) {
      this.currentItem = item
      this.approvedAmount = String(item.amount || '').replace(/,/g, '')
      this.opinion = '材料核验无误，建议通过。'
      this.showDetail = true
    },
    approveItem() {
      if (!this.canAudit || this.submitting) return
      this.submitting = true
      const isCollege = this.profile.position === STAFF_POSITIONS.COLLEGE_LEADER
      const status = isCollege ? REVIEW_STATUS.FIRST_PASS : REVIEW_STATUS.PAYMENT_PENDING
      const node = isCollege ? '学院负责人审批' : '学工处审批'
      const result = isCollege ? '审批通过，转学工处复核' : '审批通过，待财务发放'
      const amountText = this.collection === 'aids' ? `；发放金额 ¥${this.approvedAmount}` : ''
      updateReview(this.collection, this.currentItem.uid, status, {
        node,
        result,
        remark: `${this.opinion}${amountText}`,
        approvedAmount: this.collection === 'aids' ? this.approvedAmount : undefined
      })
      this.refresh()
      this.submitting = false
      uni.showToast({ title: '审批状态已更新', icon: 'success' })
    },
    rejectItem() {
      if (!this.canAudit || this.submitting) return
      this.submitting = true
      updateReview(this.collection, this.currentItem.uid, REVIEW_STATUS.REJECTED, {
        node: this.profile.position === STAFF_POSITIONS.COLLEGE_LEADER ? '学院负责人审批' : '学工处审批',
        result: '已拒绝',
        remark: this.opinion || '申请未通过'
      })
      this.refresh()
      this.submitting = false
      uni.showToast({ title: '已拒绝', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.list { padding: 24rpx 28rpx 48rpx; }
.list > * + * { margin-top: 20rpx; }
.avatar, .detail-avatar { width: 80rpx; height: 80rpx; border-radius: var(--r-full); background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-15); font-weight: 600; flex-shrink: 0; }
.row-main { flex: 1; min-width: 0; }
.row-top { display: flex; justify-content: space-between; align-items: center; }
.name, .student-name { color: var(--N900); font-size: var(--fs-15); font-weight: 600; }
.meta, .student-meta { display: block; margin-top: 8rpx; color: var(--N500); font-size: var(--fs-12); }
.amount, .detail-amount { display: block; margin-top: 8rpx; color: var(--er); font-size: var(--fs-14); font-weight: 700; }
.detail > * + * { margin-top: 20rpx; }
.student-card { display: flex; align-items: center; padding: 20rpx 0; }
.student-main { flex: 1; margin-left: 20rpx; min-width: 0; }
.preview-entry { min-height: 88rpx; border-radius: var(--r-8); background: var(--N50); padding: 20rpx 24rpx; display: flex; align-items: center; }
.preview-body { flex: 1; min-width: 0; }
.preview-title { color: var(--N900); font-size: var(--fs-13); font-weight: 600; display: block; }
.preview-sub, .log-time, .log-remark { color: var(--N500); font-size: var(--fs-11); display: block; margin-top: 6rpx; }
.arrow { color: var(--N400); font-size: 32rpx; }
.field + .field { margin-top: 22rpx; }
.field-label { display: block; color: var(--N700); font-size: var(--fs-12); font-weight: 600; margin-bottom: 12rpx; }
.field-input, .textarea { box-sizing: border-box; width: 100%; border: 1px solid var(--N200); border-radius: var(--r-8); padding: 18rpx 22rpx; font-size: var(--fs-13); color: var(--N900); }
.textarea { min-height: 120rpx; }
.log { padding: 14rpx 0; border-bottom: 1px solid var(--N50); }
.log:last-child { border-bottom: none; }
.log-title { display: block; color: var(--N900); font-size: var(--fs-12); font-weight: 600; }
.actions { display: flex; }
.actions > * { flex: 1; }
.actions > * + * { margin-left: 20rpx; }
.material-file { margin-top: 20rpx; border-radius: var(--r-8); background: var(--N50); padding: 22rpx 24rpx; display: flex; justify-content: space-between; align-items: center; }
</style>
