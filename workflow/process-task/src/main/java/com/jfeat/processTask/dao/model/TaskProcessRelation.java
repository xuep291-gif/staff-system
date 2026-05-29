package com.jfeat.processTask.dao.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;


@Data
@TableName("task_process_relation")
public class TaskProcessRelation extends Model<TaskProcessRelation> {

    private static final long serialVersionUID = 1L;
    /**
     * 任务唯一ID（主键，自增）
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long taskId;

    private Long processId;
}
