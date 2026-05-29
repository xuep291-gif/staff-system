package com.jfeat.processTask.service;

import com.jfeat.processTask.dao.model.TaskTransfer;
import com.jfeat.processTask.dao.vo.TaskTransferVO;

import java.util.List;

public interface TaskTransferService {

    /**
     *
     * @param taskTransfer
     * @param flag  判断是否是第一个节点
     * @return
     */
    int transferTask(TaskTransfer taskTransfer,Boolean flag);


    public List<TaskTransferVO> getTimeline(Long taskId);
}
