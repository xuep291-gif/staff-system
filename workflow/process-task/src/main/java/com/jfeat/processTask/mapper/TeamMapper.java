package com.jfeat.processTask.mapper;


//import com.baomidou.mybatisplus.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.processTask.dao.model.Team;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface TeamMapper extends BaseMapper<Team> {

    List<Team> findTeamsPage(@Param("record") Team record,@Param("offset") Integer offset,@Param("pageSize") Integer pageSize,@Param("search") String search );


}
