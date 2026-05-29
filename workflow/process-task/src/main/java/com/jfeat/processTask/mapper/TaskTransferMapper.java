package com.jfeat.processTask.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
import com.jfeat.processTask.dao.model.TaskTransfer;
import com.jfeat.processTask.dao.vo.TaskTransferVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface TaskTransferMapper extends BaseMapper<TaskTransfer> {

    List<TaskTransferVO> selectTaskTransferHistory(Long taskId);


    int insertTransfer(TaskTransfer taskTransfer);


}
