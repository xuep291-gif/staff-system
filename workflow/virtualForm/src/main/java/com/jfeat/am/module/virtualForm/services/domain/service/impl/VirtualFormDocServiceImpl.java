package com.jfeat.am.module.virtualForm.services.domain.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.virtualForm.services.domain.service.VirtualFormDocService;
import com.jfeat.am.module.virtualForm.services.domain.service.VirtualFormService;
import com.jfeat.am.module.virtualForm.services.gen.crud.model.VirtualFormModel;
import com.jfeat.am.module.virtualForm.services.gen.crud.service.impl.CRUDVirtualFormServiceImpl;
import com.jfeat.am.module.virtualForm.services.gen.persistence.dao.VirtualFormMapper;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.virtualForm.util.CodeUtil;
import com.jfeat.eav.services.domain.model.EavEntityModel;
import com.jfeat.eav.services.domain.service.AlibabaEavService;
import com.jfeat.eav.services.domain.service.EavEntityService;
import com.jfeat.eav.services.gen.persistence.model.EavAttribute;
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

@Service("virtualFormDocService")
public class VirtualFormDocServiceImpl  implements VirtualFormDocService {

    @Resource
    EavEntityService eavEntityService;
    @Resource
    VirtualFormMapper virtualFormMapper;

    @Resource
    AlibabaEavService alibabaEavService;





}
