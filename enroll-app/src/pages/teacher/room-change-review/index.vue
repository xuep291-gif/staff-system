<template>
  <view class="page">
    <SNavBar title="换宿审核详情" :showBack="true" />
    <scroll-view scroll-y class="body">
      <!-- 学生信息 -->
      <SCard v-if="item" title="学生信息" :padding="16">
        <SInfoRow label="学生姓名">{{ item.name || '—' }}</SInfoRow>
        <SInfoRow label="学号">{{ item.id || '—' }}</SInfoRow>
        <SInfoRow label="班级">{{ item.className || '—' }}</SInfoRow>
        <SInfoRow label="联系电话">{{ item.phone || '—' }}</SInfoRow>
      </SCard>

      <!-- 换宿信息 -->
      <SCard v-if="item" title="换宿信息" :padding="16">
        <SInfoRow label="原宿舍">{{ item.oldDorm || '—' }}</SInfoRow>
        <SInfoRow label="申请宿舍">{{ item.targetDorm || '—' }}</SInfoRow>
        <SInfoRow label="换宿原因">{{ item.reason || '—' }}</SInfoRow>
        <SInfoRow label="申请时间">{{ item.applyTime || '—' }}</SInfoRow>
        <SInfoRow label="审核状态">
          <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
        </SInfoRow>
      </SCard>

      <!-- 审核记录 -->
      <SCard v-if="item" title="审核记录" :padding="16">
        <view v-if="item.logs && item.logs.length">
          <view class="log" v-for="(log, index) in item.logs" :key="index">
            <text class="log-title">{{ log.action || log.result || log.node }}</text>
            <text class="log-meta">{{ log.operator || log.node || '系统' }} · {{ log.time }}</text>
            <text v-if="log.remark" class="log-remark">{{ log.remark }}</text>
          </view>
        </view>
        <SEmpty v-else text="暂无审核记录" />
      </SCard>

      <!-- 审核意见 -->
      <SCard v-if="item && item.status === pendingStatus" title="审核意见" :padding="16">
        <textarea v-model="remark" class="textarea" placeholder="请输入审核意见" placeholder-class="ph" />
      </SCard>

      <!-- 操作按钮 -->
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
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { DORM_REVIEW_STATUS, getDormReviewItem, updateReview } from '@/utils/businessState.js'
import { dormitoryApi } from '@/common/api/dormitory.js'

export default {
  name: 'TeacherRoomChangeReview',
  components: { SNavBar, SCard, SInfoRow, SBadge, SEmpty },
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

    // 1. 先从本地业务状态加载，保证立即有数据显示
    const localItem = getDormReviewItem('roomChanges', this.uid)
    if (localItem) {
      this.item = localItem
    }

    // 2. 再异步获取 API 最新数据
    try {
      const res = this.apiId ? await dormitoryApi.getRoomChangeDetail(this.apiId) : null
      if (res?.data?.code === 0 && res.data.data) {
        // 合并 API 数据到本地数据上
        const apiData = res.data.data
        this.item = {
          ...(localItem || {}),
          ...apiData,
          // 确保关键字段以本地数据为准（API 可能缺失）
          uid: this.uid,
          id: apiData.id || (localItem && localItem.id) || apiData.sid || '',
          name: apiData.name || (localItem && localItem.name) || '未知学生',
          className: apiData.className || (localItem && localItem.className) || '',
          phone: apiData.phone || (localItem && localItem.phone) || '',
          oldDorm: apiData.oldDorm || (localItem && localItem.oldDorm) || '—',
          targetDorm: apiData.targetDorm || (localItem && localItem.targetDorm) || '—',
          reason: apiData.reason || (localItem && localItem.reason) || '—',
          applyTime: apiData.applyTime || (localItem && localItem.applyTime) || '—',
          statusLabel: apiData.statusLabel || (localItem && localItem.statusLabel) || '',
          badgeColor: apiData.badgeColor || (localItem && localItem.badgeColor) || 'wa',
          logs: apiData.logs || (localItem && localItem.logs) || [],
          status: apiData.status || (localItem && localItem.status) || DORM_REVIEW_STATUS.PENDING
        }
      }
    } catch (e) {
      // API 失败，继续使用本地数据
    }
  },
  methods: {
    async submit(type) {
      const status = type === 'approved' ? DORM_REVIEW_STATUS.APPROVED : DORM_REVIEW_STATUS.REJECTED
      try {
        const action = type === 'approved' ? dormitoryApi.approveRoomChange : dormitoryApi.rejectRoomChange
        await action(this.apiId, { remark: this.remark || (type === 'approved' ? '同意换宿申请' : '不符合换宿条件') })
      } catch (e) {
        // API 调用失败也继续更新本地状态
      }
      updateReview('roomChanges', this.uid, status, {
        action: type === 'approved' ? '换宿审核通过' : '换宿审核驳回',
        operator: '班主任',
        remark: this.remark || (type === 'approved' ? '同意换宿申请' : '不符合换宿条件')
      })
      // 刷新本地数据
      const updated = getDormReviewItem('roomChanges', this.uid)
      if (updated) this.item = updated
      uni.showToast({ title: type === 'approved' ? '已通过' : '已驳回', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 450)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding: 28rpx; box-sizing: border-box; }
.body > view + view { margin-top: 20rpx; }
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
.actions > view + view { margin-left: 20rpx; }
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
