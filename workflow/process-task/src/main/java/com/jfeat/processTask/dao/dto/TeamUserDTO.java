package com.jfeat.processTask.dao.dto;


import lombok.Data;

/**
 * 团队-用户关联表实体类
 * 对应数据库表：t_team_user
 */
@Data
public class TeamUserDTO {
    /**
     * 主键ID（自增）
     */
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