package com.jfeat.am.module.workflow.services.domain.dao;


import org.apache.ibatis.annotations.Param;

public interface QueryVirtualFormAppDao {
    String getAppDesignData(Long id);

    String getAppDesignDataByCode(String code);

    Integer updateAppDesignData(@Param("id")Long id,@Param("designData")String designData);
}