package com.jfeat.am.module.workflow.api.crud;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.crud.document.services.domain.dao.QueryPdfAttributeDao;
import com.jfeat.crud.document.services.domain.model.PdfAttributeRecord;
import com.jfeat.am.module.workflow.services.crud.service.EavProcessService;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.am.module.workflow.services.crud.service.PatchProcessInstanceService;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pub/wf")
public class EavProcessEndpoint {


    @Resource
    PatchProcessInstanceService patchProcessInstanceService;
    @Resource
    QueryPdfAttributeDao queryPdfAttributeDao;
    @Resource
    EavProcessService eavProcessService;

    //发起流程
    @PostMapping("/instances/instanceAndForm")
    public Tip createInstanceAndFormValue(@RequestBody JSONObject request){
        Integer instanceAndFormValue = patchProcessInstanceService.createInstanceAndFormValue(request);
        return SuccessTip.create(instanceAndFormValue);
    }

    //填完表单 向前推进流程
    @PostMapping("/instances/instanceAndForm/push")
    public Tip pushInstanceAndFormValue(@RequestBody JSONObject request){

        Integer instanceAndFormValue = patchProcessInstanceService.pushInstanceAndCreateFormValue(request);

        return SuccessTip.create(instanceAndFormValue);
    }



/*    @GetMapping("/instanceAndForm/{id}")
    public Tip getProcessInstance(@PathVariable Long id) {
        JSONObject resJSON = eavProcessService.getInstanceJson(id, null);
        return SuccessTip.create(resJSON);
    }*/

    //前端详情页 我的申请 详情api 仅结构
    @GetMapping("/instanceAndForm/byTableJSON/{id}")
    public Tip getProcessInstanceByTableJSON(@PathVariable Long id,
                                             @RequestParam(required = false,defaultValue = "false") Boolean currentFlag) {
        JSONObject resJSON = eavProcessService.getInstanceJson(id,currentFlag);

        return SuccessTip.create(resJSON);
    }

    //表单数据  标记为start的那一步的信息
    @GetMapping("/instanceAndForm/value/{id}")
    @ApiOperation(value = "查看 VirtualForm开始步骤的value")
    public Tip getProcessInstanceStartFormValue(@PathVariable Long id) {

        Map<String, String> instanceStartFormValue = eavProcessService.getInstanceStartFormValue(id);
        return SuccessTip.create(instanceStartFormValue);
    }

    @GetMapping("/instanceAndForm/value/inCurrent/{id}")
    @ApiOperation(value = "查看 VirtualForm当前步骤的value")
    public Tip getProcessInstanceFormValue(@PathVariable Long id) {

        Map<String, String> instanceStartFormValue = eavProcessService.getInstanceCurrentFormValue(id);
        return SuccessTip.create(instanceStartFormValue);
    }


/*    @GetMapping("/instanceAndForm/byTableJSON/{id}")
    public Tip getInstanceDetail(@PathVariable Long id){

    }*/

    //根据表单id返回绑定情况
    @GetMapping("/doc/entity/{entityId}")
    public Tip docInfoByEntityId(@PathVariable Long entityId){
        List<PdfAttributeRecord> docByEntity = queryPdfAttributeDao.findDocByEntity(entityId);
        return SuccessTip.create(docByEntity);
    }


    //根据流程id获取绑定信息
    @GetMapping("/instanceAndForm/doc/{id}")
    public Tip docInfo(
            @PathVariable Long id
    ){

        /*ProcessInstanceRecord processInstance = processInstanceService.getProcessInstance(id);*/
        List<PdfAttributeRecord> docList = queryPdfAttributeDao.findDocByInstance(id);
        if(docList==null || docList.size()==0){
            throw new BusinessException(4023,"打印失败，当前流程对应的表单没有绑定文档。");
        }
        //手动组合
        HashMap<Long, List<PdfAttributeRecord>> map = new HashMap();
        for(PdfAttributeRecord doc : docList){
            Long stepId = doc.getStepId();
            List<PdfAttributeRecord> pdfAttributeRecords = map.get(stepId);
            if(pdfAttributeRecords!=null && pdfAttributeRecords.size()>0){
                pdfAttributeRecords.add(doc);
            }else{
                List<PdfAttributeRecord> newList = new ArrayList<>();
                newList.add(doc);
                map.put(stepId,newList);
            }

        }
        return SuccessTip.create(map);
    }


}
