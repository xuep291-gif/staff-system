package com.jfeat.am.module.workflow.services.domain.dao;

import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.workflow.services.domain.model.ProcessModel;
import com.jfeat.am.module.workflow.services.persistence.model.Process;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public interface QueryProcessDao extends BaseMapper<Process> {

    List<ProcessModel> findProcesses(@Param("search")String search,
                                    @Param("formType") String formType,
                                     @Param("name") String name,
                                     @Param("status") String status,
                                     @Param("orgId")Long orgId);

    ProcessModel findProcess(@Param("id")Long id);


    Long getEntityIdByProcess(@Param("processId")Long processId);


    VirtualForm getVirtualFormByProcess(@Param("processId")Long processId);

    List<ProcessInstance> selectInstanceByProcess(@Param("processId")Long processId);

    @Select("SELECT name FROM t_end_user WHERE id = #{id}")
    String getEndUserNameById(@Param("id")Long id);

    /**
     * 检查流程是否有运行中的实例
     * @param processId 流程ID
     * @return 运行中的实例数量
     */
    Integer countRunningInstances(@Param("processId")Long processId);

    /**
     * 获取用户所属部门ID
     * @param userId 用户ID
     * @return 部门ID
     */
    Long getUserDepartmentId(@Param("userId")Long userId);

}