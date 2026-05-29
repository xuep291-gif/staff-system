package com.jfeat.processTask.dao.model;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 团队-用户关联表实体类
 * 对应数据库表：t_team_user
 */
@Data
@TableName("t_team_user")
public class TeamUser {
    /**
     * 主键ID（自增）
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 团队ID
     */
    private Long teamId;

    /**
     * 员工ID
     */
    private Long userId;

    /**
     * 是否为领导者(0-否 1-是)
     */
    private Integer isLeader;
}