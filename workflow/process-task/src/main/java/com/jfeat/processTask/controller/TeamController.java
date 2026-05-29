package com.jfeat.processTask.controller;


import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.processTask.dao.model.Team;
import com.jfeat.processTask.mapper.TeamMapper;
import com.jfeat.processTask.service.TeamService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Resource
    private TeamService teamService;


    @Resource
     private TeamMapper teamMapper;


    // 创建团队
    @PostMapping
    public Tip createTeam(@RequestBody Team team) {
        return SuccessTip.create(teamMapper.insert(team));
    }

    // 分页查询团队
    @GetMapping
    public Tip getTeams(
            @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(name = "id", required = false) Long id,
            @RequestParam(name = "name",required = false) String name,
            @RequestParam(name = "pid", required = false) Long pid,
            @RequestParam(name = "search", required = false) String search) {
        Team team = new Team();
        team.setId(id);
        team.setTeamName(name);
        team.setPid(pid);
        return SuccessTip.create( teamService.findTeamsPage(team,pageNum,pageSize,search));
    }

    // 获取团队详情
    @GetMapping("/{id}")
    public Tip getTeamDetail(@PathVariable Long id) {
        return SuccessTip.create(teamMapper.selectById(id));
    }

    // 更新团队信息
    @PutMapping("/{id}")
    public Tip updateTeam(@PathVariable Long id, @RequestBody Team team) {
        team.setId(id);
        return SuccessTip.create(teamMapper.updateById(team));
    }

    // 删除团队
    @DeleteMapping("/{id}")
    public Tip deleteTeam(@PathVariable Long id) {
        return SuccessTip.create(teamMapper.deleteById(id));
    }
}