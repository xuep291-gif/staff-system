package com.jfeat.am.module.workflow.services.domain.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.domain.dao.QueryTaskDao;
import com.jfeat.am.module.workflow.services.domain.service.QueryTaskService;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
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
public class QueryTaskServiceImpl implements QueryTaskService {

    @Resource
    QueryTaskDao queryTaskDao;

    @Override
    public Page<Task> findTasks(int pageNum, int pageSize, Long userId, Long formId, String status) {
        Page<Task> page = new Page<>();
        page.setCurrent(pageNum);
        page.setSize(pageSize);
        page.setRecords(queryTaskDao.findTasks(page, userId, formId, status));

        return page;
    }

}
