package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.services.persistence.model.Process;
import java.util.List;

/**
 * 流程版本管理服务接口
 */
public interface ProcessVersionService {

    /**
     * 创建新版本流程
     * @param originalProcessId 原流程ID
     * @return 新版本流程
     */
    Process createNewVersion(Long originalProcessId);

    /**
     * 获取流程的运行版本
     * @param processCode 流程编码
     * @return 运行中的流程版本
     */
    Process getRunningVersion(String processCode);

    /**
     * 获取流程的所有版本
     * @param processCode 流程编码
     * @return 所有版本列表
     */
    List<Process> getAllVersions(String processCode);

    /**
     * 启用指定版本（禁用其他版本）
     * @param processId 流程ID
     */
    void activateVersion(Long processId);

    /**
     * 归档旧版本（标记为不可编辑）
     * @param processId 流程ID
     */
    void archiveOldVersion(Long processId);

    /**
     * 获取最新版本的流程
     * @param processCode 流程编码
     * @return 最新版本的流程
     */
    Process getLatestVersion(String processCode);
}
