package com.jfeat.am.module.workflow.services.persistence.dao;

import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * <p>
  *  Mapper 接口
 * </p>
 *
 * @author Code Generator
 * @since 2017-11-10
 */
public interface ProcessInstanceMapper extends BaseMapper<ProcessInstance> {

    /**
     * 查询抄送给指定用户且已审批完成的流程实例
     * @param userId 用户ID
     * @return 流程实例列表
     */
    List<ProcessInstance> findCopyProcessInstances(@Param("userId") Long userId);

}