package com.jfeat.am.module.workflow.services.crud.service.impl;
            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.History;
import com.jfeat.am.module.workflow.services.persistence.dao.HistoryMapper;
import com.jfeat.am.module.workflow.services.crud.service.HistoryService;
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
public class HistoryServiceImpl  extends CRUDServiceOnlyImpl<History> implements HistoryService {


    @Resource
    private HistoryMapper historyMapper;

    @Override
    protected BaseMapper<History> getMasterMapper() {
        return historyMapper;
    }
}


