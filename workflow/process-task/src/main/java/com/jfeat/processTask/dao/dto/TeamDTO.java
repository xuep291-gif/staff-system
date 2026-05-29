package com.jfeat.processTask.dao.dto;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;

/**
 * 团队表实体类
 * 对应数据库表：t_team
 */
@Data
public class TeamDTO  {
    /**
     * 主键ID（自增）
     */
    private Long id;

    /**
     * 团队名称（唯一约束）
     */
    private String teamName;

    /**
     * 团队描述
     */
    private String teamDesc;

    /**
     * 父级ID
     */
    private Long pid;
}