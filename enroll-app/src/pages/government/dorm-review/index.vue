<template>
  <view class="page">
    <SNavBar title="换房审批详情" :showBack="true" />
    <scroll-view scroll-y class="body">
      <SCard v-if="item" title="学生信息">
        <SInfoRow label="学生姓名" :value="item.name" />
        <SInfoRow label="学号" :value="item.id" copyable />
        <SInfoRow label="班级" :value="item.className" />
        <SInfoRow label="联系电话" :value="item.phone" />
      </SCard>

      <SCard v-if="item" title="换宿信息">
        <SInfoRow label="原宿舍" :value="item.oldDorm" />
        <SInfoRow label="申请宿舍" :value="item.targetDorm" />
        <SInfoRow label="换宿原因" :value="item.reason" />
        <SInfoRow label="申请时间" :value="item.applyTime" />
        <SInfoRow label="审核状态" :value="item.statusLabel" />
      </SCard>

      <SCard v-if="item" title="审核记录">
        <view v-if="item.logs && item.logs.length">
          <view class="log" v-for="(log, index) in item.logs" :key="index">
            <text class="log-title">{{ log.action || log.result || log.node }}</text>
            <text class="log-meta">{{ log.operator || log.node || '系统' }} · {{ log.time }}</text>
            <text v-if="log.remark" class="log-remark">{{ log.remark }}</text>
          </view>
        </view>
        <SEmpty v-else text="暂无审核记录" />
      </SCard>

      <SCard v-if="item && item.status === pendingStatus" title="政审意见">
        <textarea v-model="remark" class="textarea" placeholder="请输入审批意见" placeholder-class="ph" />
      </SCard>

      <view v-if="item && item.status === pendingStatus" class="actions">
        <view class="btn reject" @click="submit('rejected')">驳回</view>
        <view class="btn pass" @click="submit('approved')">通过</view>
      </view>

      <SEmpty v-if="!item" text="未找到换宿申请" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { DORM_REVIEW_STATUS, getDormReviewItem, updateReview } from '@/utils/businessState.js'
import { dormitoryApi } from '@/common/api/dormitory.js'

export default {
  name: 'GovernmentDormReview',
  components: { SNavBar, SCard, SInfoRow, SEmpty },
  data() {
    return {
      uid: '',
      apiId: '',
      item: null,
      remark: '',
      pendingStatus: DORM_REVIEW_STATUS.PENDING
    }
  },
  async onLoad(query) {
    this.uid = query.uid || ''
    this.apiId = query.apiId || this.uid
    await this.refresh()
  },
  methods: {
    async refresh() {
      const res = this.apiId ? await dormitoryApi.getRoomChangeDetail(this.apiId) : null
      this.item = res?.data?.code === 0 ? res.data.data : getDormReviewItem('roomChanges', this.uid)
    },
    async submit(type) {
      const status = type === 'approved' ? DORM_REVIEW_STATUS.APPROVED : DORM_REVIEW_STATUS.REJECTED
      const action = type === 'approved' ? dormitoryApi.approveRoomChange : dormitoryApi.rejectRoomChange
      await action(this.apiId, { remark: this.remark || (type === 'approved' ? '同意换宿申请' : '不符合换宿条件') })
      updateReview('roomChanges', this.uid, status, {
        action: type === 'approved' ? '政审通过' : '政审批驳',
        operator: '政务处',
        remark: this.remark || (type === 'approved' ? '同意换宿申请' : '不符合换宿条件')
      })
      await this.refresh()
      uni.showToast({ title: type === 'approved' ? '已通过' : '已驳回', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 450)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding: 28rpx; box-sizing: border-box; }
.body > * + * { margin-top: 20rpx; }
.log { padding: 20rpx 0; border-bottom: 1px solid var(--N100); }
.log:last-child { border-bottom: none; }
.log-title { display: block; font-size: var(--fs-13); color: var(--N900); font-weight: 600; }
.log-meta,
.log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-11); color: var(--N500); line-height: 1.5; }
.textarea {
  width: 100%;
  min-height: 180rpx;
  box-sizing: border-box;
  padding: 20rpx;
  border-radius: var(--r-8);
  background: var(--N50);
  font-size: var(--fs-13);
  color: var(--N900);
}
.ph { color: var(--N400); }
.actions { display: flex; padding-bottom: 32rpx; }
.actions > * + * { margin-left: 20rpx; }
.btn {
  flex: 1;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-15);
  font-weight: 700;
}
.btn:active { transform: scale(.99); }
.reject { background: var(--er-bg); color: var(--er); border: 1px solid var(--er-bd); }
.pass { background: var(--brand); color: var(--white); }
</style>
