package com.jfeat.am.module.workflow.services.persistence.dao;

import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Options;
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
public interface ProcessStepMapper extends BaseMapper<ProcessStep> {

    List<ProcessStep> selectNextSteps(@Param("processId")Long processId,@Param("search") String search);

    //根据流程id获取开始步骤的信息
    List<ProcessStepModel> selectStartStepByProcessId(@Param("processId")Long processId);
    //获取开始流程的下一步
    ProcessStepModel selectStartStepNextStep(@Param("processId")Long processId);

    List<ProcessStep> selectStepsInIds(@Param("ids")List<Long> ids);

    /**
     * 批量查询步骤信息
     * @param processId 流程ID
     * @param stepIds 步骤ID列表
     * @return 步骤列表
     */
    List<ProcessStep> selectStepsInProcess(@Param("processId") Long processId, @Param("stepIds") List<Long> stepIds);


    ProcessStepModel selectModel(@Param("id")Long id);
    //根据ids获取下一步的信息列表
    List<ProcessStepModel> selectNextStepsById(@Param("ids")List<Long> ids);

    //获取某个流程开始步骤的表单json
    String selectStartStepFormJson(Long processId);
    //获取某个流程开始步骤的 App设计JSON
    String selectStartStepDesignJson(Long processId);

    //根据步骤id获取表单的id
    Long getEntityIdByStepId(Long stepId);

    //根据步骤id获取设计数据
    String getDesignJsonByStepId(Long stepId);

    /**
     * 批量更新步骤信息
     * @param steps 需要更新的步骤列表
     * @return 更新记录数
     */
    int updateBatchById(@Param("steps") List<ProcessStep> steps);

    /**
     * 插入步骤并返回ID
     * @param processStep 要插入的步骤
     * @return 插入记录的ID
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertAndReturnId(ProcessStep processStep);

}