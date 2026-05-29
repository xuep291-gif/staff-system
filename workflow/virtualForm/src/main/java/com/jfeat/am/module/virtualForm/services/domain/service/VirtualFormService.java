package com.jfeat.am.module.virtualForm.services.domain.service;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.virtualForm.services.gen.crud.model.VirtualFormModel;
import com.jfeat.am.module.virtualForm.services.gen.crud.service.CRUDVirtualFormService;
import com.jfeat.eav.services.domain.model.EavEntityModel;

/**
 * Created by vincent on 2017/10/19.
 */
public interface VirtualFormService extends CRUDVirtualFormService{
    Integer createForm(VirtualFormModel entity);

    Integer updateForm(VirtualFormModel virtualModel);

    void updateAttributeAndJson(EavEntityModel entity, String designForm);

    VirtualFormRecord getOne(Long id);

    JSONObject getOneToJSON(Long id);

    Integer deleteForm(Long id);
}