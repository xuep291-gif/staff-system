<template>
  <view class="page">
    <SNavBar title="设置" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="sc">

        <!-- 用户信息卡片 -->
        <view class="user-card">
          <view class="user-avatar">{{ profile.name.charAt(0) }}</view>
          <view class="user-info">
            <text class="user-name">{{ profile.name }}</text>
            <text class="user-meta">工号 {{ profile.workNo }}</text>
            <text class="user-meta">财务 · {{ profile.departmentName || '收费管理' }}</text>
          </view>
        </view>

        <!-- 绑定手机号（未绑定状态时显示） -->
        <view class="card" v-if="!hasPhone">
          <view class="ch">
            <text class="ct">绑定手机号</text>
          </view>
          <view class="cb">
            <view class="frows">
              <view class="frow">
                <text class="flabel">手机号</text>
                <input class="finput" v-model="bindForm.phone" type="number" maxlength="11" placeholder="请输入手机号" />
              </view>
              <view class="frow">
                <text class="flabel">验证码</text>
                <view class="famt-row">
                  <input class="finput famt-in" v-model="bindForm.code" type="number" maxlength="6" placeholder="请输入验证码" />
                  <view class="sms-btn" :class="{ disabled: bindCodeSending }" @click="onSendBindCode">
                    <text>{{ bindCodeText }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="btn-wrap">
              <view class="btn-p" @click="onBindPhone">
                <text>绑定手机号</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 修改密码 -->
        <view class="card">
          <view class="ch">
            <text class="ct">修改密码</text>
          </view>
          <view class="cb">
            <view class="frows">
              <view class="frow">
                <text class="flabel">旧密码</text>
                <input class="finput" v-model="pwdForm.oldPwd" password placeholder="请输入旧密码" />
              </view>
              <view class="frow">
                <text class="flabel">新密码</text>
                <input class="finput" v-model="pwdForm.newPwd" password placeholder="6-20位字母或数字" />
              </view>
              <view class="frow">
                <text class="flabel">确认新密码</text>
                <input class="finput" v-model="pwdForm.confirmPwd" password placeholder="请再次输入新密码" />
              </view>
            </view>
            <view class="btn-wrap">
              <view class="btn-p" @click="onChangePwd">
                <text>修改密码</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 修改手机号 -->
        <view class="card" v-if="hasPhone">
          <view class="ch">
            <text class="ct">修改手机号</text>
          </view>
          <view class="cb">
            <view class="frows">
              <view class="frow">
                <text class="flabel">当前手机号</text>
                <text class="fval">{{ maskedPhone }}</text>
              </view>
              <view class="frow">
                <text class="flabel">验证码（发送至当前手机）</text>
                <view class="famt-row">
                  <input class="finput famt-in" v-model="phoneForm.oldCode" type="number" maxlength="6" placeholder="请输入验证码" />
                  <view class="sms-btn" :class="{ disabled: oldCodeSending }" @click="onSendOldCode">
                    <text>{{ oldCodeText }}</text>
                  </view>
                </view>
              </view>
              <view class="divider"></view>
              <view class="frow">
                <text class="flabel">新手机号</text>
                <input class="finput" v-model="phoneForm.newPhone" type="number" maxlength="11" placeholder="请输入新手机号" />
              </view>
              <view class="frow">
                <text class="flabel">验证码（发送至新手机）</text>
                <view class="famt-row">
                  <input class="finput famt-in" v-model="phoneForm.newCode" type="number" maxlength="6" placeholder="请输入验证码" />
                  <view class="sms-btn" :class="{ disabled: newCodeSending }" @click="onSendNewCode">
                    <text>{{ newCodeText }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="btn-wrap">
              <view class="btn-p" @click="onChangePhone">
                <text>修改手机号</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 退出登录 -->
        <view class="logout-btn" @click="onLogout">
          <text>退出登录</text>
        </view>

      </view>
    </scroll-view>

    <!-- 退出确认弹窗 -->
    <view v-if="showLogoutSheet" class="ovl on" @click="showLogoutSheet = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">退出登录</text>
        <view class="sbody2">
          <text class="smsg">确定要退出当前账号吗？退出后需要重新登录。</text>
          <view class="brow">
            <view class="btn-e" @click="showLogoutSheet = false">
              <text>取消</text>
            </view>
            <view class="btn-p" @click="confirmLogout">
              <text>确定退出</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import { authApi } from '@/common/api/auth.js'

export default {
  name: 'FinanceSettings',
  components: { SNavBar },
  data() {
    return {
      profile: { name: '财务', workNo: '', departmentName: '' },
      hasPhone: false,
      currentPhone: '',
      // 绑定手机号
      bindForm: { phone: '', code: '' },
      bindCodeText: '获取验证码',
      bindCodeSending: false,
      bindSmsToken: '',
      // 修改密码
      pwdForm: { oldPwd: '', newPwd: '', confirmPwd: '' },
      // 修改手机号
      phoneForm: { oldCode: '', newPhone: '', newCode: '' },
      oldCodeText: '获取验证码',
      oldCodeSending: false,
      oldSmsToken: '',
      newCodeText: '获取验证码',
      newCodeSending: false,
      newSmsToken: '',
      // 退出
      showLogoutSheet: false
    }
  },
  computed: {
    maskedPhone() {
      return this.currentPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  },
  async onShow() {
    const res = await authApi.getCurrentUser()
    if (res?.data?.code === 0) {
      this.profile = { ...this.profile, ...res.data.data }
      this.currentPhone = res.data.data.phone || ''
      this.hasPhone = !!this.currentPhone
    }
  },
  methods: {
    // ── 绑定手机号 ──
    async onSendBindCode() {
      if (this.bindCodeSending) return
      if (!this.bindForm.phone || this.bindForm.phone.length < 11) {
        return uni.showToast({ title: '请先输入正确的手机号', icon: 'none' })
      }
      const res = await authApi.sendSmsCode({ phone: this.bindForm.phone, scene: 'bind_phone' })
      if (res?.data?.code !== 0) return
      this.bindSmsToken = res.data.data.smsToken
      this.bindCodeSending = true
      this.startCountdown('bindCodeText', 'bindCodeSending')
    },
    async onBindPhone() {
      if (!this.bindForm.phone || !this.bindForm.code) {
        return uni.showToast({ title: '请填写完整信息', icon: 'none' })
      }
      const res = await authApi.bindPhone({ ...this.bindForm, smsToken: this.bindSmsToken })
      if (res?.data?.code !== 0) return
      this.hasPhone = true
      this.currentPhone = this.bindForm.phone
      uni.showToast({ title: '手机号绑定成功', icon: 'success' })
    },

    // ── 修改密码 ──
    async onChangePwd() {
      const { oldPwd, newPwd, confirmPwd } = this.pwdForm
      if (!oldPwd) return uni.showToast({ title: '请输入旧密码', icon: 'none' })
      if (!newPwd) return uni.showToast({ title: '请输入新密码', icon: 'none' })
      if (newPwd.length < 6) return uni.showToast({ title: '新密码至少6位', icon: 'none' })
      if (newPwd !== confirmPwd) return uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
      const res = await authApi.changePassword({ oldPassword: oldPwd, newPassword: newPwd })
      if (res?.data?.code !== 0) return
      this.pwdForm = { oldPwd: '', newPwd: '', confirmPwd: '' }
      uni.showToast({ title: '密码修改成功', icon: 'success' })
    },

    // ── 修改手机号 ──
    async onSendOldCode() {
      if (this.oldCodeSending) return
      const res = await authApi.sendSmsCode({ phone: this.currentPhone, scene: 'change_phone_old' })
      if (res?.data?.code !== 0) return
      this.oldSmsToken = res.data.data.smsToken
      this.oldCodeSending = true
      this.startCountdown('oldCodeText', 'oldCodeSending')
    },
    async onSendNewCode() {
      if (this.newCodeSending) return
      if (!this.phoneForm.newPhone || this.phoneForm.newPhone.length < 11) {
        return uni.showToast({ title: '请先输入正确的新手机号', icon: 'none' })
      }
      const res = await authApi.sendSmsCode({ phone: this.phoneForm.newPhone, scene: 'change_phone_new' })
      if (res?.data?.code !== 0) return
      this.newSmsToken = res.data.data.smsToken
      this.newCodeSending = true
      this.startCountdown('newCodeText', 'newCodeSending')
    },
    async onChangePhone() {
      const { oldCode, newPhone, newCode } = this.phoneForm
      if (!oldCode) return uni.showToast({ title: '请输入当前手机验证码', icon: 'none' })
      if (!newPhone) return uni.showToast({ title: '请输入新手机号', icon: 'none' })
      if (!newCode) return uni.showToast({ title: '请输入新手机验证码', icon: 'none' })
      const res = await authApi.changePhone({ ...this.phoneForm, oldSmsToken: this.oldSmsToken, newSmsToken: this.newSmsToken })
      if (res?.data?.code !== 0) return
      this.currentPhone = newPhone
      this.phoneForm = { oldCode: '', newPhone: '', newCode: '' }
      uni.showToast({ title: '手机号修改成功', icon: 'success' })
    },

    // ── 验证码倒计时 ──
    startCountdown(textKey, sendingKey) {
      let s = 60
      this[textKey] = s + 's后重发'
      const timer = setInterval(() => {
        s--
        if (s <= 0) {
          clearInterval(timer)
          this[textKey] = '获取验证码'
          this[sendingKey] = false
        } else {
          this[textKey] = s + 's后重发'
        }
      }, 1000)
    },

    // ── 退出登录 ──
    onLogout() {
      this.showLogoutSheet = true
    },
    async confirmLogout() {
      this.showLogoutSheet = false
      await authApi.logout()
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
      // #ifdef H5
      window.location.replace('/#/pages/login/index')
      // #endif
      // #ifndef H5
      uni.reLaunch({ url: '/pages/login/index' })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }

/* ── 用户信息卡片 ── */
.user-card {
  display: flex; align-items: center; padding: 28rpx;
  background: var(--white); border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
}
.user-avatar {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: var(--brand-t); color: var(--brand);
  font-size: 40rpx; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info { flex: 1; min-width: 0; margin-left: 24rpx; }
.user-info > * + * { margin-top: 4rpx; }
.user-name { font-size: var(--fs-16); font-weight: 700; color: var(--N900); display: block; }
.user-meta { font-size: var(--fs-11); color: var(--N500); display: block; }

/* ── Card ── */
.card {
  background: var(--white); border-radius: var(--r-14);
  border: 1px solid rgba(0,0,0,.07); box-shadow: var(--card-shadow);
  overflow: hidden;
}
.ch {
  padding: 24rpx 28rpx; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid var(--N50);
}
.ct { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.cb { padding: 24rpx 28rpx; }
.btn-wrap { margin-top: 24rpx; }

/* ── Form ── */
.frows { display: flex; flex-direction: column; }
.frows > * + * { margin-top: 24rpx; }
.frow { display: flex; flex-direction: column; }
.frow > * + * { margin-top: 8rpx; }
.flabel { font-size: var(--fs-13); font-weight: 600; color: var(--N700); }
.fval { font-size: var(--fs-14); color: var(--N900); padding: 20rpx 0; }
.finput {
  width: 100%; height: 88rpx; padding: 0 24rpx;
  border: 1.5px solid var(--N200); border-radius: 24rpx;
  font-size: var(--fs-14); color: var(--N900); background: var(--white);
  box-sizing: border-box;
}
.famt-row { display: flex; }
.famt-row > * + * { margin-left: 16rpx; }
.famt-in { flex: 1; }

/* ── SMS按钮 ── */
.sms-btn {
  height: 88rpx; padding: 0 24rpx; border-radius: 24rpx;
  background: var(--brand); color: #fff;
  font-size: var(--fs-13); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; white-space: nowrap;
}
.sms-btn:active { background: var(--brand-d); }
.sms-btn.disabled { background: var(--N200); color: var(--N400); }

/* ── 分割带 ── */
.divider {
  height: 1px; background: var(--N200);
  margin-left: -28rpx; margin-right: -28rpx;
}

/* ── 按钮 ── */
.btn-p {
  width: 100%; height: var(--btn-h); background: var(--brand); color: var(--white);
  border-radius: var(--btn-radius); font-size: var(--fs-14); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.btn-p:active { background: var(--brand-d); }

/* ── 退出登录按钮 ── */
.logout-btn {
  margin-top: 8rpx; height: var(--btn-h); border-radius: var(--btn-radius);
  background: var(--er-bg); color: var(--er);
  font-size: var(--fs-15); font-weight: 600;
  border: 1px solid var(--er-bd);
  display: flex; align-items: center; justify-content: center;
}
.logout-btn:active { background: var(--er); color: #fff; }

/* ── BottomSheet 退出确认 ── */
.ovl {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0,0,0,0); z-index: 300; visibility: hidden;
  transition: background .25s, visibility .25s;
}
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet {
  position: absolute; bottom: 0; left: 0; right: 0; background: #fff;
  border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx;
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.32,.72,0,1);
}
.ovl.on .sheet { transform: translateY(0); }
.shandle {
  width: 72rpx; height: 8rpx; background: var(--N200);
  border-radius: 4rpx; margin: 20rpx auto 0;
}
.stitle {
  font-size: var(--fs-16); font-weight: 600; color: var(--N900);
  padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50);
  display: block; text-align: center;
}
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
.btn-e {
  flex: 1; height: var(--btn-h); border-radius: var(--btn-radius);
  background: var(--er-bg); color: var(--er);
  font-size: var(--fs-15); font-weight: 600;
  border: 1px solid var(--er-bd);
  display: flex; align-items: center; justify-content: center;
}
.btn-e:active { background: var(--er); color: #fff; }
</style>
