
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM sys_perm_group WHERE id='100000000000000401';
INSERT INTO `sys_perm_group` (`id`, `org_id`, `pid`, `identifier`, `name`) VALUES ('100000000000000401', '100000000000000001', '100000000000000102', 'virtualform.management', '表单管理');

DELETE FROM sys_perm WHERE id='100000000000041001';
DELETE FROM sys_perm WHERE id='100000000000041002';
DELETE FROM sys_perm WHERE id='100000000000041003';
DELETE FROM sys_perm WHERE id='100000000000041004';

INSERT INTO `sys_perm` (`id`, `group_id`, `identifier`, `name`, `tag`) VALUES ('100000000000041001', '100000000000000401', 'virtualform.view', '查看表单', '0');
INSERT INTO `sys_perm` (`id`, `group_id`, `identifier`, `name`, `tag`) VALUES ('100000000000041002', '100000000000000401', 'virtualform.edit', '编辑表单', '0');
INSERT INTO `sys_perm` (`id`, `group_id`, `identifier`, `name`, `tag`) VALUES ('100000000000041003', '100000000000000401', 'virtualform.delete', '删除表单', '0');
INSERT INTO `sys_perm` (`id`, `group_id`, `identifier`, `name`, `tag`) VALUES ('100000000000041004', '100000000000000401', 'virtualform.new', '新建表单', '0');

DELETE FROM meta_entity_patch_machine WHERE entity='virtualForm';

INSERT INTO `meta_entity_patch_machine` ( `entity`, `entity_table_name`, `entity_field_name`, `entity_field_type`, `number_range_min`, `number_range_max`, `permission`) VALUES ( 'virtualForm', 't_virtual_form', 'sort_num', 'STRING', NULL, NULL, NULL);
