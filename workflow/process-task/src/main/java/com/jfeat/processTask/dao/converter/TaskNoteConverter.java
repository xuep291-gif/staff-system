package com.jfeat.processTask.dao.converter;
import com.jfeat.processTask.dao.dto.TaskNoteDTO;
import com.jfeat.processTask.dao.model.TaskNote;
import org.springframework.beans.BeanUtils;

public class TaskNoteConverter {

    /**
     * 将 TaskNote 转换为 TaskNoteDTO
     * （自动忽略 Model 中 DTO 没有的字段）
     */
    public static TaskNoteDTO convertToDTO(TaskNote taskNote) {
        TaskNoteDTO dto = new TaskNoteDTO();
        BeanUtils.copyProperties(taskNote, dto);
        return dto;
    }
    /**
     * 将 TaskNoteDTO 转换为 TaskNote
     * （自动忽略 DTO 中 Model 没有的字段，如 MultipartFile）
     */
    public static TaskNote convertToModel(TaskNoteDTO taskNoteDTO) {
        TaskNote model = new TaskNote();
        BeanUtils.copyProperties(taskNoteDTO, model);
        return model;
    }
}