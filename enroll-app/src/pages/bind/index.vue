<template>
  <view class="page">
    <view class="bind-container">
      <view class="bind-icon">🔗</view>
      <text class="bind-title">身份绑定</text>
      <text class="bind-desc">首次使用需绑定教职工身份</text>
      <view class="bind-form">
        <view class="form-item">
          <text class="form-label">工号</text>
          <input class="form-input" v-model="form.staffNo" placeholder="请输入工号" />
        </view>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="form.phone" placeholder="请输入手机号" />
        </view>
      </view>
      <view class="bind-btn" @click="onSubmit">提交绑定</view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'BindPage',
  data() {
    return {
      form: { staffNo: '', name: '', phone: '' }
    }
  },
  methods: {
    onSubmit() {
      uni.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/teacher/home/index' })
      }, 1000)
    }
  }
}
</script>
<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}
.bind-container {
  width: 100%;
  max-width: 600rpx;
  background: var(--white);
  border-radius: var(--r-14);
  padding: 60rpx 40rpx;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bind-container > view + view { margin-top: 24rpx; }
.bind-icon { font-size: 80rpx; }
.bind-title { font-size: var(--fs-18); font-weight: 700; color: var(--N900); }
.bind-desc { font-size: var(--fs-13); color: var(--N500); }
.bind-form {
  width: 100%;
  margin-top: 40rpx;
}
.bind-form > view + view { margin-top: 20rpx; }
.form-item {
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: var(--fs-13);
  color: var(--N700);
  font-weight: 500;
  margin-bottom: 8rpx;
}
.form-input {
  height: 80rpx;
  border: 1px solid var(--N200);
  border-radius: var(--r-8);
  padding: 0 20rpx;
  font-size: var(--fs-14);
  color: var(--N900);
  background: var(--N25);
}
.bind-btn {
  width: 100%;
  height: 88rpx;
  background: var(--brand);
  color: var(--white);
  font-size: var(--fs-15);
  font-weight: 600;
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
}
.bind-btn:active { opacity: 0.85; }
</style>
