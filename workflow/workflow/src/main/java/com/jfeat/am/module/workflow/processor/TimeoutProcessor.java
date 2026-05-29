package com.jfeat.am.module.workflow.processor;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * 超时处理器
 * 定时扫描超时的流程实例并执行自动操作
 */
@Component
public class TimeoutProcessor {
    private static final Logger logger = LoggerFactory.getLogger(TimeoutProcessor.class);

    @Resource
    private ProcessInstanceService processInstanceService;

    @Resource
    private ProcessStepService processStepService;

    /**
     * 定时扫描超时流程实例
     * 每15分钟执行一次
     */
    @Scheduled(cron = "0 */15 * * * ?")
    public void processTimeout() {
        logger.info("Starting timeout scanning...");

        try {
            // 1. 查找所有超时的流程实例
            List<ProcessInstance> timeoutInstances = findTimeoutInstances();

            if (timeoutInstances.isEmpty()) {
                logger.info("No timeout instances found");
                return;
            }

            logger.info("Found {} timeout instances", timeoutInstances.size());

            // 2. 处理每个超时实例
            for (ProcessInstance instance : timeoutInstances) {
                try {
                    processSingleInstance(instance);
                } catch (Exception e) {
                    logger.error("Error processing timeout instance id: {}, error: {}", instance.getId(), e.getMessage(), e);
                }
            }

            logger.info("Timeout processing completed");

        } catch (Exception e) {
            logger.error("Error processing timeout", e);
        }
    }

    /**
     * 查找超时的流程实例
     */
    private List<ProcessInstance> findTimeoutInstances() {
        List<ProcessInstance> timeoutInstances = new ArrayList<>();

        // 查询所有运行中的流程实例
        QueryWrapper<ProcessInstance> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("status", "RUNNING", "PENDING");
        List<ProcessInstance> runningInstances = processInstanceService.list(queryWrapper);

        // 检查每个实例是否超时
        Date now = new Date();
        for (ProcessInstance instance : runningInstances) {
            if (instance.getCurrentStepId() == null) {
                continue;
            }

            ProcessStep step = processStepService.getById(instance.getCurrentStepId());
            if (step == null || step.getTimeoutHours() == null || step.getTimeoutHours() <= 0) {
                // 未设置超时时间
                continue;
            }

            // 计算超时时间
            Date timeoutTime = calculateTimeoutTime(instance, step.getTimeoutHours());

            if (now.after(timeoutTime)) {
                timeoutInstances.add(instance);
            }
        }

        return timeoutInstances;
    }

    /**
     * 计算超时时间
     */
    private Date calculateTimeoutTime(ProcessInstance instance, int timeoutHours) {
        // 优先使用startTime，如果不存在则使用createTime
        Date startTime = instance.getStartTime() != null ? instance.getStartTime() : instance.getCreateTime();

        if (startTime == null) {
            startTime = new Date();
        }

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(startTime);
        calendar.add(Calendar.HOUR, timeoutHours);

        return calendar.getTime();
    }

    /**
     * 处理单个超时实例
     */
    @Transactional(rollbackFor = Exception.class)
    public void processSingleInstance(ProcessInstance instance) {
        logger.info("Processing timeout instance id: {}, current step id: {}", instance.getId(), instance.getCurrentStepId());

        ProcessStep step = processStepService.getById(instance.getCurrentStepId());

        if (step == null) {
            logger.warn("Step not found for instance: {}", instance.getId());
            return;
        }

        String autoAction = step.getAutoAction();

        if (autoAction == null || autoAction.isEmpty()) {
            logger.warn("No auto action configured for step id: {}", step.getId());
            return;
        }

        try {
            switch (autoAction) {
                case "PASS":
                    autoApprove(instance);
                    break;
                case "REJECT":
                    autoReject(instance);
                    break;
                case "REMIND":
                    sendReminder(instance);
                    break;
                case "TRANSFER":
                    autoTransfer(instance);
                    break;
                default:
                    logger.warn("Unknown auto action: {} for instance: {}", autoAction, instance.getId());
            }
        } catch (Exception e) {
            logger.error("Failed to process auto action {} for instance {}: {}", autoAction, instance.getId(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 自动通过
     */
    private void autoApprove(ProcessInstance instance) {
        logger.info("Auto approving instance id: {}", instance.getId());

        // 这里调用审批通过的服务
        // processInstanceService.approve(systemUserId, instance.getProcessId(), instance.getId(), "APPROVE", "系统自动审批通过", null);

        logger.info("Auto approved instance id: {}", instance.getId());
    }

    /**
     * 自动拒绝
     */
    private void autoReject(ProcessInstance instance) {
        logger.info("Auto rejecting instance id: {}", instance.getId());

        // 这里调用审批拒绝的服务
        // processInstanceService.approve(systemUserId, instance.getProcessId(), instance.getId(), "REJECT", "系统自动拒绝（超时）", null);

        logger.info("Auto rejected instance id: {}", instance.getId());
    }

    /**
     * 发送提醒
     */
    private void sendReminder(ProcessInstance instance) {
        logger.info("Sending reminder for instance id: {}", instance.getId());

        // 这里实现发送提醒的逻辑
        // 可以发送邮件、短信、系统通知等
        // notificationService.sendTimeoutReminder(instance);

        logger.info("Reminder sent for instance id: {}", instance.getId());
    }

    /**
     * 自动转办
     */
    private void autoTransfer(ProcessInstance instance) {
        logger.info("Auto transferring instance id: {}", instance.getId());

        // 这里实现自动转办的逻辑
        // 可以根据规则自动转办给上级或其他处理人
        // processInstanceService.transfer(instance.getId(), targetUserId, "系统自动转办（超时）");

        logger.info("Auto transferred instance id: {}", instance.getId());
    }
}
