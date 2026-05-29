package com.jfeat.am.module.workflow.services.persistence.dao;

import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * Mapper 接口
 * </p>
 *
 * @author Code Generator
 * @since 2017-11-10
 */
public interface ProcessMapper extends BaseMapper<Process> {

    Integer insertProcess(Process process);

    @Select("SELECT name FROM t_end_user WHERE id = #{id}")
    String getEndUserNameById(@Param("id") Long id);


    @Select("<script>SELECT id,name FROM t_end_user WHERE id IN <foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach></script>")
    List<NodeAssign> getEndUserNamesByIds(@Param("ids") List<Long> ids);


    @Select("<script>SELECT id,name FROM t_sys_role WHERE id IN <foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach></script>")
    List<NodeAssign> getEndRoleNamesByIds(@Param("ids") List<Long> ids);


    @Select("<script>SELECT id,name FROM t_sys_position WHERE id IN <foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach></script>")
    List<NodeAssign> getEndPositionNamesByIds(@Param("ids") List<Long> ids);

}