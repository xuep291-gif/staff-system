-- =====================================================
-- enroll-js 测试数据初始化脚本
-- 使用方法: psql -h <host> -U postgres -d enroll -f seed-test-data.sql
-- =====================================================

-- 1. 测试学生数据 (t_data_student)
INSERT INTO t_data_student (student_no, name, email, class_id, gender, grade, major, disabled, created_at, updated_at)
VALUES
  ('2024001', '张同学', 'zhang@test.cn', '1', '1', '2024', '计算机科学', '0', now(), now()),
  ('2024002', '李同学', 'li@test.cn', '1', '0', '2024', '软件工程', '0', now(), now()),
  ('2024003', '王同学', 'wang@test.cn', '2', '1', '2024', '数学与应用', '0', now(), now())
ON CONFLICT DO NOTHING;

-- 2. 测试学生组织关系 (t_data_org_user_student)
INSERT INTO t_data_org_user_student (student_no, name, class_id, college_id, major_id, grade, gender, phone, is_resident, disabled, created_at, updated_at)
VALUES
  ('2024001', '张同学', 1, 1, 1, 2024, 1, '13800000001', 1, 0, now(), now()),
  ('2024002', '李同学', 1, 1, 2, 2024, 0, '13800000002', 1, 0, now(), now()),
  ('2024003', '王同学', 2, 2, 3, 2024, 1, '13800000003', 1, 0, now(), now())
ON CONFLICT DO NOTHING;

-- 3. 测试用户登录账号 (t_end_user)
-- 密码: test123  盐: salt001  hash: sha256(test123 + salt001)
INSERT INTO t_end_user (account, password, salt, name, phone, personal_no, delete_flag, create_time, status, type)
VALUES
  ('2024001', '6b2d6f3c8e7da4e2c5f9a1b3d7e8f0a2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e1', 'salt001', '张同学', '13800000001', '2024001', 0, now(), 1, 2),
  ('test001', '6b2d6f3c8e7da4e2c5f9a1b3d7e8f0a2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e1', 'salt001', '李同学', '13800000002', '2024002', 0, now(), 1, 2),
  ('13800000003', '6b2d6f3c8e7da4e2c5f9a1b3d7e8f0a2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e1', 'salt001', '王同学', '13800000003', '2024003', 0, now(), 1, 2)
ON CONFLICT DO NOTHING;

-- 4. 测试账单数据 (t_data_billing)
INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, pay_time, created_at, updated_at)
VALUES
  ('2024001', 'ORD001', 'tuition', 5200, 'unpaid', NULL, now(), now()),
  ('2024001', 'ORD001', 'dorm', 1200, 'unpaid', NULL, now(), now()),
  ('2024001', 'ORD001', 'book', 800, 'paid', now(), now(), now()),
  ('2024002', 'ORD002', 'tuition', 5200, 'paid', now(), now(), now()),
  ('2024002', 'ORD002', 'dorm', 1200, 'paid', now(), now(), now())
ON CONFLICT DO NOTHING;

-- 5. 测试院系数据 (t_sys_org)
INSERT INTO t_sys_org (id, pid, name, full_name, org_code, node_level, left_num, right_num, level, org_type, status, appid, delete_flag, create_time, update_time)
VALUES
  (1, NULL, '华东科技大学', '华东科技大学', 'ROOT', 1, 1, 20, 'school', 0, 'NORMAL', 'enroll', 0, now(), now()),
  (2, 1, '计算机学院', '计算机学院', 'COLLEGE-CS', 2, 2, 9, 'college', 3, 'NORMAL', 'enroll', 0, now(), now()),
  (3, 2, '计算机科学', '计算机科学专业', 'MAJOR-CS', 3, 3, 4, 'major', 3, 'NORMAL', 'enroll', 0, now(), now()),
  (4, 2, '软件工程', '软件工程专业', 'MAJOR-SE', 3, 5, 6, 'major', 3, 'NORMAL', 'enroll', 0, now(), now()),
  (5, 1, '数学学院', '数学学院', 'COLLEGE-MATH', 2, 10, 13, 'college', 3, 'NORMAL', 'enroll', 0, now(), now()),
  (6, 5, '数学与应用', '数学与应用专业', 'MAJOR-MATH', 3, 11, 12, 'major', 3, 'NORMAL', 'enroll', 0, now(), now()),
  (7, 3, '2024级计算机科学1班', '2024级计算机科学1班', 'CLS-2024-CS-1', 4, 0, 0, 'class', 4, 'NORMAL', 'enroll', 0, now(), now()),
  (8, 4, '2024级软件工程1班', '2024级软件工程1班', 'CLS-2024-SE-1', 4, 0, 0, 'class', 4, 'NORMAL', 'enroll', 0, now(), now()),
  (9, 6, '2024级数学1班', '2024级数学1班', 'CLS-2024-MATH-1', 4, 0, 0, 'class', 4, 'NORMAL', 'enroll', 0, now(), now())
ON CONFLICT DO NOTHING;

-- 6. 测试班级表 (t_data_org_college_class) -- 用于 API-046 兜底
INSERT INTO t_data_org_college_class (id, code, name, grade, college_id, major_id, teacher_id, disabled, created_at, updated_at)
VALUES
  (1, 'CS-2024-1', '2024级 计算机科学 1班', 2024, 2, 3, 1, 0, now(), now()),
  (2, 'SE-2024-1', '2024级 软件工程 1班', 2024, 2, 4, 1, 0, now(), now()),
  (3, 'MATH-2024-1', '2024级 数学与应用 1班', 2024, 5, 6, 2, 0, now(), now())
ON CONFLICT DO NOTHING;
