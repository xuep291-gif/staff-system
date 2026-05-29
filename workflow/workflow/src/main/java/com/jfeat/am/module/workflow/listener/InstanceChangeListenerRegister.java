package com.jfeat.am.module.workflow.listener;

import com.google.common.collect.Maps;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Comparator;
import java.util.Map;
import java.util.TreeSet;

/**
 * Created by jackyhuang on 2017/10/27.
 */
@Service
public class InstanceChangeListenerRegister {
    private static final Logger logger = LoggerFactory.getLogger(InstanceChangeListenerRegister.class);

    private Map<String, TreeSet<InstanceChangeListener>> listeners = Maps.newConcurrentMap();

    @Autowired
    private ProcessInstanceService processInstanceService;

    @Autowired
    private ThreadPoolTaskExecutor asyncExecutor;

    @Autowired(required = false)
    private ListenerFailureLogger failureLogger;

    @PostConstruct
    public void init() {
        logger.info("InstanceChangeListenerRegister initialized with async support");
    }

    public void register(String formType, InstanceChangeListener listener) {
        logger.info("Registering listener for formType={}, listener={}, priority={}, async={}",
                formType, listener.getClass().getSimpleName(), listener.getPriority(), listener.isAsync());

        listeners.computeIfAbsent(formType, k ->
                new TreeSet<>(Comparator.comparingInt(InstanceChangeListener::getPriority))
        ).add(listener);

        logger.debug("Total listeners for formType {}: {}", formType,
                listeners.get(formType).size());
    }

    public void handle(Long instanceId) {
        ProcessInstance processInstance = processInstanceService.retrieveMaster(instanceId);
        if (processInstance == null) {
            logger.debug("Process instance not found. {}", instanceId);
            return;
        }

        String formType = processInstance.getFormType();
        TreeSet<InstanceChangeListener> typeListeners = listeners.get(formType);

        if (typeListeners == null || typeListeners.isEmpty()) {
            logger.debug("Instance change listener not found for formType = {}", formType);
            return;
        }

        logger.info("Processing instance={}, formType={}, formId={}, listenersCount={}",
                instanceId, formType, processInstance.getFormId(), typeListeners.size());

        for (InstanceChangeListener listener : typeListeners) {
            try {
                if (listener.isAsync()) {
                    logger.debug("Executing async listener {} for instance {}",
                            listener.getClass().getSimpleName(), instanceId);
                    asyncExecutor.execute(() -> safeNotify(listener, processInstance));
                } else {
                    logger.debug("Executing sync listener {} for instance {}",
                            listener.getClass().getSimpleName(), instanceId);
                    safeNotify(listener, processInstance);
                }
            } catch (Exception e) {
                logger.error("Listener execution scheduling failed: listener={}, instance={}",
                        listener.getClass().getSimpleName(), instanceId, e);

                if (failureLogger != null) {
                    failureLogger.logFailure(instanceId, listener, e);
                }
            }
        }
    }

    private void safeNotify(InstanceChangeListener listener, ProcessInstance processInstance) {
        Long instanceId = processInstance.getId();
        String listenerName = listener.getClass().getSimpleName();

        try {
            long startTime = System.currentTimeMillis();
            logger.debug("Notifying listener {} for formId={}, instance={}",
                    listenerName, processInstance.getFormId(), instanceId);

            listener.notify(processInstance.getFormId(), processInstance);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Listener {} completed successfully for instance={}, duration={}ms",
                    listenerName, instanceId, duration);

        } catch (Exception e) {
            logger.error("Listener {} failed for instance={}, formType={}, formId={}",
                    listenerName, instanceId, processInstance.getFormType(), processInstance.getFormId(), e);

            if (failureLogger != null) {
                failureLogger.logFailure(instanceId, listener, e);
            }
        }
    }

    /**
     * 获取指定formType的监听器数量
     */
    public int getListenerCount(String formType) {
        TreeSet<InstanceChangeListener> typeListeners = listeners.get(formType);
        return typeListeners == null ? 0 : typeListeners.size();
    }

    /**
     * 获取所有已注册的formType
     */
    public java.util.Set<String> getRegisteredFormTypes() {
        return listeners.keySet();
    }
}
