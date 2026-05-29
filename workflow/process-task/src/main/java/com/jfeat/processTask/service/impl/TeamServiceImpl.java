package com.jfeat.processTask.service.impl;

import com.jfeat.processTask.dao.model.Team;
import com.jfeat.processTask.mapper.TeamMapper;
import com.jfeat.processTask.service.TeamService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class TeamServiceImpl implements TeamService {


    @Resource
    TeamMapper teamMapper;

    @Override
    public List<Team> findTeamsPage(Team record, Integer offset, Integer pageSize, String search) {
        return teamMapper.findTeamsPage(record, offset, pageSize, search);
    }
}
