package com.jfeat.am.module.workflow.api.crud;

import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.constant.ProcessInstanceType;
import com.jfeat.am.module.workflow.services.crud.service.EavProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.PatchProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Map;


@RestController
@RequestMapping("/api/u/workflow")
public class AppWorkflowEndpoint {

    @Resource
    ProcessService processService;
    @Resource
    PatchProcessInstanceService patchProcessInstanceService;
    @Resource
    EavProcessService eavProcessService;
    @Resource
    ProcessMapper processMapper;

    @Resource
    QueryProcessInstanceService queryProcessInstanceService;
    //发起申请用
    //获取第一步 //根据id查看流程 > /api/wf/processes/{id}
/*    @GetMapping("/process/detail/{id}")
    public Tip getProcess(@PathVariable Long id) {
        JSONObject processInfo = processService.selectOne(id,true);
        return SuccessTip.create(processInfo);
    }*/

    //根据code查看流程 发起流程前获取信息  上一个api的code版本
    @GetMapping("/process/code")
    public Tip getProcess(@RequestParam(name = "id" ) String code) {
        System.out.println(JWTKit.getUserId());
        QueryWrapper<Process> processWrapper = new QueryWrapper<>();
        processWrapper.eq("code",code);
        Process process = processMapper.selectOne(processWrapper);
        JSONObject processInfo = processService.selectOne(process.getId(),true);
        return SuccessTip.create(processInfo);
    }


    //发起流程  ->/instances/instanceAndForm
    @PostMapping("/process/start")
    public Tip createInstanceAndFormValue(@RequestBody JSONObject request){

        Integer instanceAndFormValue = patchProcessInstanceService.createInstanceAndFormValue(request);

        return SuccessTip.create(instanceAndFormValue);
    }




    //前端详情页 我的申请 详情api 仅结构 >    @GetMapping("/instanceAndForm/byTableJSON/{id}")
    //传实例id currentFlag = true 下一步骤 代办事项  currentFlag = false 开始步骤 我的申请
    @GetMapping("/instance/detail")
    public Tip getProcessInstanceByTableJSON(@RequestParam(name = "id",required = false,defaultValue = "false")   Long id,
                                             @RequestParam(required = false,defaultValue = "false") Boolean currentFlag) {
        JSONObject resJSON = eavProcessService.getInstanceJson(id,currentFlag);

        return SuccessTip.create(resJSON);
    }


    //表单数据  和上面的结构api一起用
    @GetMapping("/instance/value")
    @ApiOperation(value = "查看 VirtualForm开始步骤的value")
    public Tip getProcessInstanceStartFormValue(@RequestParam (name = "id") Long id,
                                                @RequestParam(required = false,defaultValue = "false") Boolean currentFlag) {
        if(!currentFlag){
            //开始步骤  /instanceAndForm/value/{id}
            Map<String, String> instanceStartFormValue = eavProcessService.getInstanceStartFormValue(id);
            return SuccessTip.create(instanceStartFormValue);
        }else{
            //当前步骤  /instanceAndForm/value/inCurrent/{id}
            Map<String, String> instanceStartFormValue = eavProcessService.getInstanceCurrentFormValue(id);
            return SuccessTip.create(instanceStartFormValue);
        }
    }



    //填完表单 向前推进流程 >  @PostMapping("/instances/instanceAndForm/push")
    @PostMapping("/instance/push")
    public Tip pushInstanceAndFormValue(@RequestBody JSONObject request){

        Integer instanceAndFormValue = patchProcessInstanceService.pushInstanceAndCreateFormValue(request);

        return SuccessTip.create(instanceAndFormValue);
    }


    @GetMapping("/instance/list")
    //获取信息  type 决定 根据用户id搜索是审批人 还是 申请人
    public Tip queryProcessInstances(
            @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(name = "creatorId", required = false) Long creatorId,
            @RequestParam(name = "processId", required = false) Long processId,
            @RequestParam(name = "formId", required = false) Long formId,
            @RequestParam(name = "formGroup", required = false) String formGroup,
            @RequestParam(name = "formType", required = false) String formType,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "creator", required = false) String creator,
            @RequestParam(name = "executor", required = false) String executor,
            @RequestParam(name = "currentUserName", required = false) String currentUserName,
            @RequestParam(name = "type") String type) {
        Long userId = JWTKit.getUserId();
        Long currentId = null;
        switch(type){
            case ProcessInstanceType.CREATOR_IS_ME: creatorId=userId;break;
            case ProcessInstanceType.CURRENT_IS_ME: currentId=userId;break;
            default:throw new BusinessException(4023,"错误的type");
        }

        Long orgId = JWTKit.getTenantOrgId();
        orgId = orgId == null ? JWTKit.getOrgId():orgId;
        //流程管理员可以看全部
        /*if(queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME)){
            userId=null;
        }*/
        Page<ProcessInstance> processInstances = queryProcessInstanceService.findProcessInstances
                (pageNum, pageSize, null, creatorId,
                        processId, formId, formGroup, formType, status, name, creator, executor, currentUserName,currentId,orgId);
        return SuccessTip.create(processInstances);
    }



}
