<template>
  <view class="page">
    <SNavBar title="现场收款登记" :showBack="true" />
    <SCard title="收款信息">
      <view class="field">
        <text class="label">学生学号</text>
        <input class="input" v-model.trim="form.sid" placeholder="请输入学号" />
      </view>
      <view class="field">
        <text class="label">收款金额</text>
        <input class="input" type="digit" v-model.trim="form.amount" placeholder="请输入实际收款金额" />
      </view>
      <view class="field">
        <text class="label">支付方式</text>
        <picker :range="methods" :value="methodIndex" @change="selectMethod">
          <view class="input select">
            <text>{{ form.method }}</text><text class="arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="field">
        <text class="label">现场凭证</text>
        <view class="upload" @click="selectVoucher">
          <text>{{ form.voucher || '上传收款凭证' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <SButton variant="primary" block :disabled="submitting" @click="submit">提交登记</SButton>
    </SCard>
    <SAlertBar v-if="submitted" type="success" message="账单状态已立即更新，记录已进入财务待确认；内部确认不阻塞放行。" />
    <SCard v-if="record" title="本次登记结果">
      <SInfoRow label="学生">{{ record.name }}（{{ record.studentNo }}）</SInfoRow>
      <SInfoRow label="收款金额"><text class="amount">¥{{ Number(record.amount).toLocaleString() }}</text></SInfoRow>
      <SInfoRow label="状态"><SBadge color="wa">待财务确认</SBadge></SInfoRow>
    </SCard>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SButton from '@/components/shared/SButton.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { getOfflineCollectionList, registerOnsiteCollection } from '@/utils/businessState.js'
import { getStaffProfile, guardStaffFeature } from '@/utils/staffAccess.js'

export default {
  name: 'OrientationOnsite',
  components: { SNavBar, SCard, SButton, SAlertBar, SInfoRow, SBadge },
  data() {
    return {
      methods: ['现金', '银行卡', '微信', '支付宝'],
      form: { sid: '', amount: '', method: '现金', voucher: '' },
      submitted: false,
      submitting: false,
      record: null
    }
  },
  computed: {
    methodIndex() {
      const index = this.methods.indexOf(this.form.method)
      return index >= 0 ? index : 0
    }
  },
  onLoad() {
    guardStaffFeature('onsite')
  },
  methods: {
    selectMethod(event) {
      this.form.method = this.methods[Number(event.detail.value) || 0]
    },
    selectVoucher() {
      this.form.voucher = '现场收款凭证.jpg'
      uni.showToast({ title: '凭证已选择', icon: 'success' })
    },
    submit() {
      if (this.submitting) return
      if (!this.form.sid || !this.form.amount || !this.form.voucher) {
        uni.showToast({ title: '请完整填写并上传凭证', icon: 'none' })
        return
      }
      this.submitting = true
      const result = registerOnsiteCollection({
        ...this.form,
        submittedBy: getStaffProfile().name
      })
      this.submitting = false
      if (!result) {
        uni.showToast({ title: '未找到该学生账单', icon: 'none' })
        return
      }
      if (result.duplicated) {
        uni.showToast({ title: '已有待确认登记，不可重复提交', icon: 'none' })
        return
      }
      this.record = getOfflineCollectionList().find(item => item.id === result.id)
      this.submitted = true
      uni.showToast({ title: '登记成功', icon: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 48rpx; }
.field { margin-bottom: 24rpx; }
.label { display: block; margin-bottom: 12rpx; color: var(--N700); font-size: var(--fs-12); font-weight: 600; }
.input, .upload { box-sizing: border-box; min-height: 80rpx; width: 100%; border: 1px solid var(--N200); border-radius: var(--r-8); padding: 18rpx 22rpx; color: var(--N900); font-size: var(--fs-13); background: var(--white); }
.select, .upload { display: flex; align-items: center; justify-content: space-between; }
.arrow { color: var(--N400); font-size: 30rpx; }
.amount { color: var(--er); font-weight: 700; }
</style>
