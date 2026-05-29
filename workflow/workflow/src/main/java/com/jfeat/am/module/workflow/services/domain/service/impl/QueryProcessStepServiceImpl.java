package com.jfeat.am.module.workflow.services.domain.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessStepDao;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */
@Service
public class QueryProcessStepServiceImpl implements QueryProcessStepService {

    @Resource
    QueryProcessStepDao queryProcessStepDao;

    @Override
    public List<ProcessStep> findProcessSteps(Long processId, String status) {
        return queryProcessStepDao.findProcessSteps(processId, status);
    }

}
