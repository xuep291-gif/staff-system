<template>
  <view class="page">
    <SNavBar title="现场收款登记" :showBack="true" />

    <scroll-view scroll-y class="body">
      <!-- 学生查找区 -->
      <view class="search-card">
        <view class="search-row">
          <input
            class="search-input"
            v-model="keyword"
            placeholder="输入学号或姓名搜索学生"
            confirm-type="search"
            @confirm="lookupStudent"
          />
          <view class="search-clear" v-if="keyword" @click="clearStudent">
            <text>✕</text>
          </view>
        </view>
        <view class="search-actions">
          <view class="btn-scan" @click="onScan">
            <text class="scan-icon">📷</text>
            <text>扫码获取</text>
          </view>
          <view class="btn-lookup" @click="lookupStudent">
            <text>查找</text>
          </view>
        </view>
      </view>

      <SEmpty v-if="lookedUp && !student && !searchResults.length" text="未找到匹配的学生账单，请检查输入" />
      <SEmpty v-if="lookedUp && searchResults.length > 1 && !student" text="请从下方列表选择学生" />

      <!-- 多结果选择列表 -->
      <view class="result-list" v-if="searchResults.length > 1 && !student">
        <view
          class="result-item"
          v-for="item in searchResults"
          :key="item.studentNo"
          @click="selectStudent(item)"
        >
          <view class="result-avatar">{{ item.studentName.charAt(0) }}</view>
          <view class="result-body">
            <view class="result-top">
              <text class="result-name">{{ item.studentName }}</text>
              <text class="result-no">{{ item.studentNo }}</text>
            </view>
            <text class="result-meta">{{ item.college }} · {{ item.major }} · {{ item.className }}</text>
          </view>
          <view class="result-right">
            <SStatusTag :type="item.paymentStatusColor" customStyle="font-size: var(--fs-10); padding: 4rpx 12rpx">{{ item.paymentStatusLabel }}</SStatusTag>
            <text class="result-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 学生信息（只读） -->
      <view class="card" v-if="student">
        <text class="card-title">学生信息</text>
        <view class="info-grid">
          <SInfoRow label="姓名">{{ student.name || student.studentName }}</SInfoRow>
          <SInfoRow label="学号">{{ student.studentNo || student.sid }}</SInfoRow>
          <SInfoRow label="学院">{{ student.college || '—' }}</SInfoRow>
          <SInfoRow label="专业">{{ student.major || '—' }}</SInfoRow>
          <SInfoRow label="班级">{{ student.className || '—' }}</SInfoRow>
        </view>
      </view>

      <!-- 账单信息（只读） -->
      <view class="card" v-if="student">
        <text class="card-title">账单信息</text>
        <view class="info-grid">
          <SInfoRow label="学年">{{ feeInfo.schoolYear }}</SInfoRow>
          <SInfoRow label="收费项目">{{ feeInfo.chargeItem }}</SInfoRow>
          <SInfoRow label="应缴金额">¥{{ fmt(feeInfo.receivableAmount) }}</SInfoRow>
          <SInfoRow label="已缴金额"><text class="val-ok">¥{{ fmt(feeInfo.paidAmount) }}</text></SInfoRow>
          <SInfoRow label="未缴金额"><text :class="feeInfo.unpaidAmount > 0 ? 'val-er' : ''">¥{{ fmt(feeInfo.unpaidAmount) }}</text></SInfoRow>
          <SInfoRow label="缴费状态">
            <SStatusTag :type="feeInfo.statusColor">{{ feeInfo.statusLabel }}</SStatusTag>
          </SInfoRow>
        </view>
      </view>

      <!-- 收款表单 -->
      <view class="card" v-if="student">
        <text class="card-title">收款登记</text>

        <view class="form-item">
          <text class="fi-label">本次收款金额 <text class="required">*</text></text>
          <view class="amount-row">
            <text class="amount-symbol">¥</text>
            <input
              class="amount-input"
              v-model="form.amount"
              type="digit"
              placeholder="请输入金额"
              @blur="validateAmount"
            />
          </view>
          <text class="fi-hint" v-if="feeInfo.unpaidAmount > 0">欠费 ¥{{ fmt(feeInfo.unpaidAmount) }}，本次收款不应超过此金额</text>
          <text class="fi-error" v-if="amountError">{{ amountError }}</text>
        </view>

        <view class="form-item">
          <text class="fi-label">收款方式 <text class="required">*</text></text>
          <view class="method-grid">
            <view
              v-for="m in payMethods"
              :key="m.key"
              class="method-item"
              :class="{ 'method-on': form.payMethod === m.key }"
              @click="form.payMethod = m.key"
            >
              <text>{{ m.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="fi-label">上传凭证 <text class="optional">(可选，最多3张)</text></text>
          <SUploadGrid v-model="voucherFiles" :maxCount="3" :removable="true" />
        </view>

        <view class="form-item">
          <text class="fi-label">备注</text>
          <input
            class="fi-input"
            v-model="form.remark"
            placeholder="选填备注信息"
          />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-area" v-if="student">
        <view class="btn-submit" :class="{ 'btn-disabled': submitting }" @click="onSubmit">
          <text>{{ submitting ? '提交中…' : '确认登记' }}</text>
        </view>
        <text class="submit-hint">提交后账单状态立即更新，财务确认不阻塞迎新流程</text>
      </view>

      <!-- 成功页面 -->
      <view class="success-card" v-if="showSuccess">
        <text class="success-icon">✅</text>
        <text class="success-title">登记成功</text>
        <text class="success-desc">{{ successMsg }}</text>
        <view class="success-info">
          <text class="si-item">学生：{{ successData.studentName }}</text>
          <text class="si-item">金额：¥{{ fmt(successData.amount) }}</text>
          <text class="si-item">当前状态：{{ successData.newStatus }}</text>
        </view>
        <view class="success-actions">
          <view class="btn-outline" @click="resetForNext">
            <text>继续登记下一位</text>
          </view>
          <view class="btn-primary" @click="goBack">
            <text>返回</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SStatusTag from '@/components/shared/SStatusTag.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SUploadGrid from '@/components/shared/SUploadGrid.vue'
import { getStudentBill, searchStudentBill, getFeeList, getOfflineCollectionList, generateReceiptNumber } from '@/utils/businessState.js'

export default {
  name: 'FinanceOnsite',
  components: { SNavBar, SEmpty, SStatusTag, SInfoRow, SUploadGrid },
  data() {
    return {
      keyword: '',
      lookedUp: false,
      searchResults: [],
      student: null,
      billInfo: null,
      feeInfo: { billId: '', schoolYear: '', chargeItem: '', receivableAmount: 0, paidAmount: 0, unpaidAmount: 0, statusLabel: '—', statusColor: 'wa' },
      form: {
        amount: '',
        payMethod: 'wechat',
        voucherPath: '',
        remark: ''
      },
      voucherFiles: [],
      payMethods: [
        { key: 'wechat', label: '微信' },
        { key: 'alipay', label: '支付宝' },
        { key: 'cash', label: '现金' },
        { key: 'pos', label: 'POS机' },
        { key: 'bank', label: '银行转账' },
        { key: 'other', label: '其他' }
      ],
      amountError: '',
      submitting: false,
      showSuccess: false,
      successMsg: '',
      successData: {}
    }
  },
  onLoad(options) {
    if (options.keyword || options.studentNo) {
      this.keyword = options.keyword || options.studentNo
      this.lookupStudent()
    }
  },
  methods: {
    onScan() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
        success: (res) => {
          const code = res.result || ''
          this.keyword = code
          this.lookupStudent()
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) return
          uni.showToast({ title: '扫码失败，请手动输入学号', icon: 'none' })
        }
      })
    },

    lookupStudent() {
      const kw = this.keyword.trim()
      this.lookedUp = true
      this.searchResults = []
      if (!kw) {
        uni.showToast({ title: '请输入学号或姓名', icon: 'none' })
        return
      }

      // 先尝试精确学号匹配
      const exactBill = getStudentBill(kw)
      if (exactBill) {
        this.showBillDetail(exactBill)
        return
      }

      // 模糊搜索（按姓名或学号包含）
      const results = searchStudentBill(kw)
      if (results.length === 0) {
        this.student = null
        this.billInfo = null
        return
      }

      if (results.length === 1) {
        this.showBillDetail(results[0])
        return
      }

      // 多个匹配结果 → 显示选择列表
      this.student = null
      this.billInfo = null
      this.searchResults = results
    },

    selectStudent(item) {
      this.showBillDetail(item)
      this.searchResults = []
    },

    showBillDetail(bill) {
      this.student = {
        name: bill.studentName,
        studentNo: bill.studentNo,
        sid: bill.studentNo,
        college: bill.college,
        major: bill.major,
        className: bill.className
      }
      this.billInfo = bill
      this.feeInfo = {
        billId: bill.billId,
        schoolYear: bill.schoolYear,
        chargeItem: bill.chargeItem,
        receivableAmount: bill.totalAmount,
        paidAmount: bill.paidAmount,
        unpaidAmount: bill.unpaidAmount,
        statusLabel: bill.paymentStatusLabel,
        statusColor: bill.paymentStatusColor,
        isGreenChannel: bill.isGreenChannel
      }
      this.amountError = ''
      this.showSuccess = false
    },

    clearStudent() {
      this.keyword = ''
      this.student = null
      this.billInfo = null
      this.searchResults = []
      this.lookedUp = false
      this.feeInfo = { billId: '', schoolYear: '', chargeItem: '', receivableAmount: 0, paidAmount: 0, unpaidAmount: 0, statusLabel: '—', statusColor: 'wa' }
      this.amountError = ''
      this.showSuccess = false
    },

    validateAmount() {
      const amt = Number(this.form.amount)
      if (!this.form.amount || amt <= 0) {
        this.amountError = '收款金额必须大于 0'
        return false
      }
      if (amt > this.feeInfo.unpaidAmount && this.feeInfo.unpaidAmount > 0) {
        this.amountError = `收款金额不能超过欠费金额 ¥${this.fmt(this.feeInfo.unpaidAmount)}`
        return false
      }
      this.amountError = ''
      return true
    },

    onUpload() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: (res) => {
          this.form.voucherPath = res.tempFilePaths[0]
        }
      })
    },

    onSubmit() {
      if (!this.student) return uni.showToast({ title: '请先查找学生', icon: 'none' })
      if (!this.form.amount || Number(this.form.amount) <= 0) {
        this.amountError = '请输入有效金额'
        return uni.showToast({ title: '请输入有效金额', icon: 'none' })
      }
      if (!this.validateAmount()) return
      if (!this.form.payMethod) return uni.showToast({ title: '请选择收款方式', icon: 'none' })

      this.submitting = true
      const amount = Number(this.form.amount)
      const bill = this.billInfo || getStudentBill(this.student.sid)

      // Simulate brief network delay (mock API call)
      setTimeout(() => {
        // Update fee state in businessState
        const fees = getFeeList()
        const fee = fees.find(f => f.sid === this.student.sid || f.studentNo === this.student.sid)
        if (fee) {
          fee.paidAmount = (fee.paidAmount || 0) + amount
          fee.dueAmount = Math.max((fee.expectedAmount || 0) - fee.paidAmount, 0)
          if (fee.dueAmount <= 0) {
            fee.payStatus = 'paid'
            fee.dueAmount = 0
            fee.statusLabel = '已缴'
            fee.statusColor = 'ok'
          } else if (fee.paidAmount > 0) {
            fee.payStatus = 'partial'
            fee.statusLabel = '部分未缴'
            fee.statusColor = 'wa'
          }
          fee.lastPaymentTime = this.nowText()
          uni.setStorageSync('enroll_mobile_business_v2_fees', JSON.stringify(fees))
        }

        // Add offline collection record with bill info
        const collections = getOfflineCollectionList()
        collections.unshift({
          id: `off-${Date.now()}`,
          sid: this.student.sid,
          studentNo: this.student.sid,
          name: this.student.name,
          avatar: (this.student.name || '?').charAt(0),
          amount,
          method: this.payMethods.find(m => m.key === this.form.payMethod)?.label || this.form.payMethod,
          location: '迎新现场',
          time: this.nowText(),
          collectionType: this.form.payMethod,
          confirmTime: '',
          receiptNo: '',
          status: 'pending',
          billId: bill ? bill.billId : '',
          schoolYear: bill ? bill.schoolYear : '',
          chargeItem: bill ? bill.chargeItem : '',
          remark: this.form.remark || ''
        })
        uni.setStorageSync('enroll_mobile_business_v2_offlineCollections', JSON.stringify(collections))

        const newStatus = fee ? fee.statusLabel : '—'
        this.showSuccess = true
        this.submitting = false
        this.successMsg = `已成功登记 ¥${this.fmt(amount)}，账单状态更新为「${newStatus}」`
        this.successData = {
          studentName: this.student.name,
          amount,
          newStatus
        }

        // Refresh local fee info
        this.feeInfo.paidAmount = fee ? (fee.paidAmount || 0) : this.feeInfo.paidAmount
        this.feeInfo.unpaidAmount = fee ? (fee.dueAmount || 0) : this.feeInfo.unpaidAmount
        this.feeInfo.statusLabel = fee ? fee.statusLabel : this.feeInfo.statusLabel
        this.feeInfo.statusColor = fee ? fee.statusColor : this.feeInfo.statusColor
      }, 300)
    },

    resetForNext() {
      this.showSuccess = false
      this.keyword = ''
      this.student = null
      this.billInfo = null
      this.searchResults = []
      this.lookedUp = false
      this.feeInfo = { billId: '', schoolYear: '', chargeItem: '', receivableAmount: 0, paidAmount: 0, unpaidAmount: 0, statusLabel: '—', statusColor: 'wa' }
      this.form = { amount: '', payMethod: 'wechat', voucherPath: '', remark: '' }
      this.voucherFiles = []
      this.amountError = ''
    },

    goBack() {
      uni.navigateBack()
    },

    nowText() {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    fmt(v) {
      return Number(v || 0).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
}

.body {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  > * + * { margin-top: 20rpx; }
}

/* 搜索卡片 */
.search-card {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 24rpx;
  box-shadow: var(--card-shadow);
}

.search-row {
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 84rpx;
  padding: 0 20rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  font-size: var(--fs-15);
  color: var(--N900);
  background: var(--N25);
}

.search-clear {
  width: 48rpx;
  height: 48rpx;
  border-radius: var(--r-full);
  background: var(--N200);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
  flex-shrink: 0;
  font-size: var(--fs-12);
  color: var(--N500);
}
.search-clear:active { background: var(--N400); }

.search-actions {
  display: flex;
  margin-top: 16rpx;
  > * + * { margin-left: 16rpx; }
}

.btn-scan {
  flex: 1;
  height: 80rpx;
  background: var(--N25);
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-14);
  color: var(--N700);
  font-weight: 600;
}
.btn-scan:active { background: var(--N50); }
.scan-icon { margin-right: 8rpx; }

.btn-lookup {
  flex: 1;
  height: 80rpx;
  background: var(--brand);
  border-radius: var(--r-10);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-15);
  font-weight: 600;
}
.btn-lookup:active { background: var(--brand-d); }

/* 多结果选择列表 */
.result-list {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.result-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1px solid var(--N50);
  > * + * { margin-left: 20rpx; }
}
.result-item:last-child { border-bottom: none; }
.result-item:active { background: var(--N25); }
.result-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--r-full);
  background: var(--brand-t);
  color: var(--brand);
  font-size: var(--fs-14);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.result-body { flex: 1; min-width: 0; }
.result-top {
  display: flex;
  align-items: baseline;
}
.result-name {
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--N900);
  margin-right: 12rpx;
}
.result-no {
  font-size: var(--fs-11);
  color: var(--N500);
}
.result-meta {
  font-size: var(--fs-11);
  color: var(--N400);
  display: block;
  margin-top: 4rpx;
}
.result-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  > * + * { margin-top: 4rpx; }
}
.result-arrow {
  font-size: 28rpx;
  color: var(--N400);
}

/* 信息卡片 */
.card {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 28rpx;
  box-shadow: var(--card-shadow);
  > * + * { margin-top: 20rpx; }
}

.card-title {
  font-size: var(--fs-15);
  font-weight: 700;
  color: var(--N900);
  display: block;
}

.info-grid {
  > * + * { margin-top: 12rpx; }
}

.val-ok { color: var(--ok); font-weight: 700; }
.val-er { color: var(--er); font-weight: 700; }

/* 表单 */
.form-item {
  display: flex;
  flex-direction: column;
  > * + * { margin-top: 8rpx; }
}

.fi-label {
  font-size: var(--fs-12);
  color: var(--N700);
  font-weight: 600;
}

.required { color: var(--er); }
.optional { color: var(--N400); font-weight: 400; }

.amount-row {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  background: var(--N25);
  padding: 0 16rpx;
}

.amount-symbol {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--N900);
  margin-right: 8rpx;
}

.amount-input {
  flex: 1;
  height: 84rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--N900);
}

.fi-hint {
  font-size: var(--fs-10);
  color: var(--N400);
  padding-left: 4rpx;
}

.fi-error {
  font-size: var(--fs-11);
  color: var(--er);
  padding-left: 4rpx;
}

.fi-input {
  height: 80rpx;
  padding: 0 20rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  font-size: var(--fs-14);
  color: var(--N900);
  background: var(--N25);
}

/* 收款方式 */
.method-grid {
  display: flex;
  flex-wrap: wrap;
  > * { margin-right: 16rpx; margin-bottom: 12rpx; }
}

.method-item {
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: var(--r-8);
  border: 1.5px solid var(--N200);
  background: var(--white);
  font-size: var(--fs-13);
  color: var(--N700);
  display: flex;
  align-items: center;
  justify-content: center;
}
.method-item:active { background: var(--N50); }
.method-on {
  border-color: var(--brand);
  background: var(--brand-t);
  color: var(--brand);
  font-weight: 600;
}

/* 上传 */
.upload-area {
  height: 160rpx;
  border: 2rpx dashed var(--N200);
  border-radius: var(--r-10);
  background: var(--N25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-area:active { background: var(--N50); }

.upload-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: var(--fs-12);
  color: var(--N500);
}

.preview-row {
  position: relative;
  display: inline-block;
}

.preview-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: var(--r-10);
}

.preview-del {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--r-full);
  background: var(--er);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-11);
}

/* 提交 */
.submit-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-submit {
  width: 100%;
  height: 96rpx;
  background: var(--brand);
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-16);
  font-weight: 600;
}
.btn-submit:active { background: var(--brand-d); }
.btn-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.submit-hint {
  margin-top: 12rpx;
  font-size: var(--fs-10);
  color: var(--N400);
  text-align: center;
}

/* 成功页 */
.success-card {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 48rpx 32rpx;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  > * + * { margin-top: 16rpx; }
}

.success-icon { font-size: 64rpx; }

.success-title {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--N900);
}

.success-desc {
  font-size: var(--fs-13);
  color: var(--N500);
  line-height: 1.5;
}

.success-info {
  background: var(--N25);
  border-radius: var(--r-10);
  padding: 20rpx 24rpx;
  width: 100%;
  text-align: left;
  > * + * { margin-top: 8rpx; }
}

.si-item {
  font-size: var(--fs-13);
  color: var(--N700);
  display: block;
}

.success-actions {
  display: flex;
  width: 100%;
  margin-top: 24rpx;
  > * + * { margin-left: 16rpx; }
}

.btn-primary {
  flex: 1;
  height: 88rpx;
  background: var(--brand);
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-15);
  font-weight: 600;
}
.btn-primary:active { background: var(--brand-d); }

.btn-outline {
  flex: 1;
  height: 88rpx;
  background: var(--white);
  border: 1.5px solid var(--brand);
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  font-size: var(--fs-14);
  font-weight: 600;
}
.btn-outline:active { background: var(--brand-t); }
</style>
