
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `wf_process`;
CREATE TABLE `wf_process` (
  `id` bigint(20) NOT NULL COMMENT '主键',
   `current_user_id` bigint(20) DEFAULT NULL COMMENT '执行人id',
  `code` varchar(50) NOT NULL COMMENT '流程编码',
  `form_group` varchar(50) COMMENT '表单分组',
  `form_type` varchar(50)  NULL COMMENT '表单类型',
  `name` varchar(50) NOT NULL COMMENT '流程名称',
  `category_id` bigint(20) NOT NULL COMMENT '类别ID',
  `status` varchar(50) NOT NULL COMMENT '状态：ENABLED,DISABLED,LOCKED',
  `open_to` varchar(50) NOT NULL DEFAULT 'ALL' COMMENT '开放范围：ALL, DEPARTMENT, USER',
  `open_to_ids` text COMMENT '指定开放部门或人员的id列表，逗号分隔',
  `org_id` bigint(20) DEFAULT NULL COMMENT '隔离标识',
  `code_rule` varchar(50) COMMENT '编号规则',
  `allow_delete` tinyint(2) DEFAULT '1' COMMENT '是否允许删除 1 允许 0 不允许',
  `version` int DEFAULT 1 COMMENT '流程版本号',
  `effective_date` datetime COMMENT '生效时间',
  `expiry_date` datetime COMMENT '失效时间',
  `is_locked` tinyint DEFAULT 0 COMMENT '是否锁定（运行中的流程不可修改）',
  `based_on_id` bigint(20) DEFAULT NULL COMMENT '基于的版本ID',
  `status_reason` varchar(255) DEFAULT NULL COMMENT '状态变更原因',
  PRIMARY KEY (`id`),
  INDEX `idx_code_version` (`code`, `version`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `wf_process_step`;
CREATE TABLE `wf_process_step` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `name` varchar(50) NOT NULL COMMENT '步骤名称',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `type` varchar(50) NOT NULL COMMENT '类型：START, MIDDLE, END',
  `step_type` varchar(20) NOT NULL COMMENT '步骤类型：审核步骤approval，填写步骤content',
  `next_steps` text COMMENT '下一步骤列表，逗号分隔',
  `handler_select_rule` varchar(50) COMMENT '经办人自动选择规则',
  `handler_ids` text COMMENT '经办人ID列表',
   `current_user_id` bigint(20) DEFAULT NULL COMMENT '执行人id',
   `virtual_form_code` varchar(30) NOT NULL COMMENT '虚拟表单的code',
  `timeout_hours` int COMMENT '超时时间（小时）',
  `auto_action` varchar(50) COMMENT '超时自动操作：PASS,REJECT,TRANSFER',
  `notify_type` varchar(50) COMMENT '通知类型：EMAIL,SMS,SYSTEM',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `wf_process_instance`;
CREATE TABLE `wf_process_instance` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `form_group` varchar(50) COMMENT '表单分组',
  `form_type` varchar(50) NOT NULL COMMENT '表单实体',
  `form_id` bigint(20) COMMENT '表单的row ID',
  `name` varchar(50) NOT NULL COMMENT '流程实例名称',
  `status` varchar(50) NOT NULL COMMENT '状态：',
  `creator_id` bigint(20) NOT NULL COMMENT '创建人ID',
  `creator` varchar(50) NOT NULL COMMENT '创建者名字',
  `executor_id` bigint(20) DEFAULT NULL COMMENT '执行人ID',
  `executor` varchar(50) DEFAULT NULL COMMENT '执行人名字',
  `current_step_id` bigint(20) DEFAULT NULL COMMENT '当前步骤ID',
  `current_user_id` bigint(20) DEFAULT NULL COMMENT '当前处理人ID',
  `current_user_name` varchar(50) DEFAULT NULL COMMENT '当前处理人名字',
  `current_step_name` varchar(50) DEFAULT NULL COMMENT '当前步骤名字',
  `create_time` datetime COMMENT '创建时间',
  `handled_steps` text COMMENT '处理步骤列表',
  `handled_users` text COMMENT '处理人列表',
   `auto_code` bigint(20) NOT NULL DEFAULT 0 COMMENT '自动增加的code',
   `code` varchar(50) COMMENT '根据定义生成的code',
  `org_id` bigint(20) DEFAULT NULL COMMENT '隔离标识',
  `priority` tinyint DEFAULT 5 COMMENT '优先级：1-10，数字越小优先级越高',
  `expect_complete_time` datetime COMMENT '预期完成时间',
  `business_key` varchar(100) COMMENT '业务键（关联外部业务系统）',
  `start_time` datetime COMMENT '开始时间',
  `end_time` datetime COMMENT '结束时间',
  `cost_seconds` int COMMENT '耗时（秒）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `wf_task`;
CREATE TABLE `wf_task` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `process_instance_id` bigint(20) NOT NULL COMMENT '流程实例ID',
  `step_id` bigint(20) COMMENT '步骤ID',
  `form_id` bigint(20) NOT NULL COMMENT '表单ID',
  `form_type` varchar(50) NOT NULL COMMENT '表单类型',
  `status` varchar(50) NOT NULL COMMENT '状态: HANDLING, HANDLED',
  `name` varchar(200) NOT NULL COMMENT '名称',
  `handle_time` datetime COMMENT '处理时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `wf_history`;
CREATE TABLE `wf_history` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `process_instance_id` bigint(20) NOT NULL COMMENT '流程实例ID',
  `process_instance_name` varchar(50) COMMENT '流程实例名称',
  `previous_step_id` bigint(20) DEFAULT NULL COMMENT '上一步骤ID',
  `previous_step_name` varchar(50) DEFAULT NULL COMMENT '上一步骤名称',
  `step_id` bigint(20) COMMENT '步骤ID',
  `step_name` varchar(50) COMMENT '步骤名称',
  `form_id` bigint(20) COMMENT '表单ID',
  `form_type` varchar(50) NOT NULL COMMENT '表单类型',
  `user_id` bigint(20) COMMENT '审批人ID',
  `user_name` varchar(50) COMMENT '审批人名字',
  `result` varchar(50) COMMENT '审批结果: APPROVED, REJECTED',
  `comment` TEXT DEFAULT NULL COMMENT '审批意见',
  `handle_time` datetime DEFAULT NULL COMMENT '审批时间',
  `ip_address` varchar(50) DEFAULT NULL COMMENT '审批人IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `attachment_ids` TEXT DEFAULT NULL COMMENT '附件ID列表（JSON）',
  `cost_seconds` int(11) DEFAULT NULL COMMENT '审批耗时（秒）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `wf_process_instance_step`;
CREATE TABLE `wf_process_instance_step` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `step_id` bigint(20) DEFAULT NULL COMMENT '步骤id',
  `instance_id` bigint(20) DEFAULT NULL COMMENT '实例id',
  `entity_id` bigint(20) NOT NULL COMMENT '表单entityId',
  `row_id` bigint(20) COMMENT '表单对应的记录id',
  `virtual_form_code` varchar(30) DEFAULT NULL COMMENT '虚拟表单code',
  PRIMARY KEY (`id`),
  UNIQUE KEY `step_id` (`step_id`,`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- =============================================
-- 数据库索引优化
-- =============================================

-- wf_process_instance 表索引优化
-- 优化状态查询性能
CREATE INDEX idx_instance_status ON wf_process_instance(status);
-- 优化创建人查询性能
CREATE INDEX idx_instance_creator ON wf_process_instance(creator_id);
-- 优化当前处理人查询性能
CREATE INDEX idx_instance_current_user ON wf_process_instance(current_user_id);
-- 优化创建时间排序和查询性能
CREATE INDEX idx_instance_create_time ON wf_process_instance(create_time);
-- 优化组织隔离查询性能
CREATE INDEX idx_instance_org ON wf_process_instance(org_id);
-- 优化组织+状态+时间组合查询性能（常用查询条件组合）
CREATE INDEX idx_instance_org_status_time ON wf_process_instance(org_id, status, create_time);

-- wf_history 表索引优化
-- 优化流程实例历史记录查询性能
CREATE INDEX idx_history_instance ON wf_history(process_instance_id);
-- 优化用户审批历史查询性能
CREATE INDEX idx_history_user ON wf_history(user_id);
-- 优化审批时间排序和查询性能
CREATE INDEX idx_history_time ON wf_history(handle_time);
-- 优化审批结果查询性能
CREATE INDEX idx_history_result ON wf_history(result);
-- 优化流程实例历史记录按时间倒序查询性能（常用查询场景）
CREATE INDEX idx_history_instance_time ON wf_history(process_instance_id, handle_time DESC);

-- wf_task 表索引优化
-- 优化用户任务查询性能
CREATE INDEX idx_task_user ON wf_task(user_id);
-- 优化任务状态查询性能
CREATE INDEX idx_task_status ON wf_task(status);
-- 优化流程实例任务查询性能
CREATE INDEX idx_task_instance ON wf_task(process_instance_id);

-- =====================================================
-- 步骤流转关系表
-- =====================================================
DROP TABLE IF EXISTS `wf_process_step_transition`;
CREATE TABLE `wf_process_step_transition` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `from_step_id` BIGINT(20) NOT NULL COMMENT '源步骤ID',
  `to_step_id` BIGINT(20) NOT NULL COMMENT '目标步骤ID',
  `condition_expression` TEXT COMMENT '流转条件表达式（SpEL）',
  `condition_type` VARCHAR(50) COMMENT '条件类型：ALWAYS,EXPRESSION,SUBMIT',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  INDEX `idx_from_step` (`from_step_id`),
  INDEX `idx_to_step` (`to_step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='步骤流转关系表';

-- =====================================================
-- 流程实例步骤历史表（替代JSON存储）
-- =====================================================
DROP TABLE IF EXISTS `wf_instance_step_history`;
CREATE TABLE `wf_instance_step_history` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `instance_id` BIGINT(20) NOT NULL COMMENT '流程实例ID',
  `step_id` BIGINT(20) NOT NULL COMMENT '步骤ID',
  `step_name` VARCHAR(100) COMMENT '步骤名称',
  `user_id` BIGINT(20) COMMENT '处理人ID',
  `user_name` VARCHAR(100) COMMENT '处理人名称',
  `action` VARCHAR(50) COMMENT '操作：APPROVE,REJECT,ROLLBACK',
  `comment` TEXT COMMENT '处理意见',
  `start_time` DATETIME COMMENT '步骤开始时间',
  `end_time` DATETIME COMMENT '步骤结束时间',
  `sort_order` INT COMMENT '顺序',
  PRIMARY KEY (`id`),
  INDEX `idx_instance` (`instance_id`),
  INDEX `idx_step` (`step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程实例步骤历史表';

-- =====================================================
-- 流程变量表
-- =====================================================
DROP TABLE IF EXISTS `wf_process_variable`;
CREATE TABLE `wf_process_variable` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `instance_id` BIGINT(20) NOT NULL COMMENT '流程实例ID',
  `variable_key` VARCHAR(100) NOT NULL COMMENT '变量键',
  `variable_value` TEXT COMMENT '变量值（JSON）',
  `variable_type` VARCHAR(50) COMMENT '变量类型：STRING,NUMBER,BOOLEAN,DATE,OBJECT',
  `scope` VARCHAR(50) COMMENT '作用域：GLOBAL,LOCAL,TRANSIENT',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instance_key` (`instance_id`, `variable_key`),
  INDEX `idx_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程变量表';

-- =====================================================
-- 版本管理和超时处理 - 数据库升级脚本
-- =====================================================

-- 为现有数据库添加版本管理字段（如果字段不存在则执行）
-- ALTER TABLE wf_process ADD COLUMN `based_on_id` bigint(20) DEFAULT NULL COMMENT '基于的版本ID' AFTER `is_locked`;
-- ALTER TABLE wf_process ADD COLUMN `status_reason` varchar(255) DEFAULT NULL COMMENT '状态变更原因' AFTER `based_on_id`;
-- ALTER TABLE wf_process ADD INDEX `idx_code_version` (`code`, `version`);
-- ALTER TABLE wf_process ADD INDEX `idx_status` (`status`);

-- wf_process_step 表已包含超时相关字段（timeout_hours, auto_action, notify_type）
-- 无需额外添加

-- =====================================================
-- 并行网关表
-- =====================================================
DROP TABLE IF EXISTS `wf_parallel_gateway`;
CREATE TABLE `wf_parallel_gateway` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `instance_id` BIGINT(20) NOT NULL COMMENT '流程实例ID',
  `gateway_step_id` BIGINT(20) NOT NULL COMMENT '网关步骤ID',
  `branch_count` INT NOT NULL COMMENT '分支数量',
  `completed_count` INT DEFAULT 0 COMMENT '已完成分支数',
  `status` VARCHAR(50) COMMENT '状态：ACTIVE,COMPLETED',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_instance` (`instance_id`),
  INDEX `idx_gateway` (`gateway_step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='并行网关表';

-- =====================================================
-- 并行分支表
-- =====================================================
DROP TABLE IF EXISTS `wf_parallel_branch`;
CREATE TABLE `wf_parallel_branch` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gateway_id` BIGINT(20) NOT NULL COMMENT '网关ID',
  `branch_step_id` BIGINT(20) NOT NULL COMMENT '分支步骤ID',
  `branch_name` VARCHAR(100) COMMENT '分支名称',
  `branch_order` INT COMMENT '分支顺序',
  `status` VARCHAR(50) COMMENT '状态：PENDING,ACTIVE,COMPLETED',
  `assignee_id` BIGINT(20) COMMENT '处理人ID',
  `assignee_name` VARCHAR(100) COMMENT '处理人名称',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `complete_time` DATETIME COMMENT '完成时间',
  PRIMARY KEY (`id`),
  INDEX `idx_gateway` (`gateway_id`),
  INDEX `idx_branch_step` (`branch_step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='并行分支表';

-- =====================================================
-- 流程监控表
-- =====================================================
DROP TABLE IF EXISTS `wf_process_monitor`;
CREATE TABLE `wf_process_monitor` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `process_id` BIGINT(20) COMMENT '流程定义ID',
  `instance_id` BIGINT(20) COMMENT '流程实例ID',
  `monitor_type` VARCHAR(50) COMMENT '监控类型：TIMEOUT,ERROR,WARNING',
  `monitor_level` VARCHAR(50) COMMENT '监控级别：INFO,WARN,ERROR',
  `message` TEXT COMMENT '监控消息',
  `details` TEXT COMMENT '详细信息（JSON）',
  `is_handled` TINYINT DEFAULT 0 COMMENT '是否已处理',
  `handle_time` DATETIME COMMENT '处理时间',
  `handler_id` BIGINT(20) COMMENT '处理人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_type_handled` (`monitor_type`, `is_handled`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程监控表';

-- =====================================================
-- 操作审计表
-- =====================================================
DROP TABLE IF EXISTS `wf_operation_audit`;
CREATE TABLE `wf_operation_audit` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `operation_type` VARCHAR(50) COMMENT '操作类型：CREATE,SUBMIT,APPROVE,REJECT,ROLLBACK,TRANSFER',
  `operator_id` BIGINT(20) COMMENT '操作人ID',
  `operator_name` VARCHAR(100) COMMENT '操作人姓名',
  `target_type` VARCHAR(50) COMMENT '目标类型：PROCESS,INSTANCE,STEP',
  `target_id` BIGINT(20) COMMENT '目标ID',
  `request_data` TEXT COMMENT '请求数据（JSON）',
  `response_data` TEXT COMMENT '响应数据（JSON）',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  `execution_time_ms` INT COMMENT '执行耗时（毫秒）',
  `success` TINYINT COMMENT '是否成功',
  `error_message` TEXT COMMENT '错误信息',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  INDEX `idx_operator` (`operator_id`),
  INDEX `idx_target` (`target_type`, `target_id`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_operation_type` (`operation_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='操作审计表';
