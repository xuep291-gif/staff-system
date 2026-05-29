package com.jfeat.processTask.service;

import com.jfeat.processTask.dao.model.Team;

import java.util.List;

public interface TeamService {

    List<Team> findTeamsPage(Team record,  Integer offset, Integer pageSize, String search );
}
