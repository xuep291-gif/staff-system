package com.jfeat.am.module.workflow.services.crud.service.impl;
            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
import com.jfeat.am.module.workflow.services.persistence.dao.TaskMapper;
import com.jfeat.am.module.workflow.services.crud.service.TaskService;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
/**
 * <p>
 *  implementation
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@Service
public class TaskServiceImpl  extends CRUDServiceOnlyImpl<Task> implements TaskService {


    @Resource
    private TaskMapper taskMapper;

    @Override
    protected BaseMapper<Task> getMasterMapper() {
        return taskMapper;
    }
}


