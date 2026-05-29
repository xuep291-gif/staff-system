
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `t_virtual_form`;
CREATE TABLE `t_virtual_form` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL COMMENT '虚拟表单的code',
  `design_data` text DEFAULT NULL COMMENT '阿里巴巴 表单设计的json',
  `entity_id` bigint(20) NOT NULL COMMENT '对应eav中的entity的id',
  `type` varchar(20) DEFAULT 'SINGLE_FORM' COMMENT 'COMPOUND_FORM 复合表单  （有子表单）SINGLE_FORM 单一表单  （无子表单）',
  `org_id` bigint(20) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `form_name` varchar(30) DEFAULT NULL,
   `note` varchar(200) DEFAULT NULL COMMENT '备注',
   `doc_id` BIGINT(20) DEFAULT NULL COMMENT '文档绑定',
   `delete_flag` tinyint(4) NOT NULL DEFAULT '0',
    `sort_num` varchar(20) DEFAULT '0' COMMENT '排序号',
     `html_url` varchar(255) DEFAULT NULL COMMENT 'html文件路径',
     `app_design_data` text DEFAULT NULL COMMENT 'App端设计',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

