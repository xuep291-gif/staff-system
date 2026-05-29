package com.jfeat.am.module.virtualForm.services.domain.dao;

import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.crud.plus.QueryMasterDao;
import org.apache.ibatis.annotations.Param;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.virtualForm.services.gen.crud.model.VirtualFormModel;

import java.util.Date;
import java.util.List;

/**
 * Created by Code generator on 2021-04-26
 */
public interface QueryVirtualFormDao extends QueryMasterDao<VirtualForm> {
   /*
    * Query entity list by page
    */
    List<VirtualFormRecord> findVirtualFormPage(Page<VirtualFormRecord> page, @Param("record") VirtualFormRecord record,
                                            @Param("search") String search, @Param("orderBy") String orderBy,
                                            @Param("startTime") Date startTime, @Param("endTime") Date endTime,
                                            @Param("typeId")Long typeId);

    /*
     * Query entity model for details
     */
    VirtualFormModel queryMasterModel(@Param("id") Long id);


    VirtualFormRecord queryMasterRecord(@Param("id") Long id);


    VirtualFormRecord queryVirtualFormByCode(@Param("code")String code);
}