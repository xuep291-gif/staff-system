package com.jfeat.processTask.service;

import com.jfeat.processTask.dao.dto.TaskNoteDTO;
import com.jfeat.processTask.dao.model.TaskNote;

public interface TaskNoteService {

    int updateTaskNote(TaskNoteDTO taskNoteDTO);

    int updateTaskNote(Long taskId,Long userId,TaskNoteDTO taskNoteDTO);

}
