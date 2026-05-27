<template>
  <view class="page">
    <SNavBar title="学生缴费核验" :showBack="true" />
    <SCard title="查询学生">
      <SSearchBar v-model="studentNo" placeholder="输入学号查询缴费状态" />
      <view class="query-actions">
        <SButton variant="secondary" @click="scanCode">扫码查询</SButton>
        <SButton variant="primary" @click="searchStudent">查询</SButton>
      </view>
    </SCard>
    <SCard v-if="result" title="核验结果">
      <SInfoRow label="学生姓名">{{ result.name }}</SInfoRow>
      <SInfoRow label="学号">{{ result.studentNo }}</SInfoRow>
      <SInfoRow label="学院班级">{{ result.college }} {{ result.className }}</SInfoRow>
      <SInfoRow label="缴费状态"><SBadge :color="result.statusColor">{{ result.statusLabel }}</SBadge></SInfoRow>
      <SInfoRow label="欠费金额"><text class="amount">¥{{ formatAmount(result.dueAmount) }}</text></SInfoRow>
      <SInfoRow label="绿色通道">{{ result.payStatus === 'channel' ? '已开通' : '未开通' }}</SInfoRow>
      <SAlertBar :type="canRelease ? 'success' : 'warning'" :message="releaseMessage" />
    </SCard>
    <SEmpty v-else-if="searched" text="未找到对应学生缴费信息" />
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SSearchBar from '@/components/shared/SSearchBar.vue'
import SButton from '@/components/shared/SButton.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getFeeList } from '@/utils/businessState.js'
import { guardStaffFeature } from '@/utils/staffAccess.js'

export default {
  name: 'OrientationVerify',
  components: { SNavBar, SCard, SSearchBar, SButton, SInfoRow, SBadge, SAlertBar, SEmpty },
  data() {
    return { studentNo: '', result: null, searched: false }
  },
  computed: {
    canRelease() {
      return this.result && ['paid', 'channel'].includes(this.result.payStatus)
    },
    releaseMessage() {
      return this.canRelease ? '缴费核验通过，可以办理报到放行。' : '存在待缴金额，请引导完成缴费或绿色通道办理。'
    }
  },
  onLoad() {
    guardStaffFeature('verify')
  },
  methods: {
    searchStudent() {
      this.searched = true
      this.result = getFeeList().find(item => item.studentNo === this.studentNo.trim()) || null
    },
    scanCode() {
      uni.showToast({ title: '演示环境请输入学号', icon: 'none' })
    },
    formatAmount(value) {
      return Number(value || 0).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 48rpx; }
.query-actions { display: flex; margin-top: 24rpx; }
.query-actions > * { flex: 1; }
.query-actions > * + * { margin-left: 20rpx; }
.amount { color: var(--er); font-size: var(--fs-14); font-weight: 700; }
</style>
