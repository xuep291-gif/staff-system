package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

/**
 * 流程校验服务接口
 * 提供流程可用性、权限、定义完整性等校验功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface ProcessValidationService {

    /**
     * 验证流程是否可用
     * 检查流程是否存在、状态是否启用、是否被锁定
     *
     * @param processId 流程ID
     * @throws RuntimeException 流程不存在或已禁用
     */
    void validateProcessAvailable(Long processId);

    /**
     * 验证用户是否有权限发起流程
     * 检查流程的开放范围（ALL/DEPARTMENT/USER）
     *
     * @param processId 流程ID
     * @param userId 用户ID
     * @throws RuntimeException 无权限发起流程
     */
    void validateStartPermission(Long processId, Long userId);

    /**
     * 验证流程定义完整性
     * 检查是否包含开始节点、结束节点，以及节点连通性
     *
     * @param processId 流程ID
     * @throws RuntimeException 流程定义不完整
     */
    void validateProcessDefinition(Long processId);

    /**
     * 验证流程是否已锁定
     * 运行中的流程不可修改定义
     *
     * @param processId 流程ID
     * @return true表示已锁定，false表示未锁定
     */
    boolean isProcessLocked(Long processId);
}
