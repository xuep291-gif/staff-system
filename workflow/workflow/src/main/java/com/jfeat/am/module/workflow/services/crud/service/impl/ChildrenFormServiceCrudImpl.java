package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.jfeat.am.module.virtualForm.services.domain.dao.QueryVirtualFormDao;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceStepDao;
import com.jfeat.eav.services.domain.model.TitleInfo;
import com.jfeat.eav.services.domain.service.ChildrenFormService;
import com.jfeat.eav.services.domain.service.EavEntityService;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Primary
@Service("ChildrenFormService")
public class ChildrenFormServiceCrudImpl implements ChildrenFormService {
    @Resource
    QueryProcessInstanceStepDao queryProcessInstanceStepDao;

    @Resource
    EavEntityService eavEntityService;
    @Resource
    QueryVirtualFormDao queryVirtualFormDao;

    @Override
    public JSONArray getInfo(String code) {
        JSONArray resultArray = new JSONArray();
        //通过code id 获取对应的虚拟表单数据
        //ProcessInstanceStepModel stepInfo = queryProcessInstanceStepDao.getByFormCodeAndInstanceId( code);
        VirtualFormRecord virtualFormRecord = queryVirtualFormDao.queryVirtualFormByCode(code);
        JSONArray items = eavEntityService.getEavEntity(virtualFormRecord.getEntityId(), virtualFormRecord.getDesignData(), TitleInfo.DETAIL_TITLE, false);
        resultArray.addAll(items);

        return resultArray;
    }
}
