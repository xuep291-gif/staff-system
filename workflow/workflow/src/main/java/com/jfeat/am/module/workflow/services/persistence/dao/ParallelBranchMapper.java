package com.jfeat.am.module.workflow.services.persistence.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ParallelBranch;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 并行分支 Mapper 接口
 *
 * @author Code Generator
 */
public interface ParallelBranchMapper extends BaseMapper<ParallelBranch> {

    /**
     * 查询指定网关的所有分支
     *
     * @param gatewayId 网关ID
     * @return 并行分支列表
     */
    List<ParallelBranch> findByGatewayId(@Param("gatewayId") Long gatewayId);

    /**
     * 查询指定网关的指定状态的分支
     *
     * @param gatewayId 网关ID
     * @param status 状态
     * @return 并行分支列表
     */
    List<ParallelBranch> findByGatewayIdAndStatus(@Param("gatewayId") Long gatewayId,
                                                   @Param("status") String status);

    /**
     * 查询指定网关的已完成分支数量
     *
     * @param gatewayId 网关ID
     * @return 已完成分支数量
     */
    Integer countCompletedBranches(@Param("gatewayId") Long gatewayId);

    /**
     * 查询指定处理人的分支
     *
     * @param assigneeId 处理人ID
     * @return 并行分支列表
     */
    List<ParallelBranch> findByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * 查询指定分支步骤的分支记录
     *
     * @param branchStepId 分支步骤ID
     * @return 并行分支
     */
    ParallelBranch findByBranchStepId(@Param("branchStepId") Long branchStepId);
}
