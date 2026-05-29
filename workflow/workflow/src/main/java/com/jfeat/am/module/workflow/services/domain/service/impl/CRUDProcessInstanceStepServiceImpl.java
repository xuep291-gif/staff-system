package com.jfeat.am.module.workflow.services.domain.service.impl;
// ServiceImpl start

            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessInstanceStepMapper;
import com.jfeat.am.module.workflow.services.domain.service.CRUDProcessInstanceStepService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;

/**
 * <p>
 *  implementation
 * </p>
 *CRUDProcessInstanceStepService
 * @author Code generator
 * @since 2021-05-20
 */

@Service
public class CRUDProcessInstanceStepServiceImpl  extends CRUDServiceOnlyImpl<ProcessInstanceStep> implements CRUDProcessInstanceStepService {





        @Resource
        protected ProcessInstanceStepMapper processInstanceStepMapper;

        @Override
        protected BaseMapper<ProcessInstanceStep> getMasterMapper() {
                return processInstanceStepMapper;
        }







}


