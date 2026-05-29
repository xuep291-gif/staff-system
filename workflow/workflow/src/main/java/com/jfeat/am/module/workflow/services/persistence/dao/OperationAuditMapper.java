package com.jfeat.am.module.workflow.services.persistence.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.OperationAudit;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 操作审计Mapper接口
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface OperationAuditMapper extends BaseMapper<OperationAudit> {

    /**
     * 查询指定时间范围内的审计日志
     *
     * @param startDate 开始时间
     * @param endDate   结束时间
     * @return 审计日志列表
     */
    List<OperationAudit> findByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    /**
     * 查询指定操作人的审计日志
     *
     * @param operatorId 操作人ID
     * @param startDate  开始时间
     * @param endDate    结束时间
     * @return 审计日志列表
     */
    List<OperationAudit> findByOperator(@Param("operatorId") Long operatorId,
                                         @Param("startDate") Date startDate,
                                         @Param("endDate") Date endDate);

    /**
     * 查询指定操作类型的审计日志
     *
     * @param operationType 操作类型
     * @param startDate     开始时间
     * @param endDate       结束时间
     * @return 审计日志列表
     */
    List<OperationAudit> findByOperationType(@Param("operationType") String operationType,
                                              @Param("startDate") Date startDate,
                                              @Param("endDate") Date endDate);

    /**
     * 查询指定目标的审计日志
     *
     * @param targetType 目标类型
     * @param targetId   目标ID
     * @return 审计日志列表
     */
    List<OperationAudit> findByTarget(@Param("targetType") String targetType,
                                       @Param("targetId") Long targetId);

    /**
     * 统计操作类型分布
     *
     * @param startDate 开始时间
     * @param endDate   结束时间
     * @return 统计结果列表
     */
    List<OperationTypeStats> statsByOperationType(@Param("startDate") Date startDate,
                                                   @Param("endDate") Date endDate);

    /**
     * 操作类型统计结果
     */
    class OperationTypeStats {
        private String operationType;
        private Long count;
        private Long avgExecutionTime;

        public String getOperationType() {
            return operationType;
        }

        public void setOperationType(String operationType) {
            this.operationType = operationType;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }

        public Long getAvgExecutionTime() {
            return avgExecutionTime;
        }

        public void setAvgExecutionTime(Long avgExecutionTime) {
            this.avgExecutionTime = avgExecutionTime;
        }
    }
}
