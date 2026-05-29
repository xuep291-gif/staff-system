package com.jfeat.processTask.dao.converter;

import com.jfeat.processTask.dao.dto.TaskDTO;
import com.jfeat.processTask.dao.model.ProcessTask;
import com.jfeat.processTask.dao.vo.TaskVO;
import org.springframework.beans.BeanUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TaskConverter {

    /**
     * DTO转DO（用于新增/修改操作）
     */
    public static ProcessTask toDO(TaskDTO dto) {
        if (dto == null) {
            return null;
        }

        ProcessTask processTaskDO = new ProcessTask();
        BeanUtils.copyProperties(dto, processTaskDO);

        // 特殊字段处理
        if (dto.getAttachmentFile() != null) {
            String ossPath = uploadToOss(dto.getAttachmentFile());
            processTaskDO.setAttachment(ossPath);
        }

        if (dto.getImageFile() != null) {
            String ossPath = uploadToOss(dto.getImageFile());
            processTaskDO.setImageUrl(ossPath);
        }

        return processTaskDO;
    }

    /**
     * DO转VO（用于查询返回）
     */
    public static TaskVO toVO(ProcessTask processTaskDO) {
        if (processTaskDO == null) {
            return null;
        }

        TaskVO vo = new TaskVO();
        BeanUtils.copyProperties(processTaskDO, vo);

        // 状态枚举转换
        vo.setStatusLabel(convertStatus(processTaskDO.getStatus()));

        // 优先级枚举转换
//        vo.setPriorityLabel(convertPriority(taskDO.getPriority()));

        // 时间格式化
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
//        vo.setFormattedStartTime(formatTime(taskDO.getStartTime(), formatter));
//        vo.setFormattedDeadline(formatTime(taskDO.getDeadline(), formatter));

        // 关联信息查询
//        vo.setCreatorName(userService.getUserNameById(taskDO.getCreatedBy()));
//        vo.setAssigneeName(getAssigneeName(taskDO, userService));

        // 计算字段
        vo.setIsExpired(LocalDateTime.now().isAfter(processTaskDO.getDeadline()));

        return vo;
    }

    private static String convertStatus(String status) {
        switch (status) {
            case "PENDING": return "待处理";
            case "IN_PROGRESS": return "进行中";
            case "COMPLETED": return "已完成";
            default: return status;
        }
    }
//
//    private static String getAssigneeName(Task task, UserService userService) {
//        if ("USER".equals(task.getAssigneeType())) {
//            return userService.getUserNameById(task.getAssigneeId());
//        } else {
//            return "组织ID: " + task.getAssigneeId();
//        }
//    }

    private static String uploadToOss(MultipartFile file) {
        // 实现你的OSS上传逻辑
        return "https://oss.example.com/" + file.getOriginalFilename();
    }
}
