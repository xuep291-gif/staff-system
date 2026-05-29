package com.jfeat.am.module.virtualForm.services.gen.crud.service.impl;
// ServiceImpl start

            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.crud.plus.FIELD;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.virtualForm.services.gen.persistence.dao.VirtualFormMapper;
import com.jfeat.am.module.virtualForm.services.gen.crud.service.CRUDVirtualFormService;
import org.springframework.stereotype.Service;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import javax.annotation.Resource;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;

/**
 * <p>
 *  implementation
 * </p>
 *CRUDVirtualFormService
 * @author Code generator
 * @since 2021-04-26
 */

@Service
public class CRUDVirtualFormServiceImpl extends CRUDServiceOnlyImpl<VirtualForm> implements CRUDVirtualFormService {





        @Resource
        protected VirtualFormMapper virtualFormMapper;

        @Override
        protected BaseMapper<VirtualForm> getMasterMapper() {
            return virtualFormMapper;
        }
}


