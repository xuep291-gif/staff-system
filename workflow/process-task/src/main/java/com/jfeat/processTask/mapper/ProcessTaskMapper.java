package com.jfeat.processTask.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
import com.jfeat.processTask.dao.model.ProcessTask;
import org.apache.ibatis.annotations.*;

import java.util.List;


@Mapper
public interface ProcessTaskMapper extends BaseMapper<ProcessTask> {

    // 插入任务
    Integer insertProcessTask(ProcessTask processTask);

    // 根据ID查询任务
    ProcessTask selectById(Long taskId);

    // 查询所有任务
    List<ProcessTask> selectAll();

    // 更新任务
    int update(ProcessTask processTask);

    // 删除任务
    int deleteById(Long taskId);

    // 根据状态查询任务
    List<ProcessTask> selectByStatus(String status);

    // 根据创建人查询任务
    List<ProcessTask> selectByCreator(Long createdBy);

    // 根据负责人查询任务
    List<ProcessTask> selectByAssignee(@Param("assigneeId") Long assigneeId, @Param("assigneeType") String assigneeType);

    /**
     * 分页查询任务
     * @param page 分页对象
     * @param record 任务查询条件对象
     * @param search 全局搜索关键字
     * @return 任务列表
     */
    List<ProcessTask> findTaskPage(@Param("page") Page<ProcessTask> page,
                                   @Param("record") ProcessTask record,
                                   @Param("search") String search);


    List<ProcessTask> selectUserTasks(
            @Param("userId") Long userId,
            @Param("orderBy") String orderBy,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize
    );


}
