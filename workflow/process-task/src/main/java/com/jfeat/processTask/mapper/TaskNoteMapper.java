package com.jfeat.processTask.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.processTask.dao.model.TaskNote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface TaskNoteMapper extends BaseMapper<TaskNote> {

    TaskNote selectNoteByLatestTransfer(
            @Param("taskId") Long taskId,
            @Param("fromAssigneeType") String fromAssigneeType,
            @Param("fromAssigneeId") Long fromAssigneeId
    );
}
