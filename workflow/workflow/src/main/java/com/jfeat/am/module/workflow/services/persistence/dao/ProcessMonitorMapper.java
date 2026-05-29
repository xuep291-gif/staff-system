package com.jfeat.am.module.workflow.services.persistence.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessMonitor;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 流程监控 Mapper 接口
 *
 * @author Code Generator
 */
public interface ProcessMonitorMapper extends BaseMapper<ProcessMonitor> {

    /**
     * 查询未处理的监控记录
     *
     * @param isHandled 是否已处理
     * @return 监控记录列表
     */
    List<ProcessMonitor> findByHandled(@Param("isHandled") Boolean isHandled);

    /**
     * 查询指定流程实例的监控记录
     *
     * @param instanceId 流程实例ID
     * @return 监控记录列表
     */
    List<ProcessMonitor> findByInstanceId(@Param("instanceId") Long instanceId);

    /**
     * 查询指定类型的监控记录
     *
     * @param monitorType 监控类型
     * @return 监控记录列表
     */
    List<ProcessMonitor> findByMonitorType(@Param("monitorType") String monitorType);

    /**
     * 查询未处理且指定类型的监控记录
     *
     * @param monitorType 监控类型
     * @param isHandled 是否已处理
     * @return 监控记录列表
     */
    List<ProcessMonitor> findByTypeAndHandled(@Param("monitorType") String monitorType,
                                               @Param("isHandled") Boolean isHandled);
}
