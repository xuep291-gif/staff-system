package com.jfeat.processTask.dao.model;
//import com.baomidou.mybatisplus.activerecord.Model;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;

/**
 * 团队表实体类
 * 对应数据库表：t_team
 */
@Data
@TableName("t_team")
public class Team extends Model<Team> {
    /**
     * 主键ID（自增）
     */
    @TableId(type = IdType.AUTO)
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