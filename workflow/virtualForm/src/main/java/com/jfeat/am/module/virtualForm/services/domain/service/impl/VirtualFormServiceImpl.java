package com.jfeat.am.module.virtualForm.services.domain.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.virtualForm.services.domain.dao.QueryVirtualFormDao;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.virtualForm.services.domain.service.VirtualFormService;
import com.jfeat.am.module.virtualForm.services.gen.crud.model.VirtualFormModel;
import com.jfeat.am.module.virtualForm.services.gen.crud.service.impl.CRUDVirtualFormServiceImpl;
import com.jfeat.am.module.virtualForm.services.gen.persistence.dao.VirtualFormMapper;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.virtualForm.util.CodeUtil;
import com.jfeat.eav.services.domain.filter.FilterResult;
import com.jfeat.eav.api.util.UserOrgUtil;
import com.jfeat.eav.config.FieldType;
import com.jfeat.eav.services.domain.filter.EavEntityFilter;
import com.jfeat.eav.services.domain.model.EavEntityModel;
import com.jfeat.eav.services.domain.service.AlibabaEavService;
import com.jfeat.eav.services.domain.service.EavEntityService;
import com.jfeat.eav.services.gen.persistence.model.EavAttribute;
import com.jfeat.eav.services.gen.persistence.model.EavEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */

@Service("virtualFormService")
public class VirtualFormServiceImpl extends CRUDVirtualFormServiceImpl implements VirtualFormService {

    private static final Logger logger = LoggerFactory.getLogger(VirtualFormServiceImpl.class);

    @Resource
    EavEntityService eavEntityService;
    @Resource
    VirtualFormMapper virtualFormMapper;

    @Resource
    AlibabaEavService alibabaEavService;
    @Resource
    QueryVirtualFormDao queryVirtualFormDao;

    @Transactional
    @Override
    public Integer createForm(VirtualFormModel entity){
        EavEntityFilterResult eavEntityFilterResult = new EavEntityFilterResult();

        Integer affected = 0;

        /****      处理 eav数据         ***/
        EavEntityModel entityModel = getEavEntityModelByVirtual(entity);
        //设置字段
        updateAttributeAndJson(entityModel,entity.getDesignData());
        affected += eavEntityService.createEavEntity(entityModel, eavEntityFilterResult, null, null);


        /****      处理 映射数据         ***/
        JSONObject result = eavEntityFilterResult.result();
        Long id = result.getLong("id");
        entity.setEntityId(id);
        entity.setCode(CodeUtil.genCode());
        entity.setOrgId(UserOrgUtil.getOrgId());
        affected += virtualFormMapper.insert(entity);

        return affected;
    }


    @Override
    public Integer updateForm(VirtualFormModel virtualModel){
        VirtualForm virtualForm = virtualFormMapper.selectById(virtualModel.getId());
        //更新eav信息
        EavEntityModel entity = getEavEntityModelByVirtual(virtualModel);
        entity.setId(virtualForm.getEntityId());
        updateAttributeAndJson(entity,virtualModel.getDesignData());
        Integer i = eavEntityService.update(entity);
        //更新虚拟表单信息
        i += virtualFormMapper.updateById(virtualModel);
        return i;
    }


    //转换
    EavEntityModel getEavEntityModelByVirtual(VirtualFormModel entity){

//        Long orgId = UserOrgUtil.getOrgId();
        Long orgId = JWTKit.getOrgId();
        EavEntityModel entityModel = new EavEntityModel();
        entityModel.setOrgId(orgId);
        entityModel.setTypeId(entity.getTypeId());
        entityModel.setName(entity.getFormName());
        entityModel.setEntityName(entity.getEntityName());
        List<EavAttribute> children = entity.getChildren();
        if(children!=null && children.size()>0){
            entityModel.setChildren(children); }
        return entityModel;
    }


    @Override
    public void updateAttributeAndJson(EavEntityModel entity, String designForm){
        logger.info("获取的alibabaJSON: {}",designForm);
        if(!StringUtils.isEmpty(designForm)){
            List<EavAttribute> eavAttributeList = alibabaEavService.analysisJSON(designForm);
            if(entity.getChildren()!=null&&entity.getChildren().size()>0){
                //获取attr - id 键值对
                Map<String, Long> oldIdMap  =new HashMap<>();
                for(EavAttribute eavAttribute: entity.getChildren()){
                    if(eavAttribute.getAttributeName()!=null){
                        oldIdMap.put(eavAttribute.getAttributeName(),eavAttribute.getId());
                    }
                }
                //根据attr将id设回去
                for (EavAttribute eavAttribute:eavAttributeList){
                    Long id = oldIdMap.get(eavAttribute.getAttributeName());
                    eavAttribute.setId(id);
                    eavAttribute.setEntityId(entity.getId());
                    eavAttribute.setRequired(false);
                }
            }
            entity.setChildren(eavAttributeList);
        }
    }


    @Override
    public VirtualFormRecord getOne(Long id){
        VirtualFormRecord record = queryVirtualFormDao.queryMasterRecord(id);

        return record;
    }

    @Override
    public JSONObject getOneToJSON(Long id){
        VirtualForm virtualForm = virtualFormMapper.selectById(id);
        EavEntityModel entity = eavEntityService.getOne(virtualForm.getEntityId());
        JSONObject json = (JSONObject) JSON.toJSON(entity);
        json.put("id",virtualForm.getId());
        json.put("entityId",entity.getId());
        json.put("designData",virtualForm.getDesignData());
        json.put("code",virtualForm.getCode());
        json.put("formName",virtualForm.getFormName());
        json.put("appDesignData",virtualForm.getAppDesignData());
        json.put(FieldType.LAYOUT_JSON,alibabaEavService.transform(virtualForm.getDesignData(),false,null,true));
        return json;
    }

    @Override
    public Integer deleteForm(Long id){
        Integer i = 0 ;
        VirtualForm virtualForm = new VirtualForm();
        virtualForm.setId(id);
        virtualForm.setDeleteFlag(true);
        i += virtualFormMapper.updateById(virtualForm);

        return i;
    }

}
