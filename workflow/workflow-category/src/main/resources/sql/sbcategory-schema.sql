DROP TABLE IF EXISTS `t_category_type`;
CREATE TABLE `t_category_type` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `name` varchar(250) DEFAULT NULL COMMENT '类别名称',
	`identifier` varchar(50) DEFAULT NULL COMMENT '类别名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_category`;
CREATE TABLE `t_category` (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `name` varchar(250) DEFAULT NULL COMMENT '类别名称',
	`pid` bigint(20) DEFAULT NULL COMMENT '父目录',
	`type_id` bigint(20) NOT NULL COMMENT '类型',
	`sortorder` bigint(20) DEFAULT NULL COMMENT '排序',
	`code` varchar(50) NOT NULL COMMENT '编码',
	`cover` varchar(250) DEFAULT NULL COMMENT '封面',
	`org_id` bigint(20) DEFAULT NULL COMMENT '隔离标识',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;