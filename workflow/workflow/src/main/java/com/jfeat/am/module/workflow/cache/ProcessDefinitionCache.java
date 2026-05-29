package com.jfeat.am.module.workflow.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 流程定义缓存服务
 * 使用 Caffeine 缓存框架提供高性能的流程定义和步骤缓存
 *
 * 主要功能：
 * - 缓存流程定义信息，减少数据库查询
 * - 缓存流程步骤信息，加速流程执行
 * - 提供缓存失效和统计功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ProcessDefinitionCache {

    private static final Logger logger = LoggerFactory.getLogger(ProcessDefinitionCache.class);

    @Resource
    private ProcessService processService;

    @Resource
    private ProcessStepService processStepService;

    /** 流程定义缓存 */
    private Cache<Long, Process> processCache;

    /** 流程步骤缓存 */
    private Cache<Long, List<ProcessStep>> stepCache;

    /**
     * 初始化缓存
     * 配置缓存大小、过期时间和统计功能
     */
    @PostConstruct
    public void init() {
        // 初始化流程定义缓存
        // 最大缓存1000个流程，1小时过期
        this.processCache = Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats()
                .build();

        // 初始化流程步骤缓存
        // 最大缓存5000个流程的步骤列表，30分钟过期
        this.stepCache = Caffeine.newBuilder()
                .maximumSize(5000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .recordStats()
                .build();

        logger.info("ProcessDefinitionCache initialized with maxProcessSize=1000, maxStepSize=5000");
    }

    /**
     * 获取流程定义
     * 如果缓存中不存在，则从数据库加载
     *
     * @param processId 流程ID
     * @return 流程定义对象，不存在则返回null
     */
    public Process getProcess(Long processId) {
        return processCache.get(processId, id -> {
            Process process = processService.retrieveMaster(id);
            if (process != null) {
                logger.debug("Process {} loaded from database", id);
            }
            return process;
        });
    }

    /**
     * 获取流程的所有步骤
     * 如果缓存中不存在，则从数据库加载
     *
     * @param processId 流程ID
     * @return 流程步骤列表
     */
    public List<ProcessStep> getSteps(Long processId) {
        return stepCache.get(processId, id -> {
            List<ProcessStep> steps = processStepService.findByProcessId(id);
            logger.debug("Loaded {} steps for process {}", steps.size(), id);
            return steps;
        });
    }

    /**
     * 使流程缓存失效
     * 当流程定义更新时调用此方法
     *
     * @param processId 流程ID
     */
    public void invalidateProcess(Long processId) {
        processCache.invalidate(processId);
        logger.debug("Invalidated cache for process {}", processId);
    }

    /**
     * 使步骤缓存失效
     * 当流程步骤更新时调用此方法
     *
     * @param processId 流程ID
     */
    public void invalidateSteps(Long processId) {
        stepCache.invalidate(processId);
        logger.debug("Invalidated cache for steps of process {}", processId);
    }

    /**
     * 使流程及其步骤的缓存都失效
     * 当流程或步骤发生任何变更时调用此方法
     *
     * @param processId 流程ID
     */
    public void invalidateAll(Long processId) {
        invalidateProcess(processId);
        invalidateSteps(processId);
    }

    /**
     * 清空所有缓存
     * 通常用于系统维护或测试
     */
    public void clearAll() {
        processCache.invalidateAll();
        stepCache.invalidateAll();
        logger.info("All process definition cache cleared");
    }

    /**
     * 获取缓存统计信息
     * 用于监控缓存性能
     *
     * @return 缓存统计信息字符串
     */
    public String getStats() {
        return String.format(
                "Process Cache - size=%d, hitRate=%.2f%% | Steps Cache - size=%d, hitRate=%.2f%%",
                processCache.estimatedSize(),
                processCache.stats().hitRate() * 100,
                stepCache.estimatedSize(),
                stepCache.stats().hitRate() * 100
        );
    }

    /**
     * 获取流程缓存命中率
     *
     * @return 命中率（0-1之间的小数）
     */
    public double getProcessHitRate() {
        return processCache.stats().hitRate();
    }

    /**
     * 获取步骤缓存命中率
     *
     * @return 命中率（0-1之间的小数）
     */
    public double getStepHitRate() {
        return stepCache.stats().hitRate();
    }

    /**
     * 获取流程缓存大小
     *
     * @return 当前缓存的流程数量
     */
    public long getProcessCacheSize() {
        return processCache.estimatedSize();
    }

    /**
     * 获取步骤缓存大小
     *
     * @return 当前缓存的步骤数量
     */
    public long getStepCacheSize() {
        return stepCache.estimatedSize();
    }
}
