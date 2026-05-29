package com.jfeat.processTask.dao.vo;

import lombok.Data;

import java.util.Date;

@Data
public class TaskNoteVO {
//    private String fromStatus;
//    private String toStatus;
    private String handlerName;
    private String note;
    private String imageUrl;
    private String attachment;
    private Date createTime;
}
