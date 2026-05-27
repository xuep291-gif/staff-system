<template>
  <view class="page">
    <SNavBar title="宿舍详情" :showBack="true" />
    <scroll-view scroll-y class="body">
      <SCard v-if="student" title="学生信息">
        <SInfoRow label="学生姓名" :value="student.name" />
        <SInfoRow label="学号" :value="student.sid" copyable />
        <SInfoRow label="班级" :value="student.className" />
        <SInfoRow label="联系电话" :value="student.phone" clickable @click="callPhone(student.phone)" />
      </SCard>

      <SCard v-if="student" title="宿舍信息">
        <SInfoRow label="宿舍楼" :value="dorm.building" />
        <SInfoRow label="房间号" :value="dorm.room" />
        <SInfoRow label="床位号" :value="dorm.bed" />
      </SCard>

      <SEmpty v-if="!student" text="未找到学生宿舍信息" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getStudent } from '@/utils/businessState.js'
import { dormitoryApi } from '@/common/api/dormitory.js'

function parseDorm(dorm) {
  const parts = String(dorm || '').split(/\s+/).filter(Boolean)
  return {
    building: parts[0] || '未分配',
    room: parts[1] || '-',
    bed: parts[2] || '-'
  }
}

export default {
  name: 'TeacherDormDetail',
  components: { SNavBar, SCard, SInfoRow, SEmpty },
  data() {
    return {
      student: null,
      dorm: parseDorm('')
    }
  },
  async onLoad(query) {
    const localStudent = getStudent(query.sid)
    const res = await dormitoryApi.getStudentDormSelection(query.id || query.sid)
    const apiStudent = res?.data?.code === 0 ? res.data.data : null
    this.student = apiStudent
      ? { ...localStudent, ...apiStudent, sid: apiStudent.sid || query.sid, phone: apiStudent.phone || localStudent?.phone }
      : localStudent
    this.dorm = apiStudent
      ? { building: apiStudent.building || '未分配', room: apiStudent.room || '-', bed: apiStudent.bed || '-' }
      : parseDorm(this.student && this.student.dorm)
  },
  methods: {
    callPhone(phone) {
      if (!phone) return
      uni.makePhoneCall({ phoneNumber: phone })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding: 28rpx; box-sizing: border-box; }
.body > * + * { margin-top: 20rpx; }
</style>
