package com.jfeat.am.module.workflow.services.domain.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessModel;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessService;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
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
public class QueryProcessServiceImpl implements QueryProcessService {

    @Resource
    QueryProcessDao queryProcessDao;

    @Override
    public List<ProcessModel> findProcesses(String search,String formType, String name, String status) {
        Long orgId = JWTKit.getTenantOrgId();
        orgId = orgId == null ? JWTKit.getOrgId():orgId;
        return queryProcessDao.findProcesses(search,formType, name, status,orgId);
    }

}
