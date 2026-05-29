
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `ticket_attachment_item`;

CREATE TABLE IF NOT EXISTS `ticket_attachment_item` ( /*表单附件明细表*/
 `id` BIGINT(20) NOT NULL,
 `ticket_id` BIGINT(20) NOT NULL COMMENT '表单ID',
 `version` int(11) DEFAULT NULL COMMENT '文档属性版本号',
 `title` VARCHAR(255) DEFAULT NULL COMMENT '文件名',
 `size` int(11) DEFAULT NULL COMMENT '大小',
 `format` VARCHAR(50) DEFAULT NULL COMMENT '格式[文件后缀]',
 `upload_time` datetime DEFAULT NULL COMMENT '上传时间',
 `url` VARCHAR(255) DEFAULT NULL COMMENT '文件路径',
 PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
