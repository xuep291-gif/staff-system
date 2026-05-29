package com.jfeat.am.module.workflow.services.domain.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.domain.dao.QueryHistoryDao;
import com.jfeat.am.module.workflow.services.domain.service.QueryHistoryService;
import com.jfeat.am.module.workflow.services.persistence.model.History;
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
public class QueryHistoryServiceImpl implements QueryHistoryService {

    @Resource
    QueryHistoryDao queryHistoryDao;

    @Override
    public List<History> findHistories(Long formId,Long instanceId) {
        return queryHistoryDao.findHistories(formId, null, null,instanceId);
    }

    @Override
    public History getHistory(Long formId, Long stepId, Long userId,Long instanceId) {
        List<History> list = queryHistoryDao.findHistories(formId, stepId, userId,instanceId);
        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }
}
