package com.jfeat.processTask.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.processTask.dao.model.TeamUser;
import com.jfeat.processTask.mapper.TeamUserMapper;
import com.jfeat.processTask.service.TeamUserService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/api/teams/{teamId}/members")
public class TeamUserController {

    @Resource
    private TeamUserService teamUserService;


    @Resource
    private TeamUserMapper teamUserMapper;

    // 添加团队成员
    @PostMapping("/{userId}")
    public Tip addMember(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") Integer isLeader) {

        TeamUser teamUser = new TeamUser();
        teamUser.setTeamId(teamId);
        teamUser.setUserId(userId);
        teamUser.setIsLeader(isLeader);
        return SuccessTip.create(teamUserMapper.insert(teamUser));
    }

    // 移除团队成员
    @DeleteMapping("/{userId}")
    public Tip removeMember(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        return SuccessTip.create( teamUserMapper.delete(
                new LambdaQueryWrapper<TeamUser>()
                        .eq(TeamUser::getTeamId, teamId)
                        .eq(TeamUser::getUserId, userId)
        ));
    }

    // 设置团队成员领导状态
    @PutMapping("/{userId}/leadership")
    public SuccessTip updateLeadership(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            @RequestParam Integer isLeader) {

        TeamUser teamUser = new TeamUser();
        teamUser.setIsLeader(isLeader);
        return SuccessTip.create(teamUserMapper.update(
                teamUser,
                new LambdaQueryWrapper<TeamUser>()
                        .eq(TeamUser::getTeamId, teamId)
                        .eq(TeamUser::getUserId, userId)
        ));
    }
}