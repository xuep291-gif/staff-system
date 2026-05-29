package com.jfeat.am.module.workflow.api.crud;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.common.annotation.Permission;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.constant.ProcessInstanceType;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceModel;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.PatchProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-26
 */

@RestController
@RequestMapping("/api/pub/wf/instances")
public class ProcessInstanceEndpoint  {

    @Resource
    ProcessInstanceService processInstanceService;

    @Resource
    PatchProcessInstanceService patchProcessInstanceService;

    @Resource
    QueryProcessInstanceService queryProcessInstanceService;

    @PostMapping
    public Tip createProcessInstance(@RequestBody ProcessInstanceModel entity) {
        Long userId = JWTKit.getUserId();
        String account = JWTKit.getAccount();
        return SuccessTip.create(patchProcessInstanceService.createProcessInstance(userId, account, entity));
    }

    @GetMapping("/{id}")
    public Tip getProcessInstance(@PathVariable Long id) {

        ProcessInstanceRecord processInstance = processInstanceService.getProcessInstance(id);

        //判断是否具有流程管理员角色
       // boolean contains = queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME);
        //流程管理员查看全部
       /* if(contains){userId=null;}
        History history = queryHistoryService.getHistory(instance.getFormId(), null, userId);*/
        //非流程管理员才进行判断

        //由外部列表控制 此处不再限制
       /* if(!contains){
            if (!(userId.equals(instance.getCurrentUserId())
                    || userId.equals(instance.getCreatorId())
                    || userId.equals(instance.getExecutorId())
                    || history != null
            )) {
                logger.debug("permission denied. userId = {}, currentUserId = {}, creatorId = {}, executorId = {}",
                        userId, instance.getCurrentUserId(), instance.getCreatorId(), instance.getExecutorId());
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }
        }*/

        return SuccessTip.create(processInstance);
    }

    /**
     * 提交审核，对于回退到发起人阶段的流程单，重新发起审核请求
     *
     * @param id
     * @param entity
     * @return
     */
    @PutMapping("/{id}/submit")
    public Tip submit(@PathVariable Long id, @RequestBody ProcessInstanceModel entity) {
        Long userId = JWTKit.getUserId();
        String account = JWTKit.getAccount();


        return SuccessTip.create(patchProcessInstanceService.submit(id, userId, account, entity));
    }


    /**
     * 审批通过
     *
     * @param id
     * @param entity {
     *               "currentStepId": "1234",
     *               "currentUserId": "1223454",
     *               "currentUserName": "abc",
     *               "note": "thenote"
     *               }
     * @return
     */
    @PutMapping("/{id}/approve")
    public Tip approve(@PathVariable Long id, @RequestBody ProcessInstanceModel entity) {
        Long userId = JWTKit.getUserId();
        String account = JWTKit.getAccount();


        return SuccessTip.create(patchProcessInstanceService.approve(id, userId, account,
                entity.getCurrentStepId(),
                entity.getCurrentUserId(),
                entity.getCurrentUserName(),
                entity.getNote(), entity.getAttachments()));
    }

    /**
     * 审批拒绝
     *
     * @param id
     * @param entity {
     *               "currentStepId": "1234",
     *               "currentUserId": "1223454",
     *               "currentUserName": "abc",
     *               "note": "thenote"
     *               }
     * @return
     */
    @PutMapping("/{id}/reject")
    public Tip reject(@PathVariable Long id, @RequestBody ProcessInstanceModel entity) {
        Long userId = JWTKit.getUserId();
        String account = JWTKit.getAccount();
        //拒绝时只要备注和 (附件可选填)流程实例id即可
        //{
        // "note":"备注"
        // }
        return SuccessTip.create(patchProcessInstanceService.reject(id, userId, account,
                null,
               null,
                null,
                entity.getNote(), entity.getAttachments()));
    }

    /**
     * 审批回退
     *
     * @param id
     * @param entity { "note": "the note" }
     * @return
     */
    @PutMapping("/{id}/rollback")
    public Tip rollback(@PathVariable Long id, @RequestBody ProcessInstanceModel entity) {
        Long userId = JWTKit.getUserId();
        String account = JWTKit.getAccount();

        return SuccessTip.create(patchProcessInstanceService.rollback(id, userId, account, entity.getNote()));
    }

    @DeleteMapping("/{id}")
    public Tip deleteProcessInstance(@PathVariable Long id) {
        return SuccessTip.create(processInstanceService.deleteMaster(id));
    }

    @GetMapping
    //此方法可能需要自行添加需要的参数,按需要使用
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
        if (userId==null){
            throw new BusinessException(BusinessCode.NoPermission,"请携带token请求");
        }
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




    @Permission("workflow.view")
    @GetMapping("/skipFilter")
    public Tip queryProcessInstancesSkipFilter(
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
            @RequestParam(name = "currentUserName", required = false) String currentUserName) {
        if(!JWTKit.getAccount().equals("admin")){
            throw new BusinessException(BusinessCode.CRUD_QUERY_FAILURE,"只能管理员查看 当前账户："+JWTKit.getAccount());
        }
         Long userId = null;
        Long orgId = JWTKit.getTenantOrgId();
        orgId = orgId == null ? JWTKit.getOrgId():orgId;
        return SuccessTip.create(queryProcessInstanceService.findProcessInstances(pageNum, pageSize, userId, creatorId,
                processId, formId, formGroup, formType, status, name, creator, executor, currentUserName,null,orgId));
    }




}
