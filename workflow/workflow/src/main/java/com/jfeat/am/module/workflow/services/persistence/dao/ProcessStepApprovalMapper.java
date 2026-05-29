package com.jfeat.am.module.workflow.services.persistence.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepApproval;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * <p>
 * 流程步骤审批人Mapper接口
 * </p>
 *
 * @author Code Generator
 * @since 2023-07-26
 */
public interface ProcessStepApprovalMapper extends BaseMapper<ProcessStepApproval> {

    /**
     * 批量插入流程步骤审批人
     * @param entityList 审批人列表
     * @return 插入数量
     */
    Integer insertBatch(@Param("list") List<ProcessStepApproval> entityList);

}