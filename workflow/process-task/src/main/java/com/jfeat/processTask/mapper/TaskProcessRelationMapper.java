package com.jfeat.processTask.mapper;


//import com.baomidou.mybatisplus.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.processTask.dao.model.TaskProcessRelation;
import com.jfeat.processTask.dao.model.Team;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface TaskProcessRelationMapper extends BaseMapper<TaskProcessRelation> {



}
