package com.jfeat.am.module.workflow.services.domain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
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
public class QueryProcessInstanceServiceImpl implements QueryProcessInstanceService {

    @Resource
    QueryProcessInstanceDao queryProcessInstanceDao;

    @Override
    public Page<ProcessInstance> findProcessInstances(int pageNum, int pageSize,
                                                      Long userId,
                                                      Long creatorId,
                                                      Long processId,
                                                      Long formId,
                                                      String formGroup,
                                                      String formType,
                                                      String status,
                                                      String name,
                                                      String creator,
                                                      String executor,
                                                      String currentUserName,
                                                      Long currentId,
                                                      Long orgId) {

        Page<ProcessInstance> page = new Page<>();
        page.setCurrent(pageNum);
        page.setSize(pageSize);
        page.setRecords(queryProcessInstanceDao.findProcessInstances(page, userId, creatorId, processId, formId, formGroup, formType, status, name, creator, executor, currentUserName,currentId,orgId));

        return page;
    }

    @Override
    public Page<ProcessInstance> findSelfProcessInstances(int pageNum, int pageSize, Long userId, Long creatorId,Long processId, Long formId, String formGroup, String formType, String status, String name, String creator, String executor, Long orgId) {
        Page<ProcessInstance> page = new Page<>();
        page.setCurrent(pageNum);
        page.setSize(pageSize);
        page.setRecords(queryProcessInstanceDao.findSelfProcessInstances(page, userId,creatorId, processId, formId, formGroup, formType, status, name, creator, executor,orgId));

        return page;
    }


    @Override
    public ProcessInstance getProcessInstanceByFormId(Long formId,String formType) {
/*        ProcessInstance entity = new ProcessInstance();
        entity.setFormId(formId);*/
        QueryWrapper<ProcessInstance> processInstanceQueryWrapper = new QueryWrapper<>();
        processInstanceQueryWrapper.eq("form_id",formId);
        processInstanceQueryWrapper.eq("form_type",formType);

        return queryProcessInstanceDao.selectOne(processInstanceQueryWrapper);
    }

}
