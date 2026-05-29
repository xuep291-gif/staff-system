package com.jfeat.am.module.workflow.services.persistence.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ParallelGateway;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 并行网关 Mapper 接口
 *
 * @author Code Generator
 */
public interface ParallelGatewayMapper extends BaseMapper<ParallelGateway> {

    /**
     * 查询指定流程实例的并行网关
     *
     * @param instanceId 流程实例ID
     * @return 并行网关列表
     */
    List<ParallelGateway> findByInstanceId(@Param("instanceId") Long instanceId);

    /**
     * 查询指定流程实例的活跃并行网关
     *
     * @param instanceId 流程实例ID
     * @param status 状态
     * @return 并行网关列表
     */
    List<ParallelGateway> findByInstanceIdAndStatus(@Param("instanceId") Long instanceId,
                                                    @Param("status") String status);

    /**
     * 查询指定网关步骤的并行网关
     *
     * @param gatewayStepId 网关步骤ID
     * @return 并行网关
     */
    ParallelGateway findByGatewayStepId(@Param("gatewayStepId") Long gatewayStepId);
}
