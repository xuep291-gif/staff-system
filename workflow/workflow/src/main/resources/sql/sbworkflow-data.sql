
SET FOREIGN_KEY_CHECKS=0;

DELETE FROM sys_perm_group WHERE id='902062332555455344';
INSERT INTO `sys_perm_group` (`id`, `org_id`, `pid`, `name`, `identifier`) VALUES
('902062332555455344', '100000000000000001', '100000000000000102', '流程管理', 'workflow.management');

DELETE FROM sys_perm WHERE id in ('902062333555455388', '902062333555455389');
INSERT INTO `sys_perm` (`id`, `group_id`, `name`, `identifier`) VALUES
('902062333555455388', '902062332555455344', '查看流程', 'workflow.view'),
('902062333555455389', '902062332555455344', '编辑流程', 'workflow.edit');

DELETE FROM sys_role WHERE `name` in ('流程管理员');
INSERT INTO `sys_role` (`id`, `org_id`, `sort_order`, `pid`, `name`, `tips`, `version`, `delete_flag`, `role_code`, `made_by`, `user_type`) VALUES ('876708082437197827', '100000000000000001', '1', NULL, '流程管理员', NULL, NULL, '0', NULL, 'SYSTEM', NULL);

-- ----------------------------
-- Records of role_perm
-- ----------------------------
--INSERT INTO `sys_role_perm` (`id`, `roleid`, `permid`) VALUES
--('902062333555455390', '876708082437197826', '902062333555455388'),
--('876708082437197891', '876708082437197826', '902062333555455389');
