package com.jfeat.am.module.workflow.services.crud.service.impl;
            
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.workflow.constant.ProcessStatusStepTypeEnum;
import com.jfeat.am.module.workflow.constant.ProcessStepTypeEnum;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessModel;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.plus.FIELD;
import com.jfeat.crud.plus.impl.CRUDServiceOverModelImpl;
import com.jfeat.eav.services.domain.model.TitleInfo;
import com.jfeat.eav.services.domain.service.AlibabaEavService;
import org.springframework.stereotype.Service;
import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 *  implementation
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@Service
public class ProcessServiceImpl  extends CRUDServiceOverModelImpl<Process, ProcessModel>
        implements ProcessService {

    @Resource
    private ProcessStepService processStepService;


    @Resource
    private ProcessMapper processMapper;

    @Resource
    private ProcessStepMapper processStepMapper;
    @Resource
    private QueryProcessDao queryProcessDao;
    @Resource
    private AlibabaEavService alibabaEavService;

    @Override
    protected BaseMapper<Process> getMasterMapper() {
        return processMapper;
    }

    // 与前端通信的从表JSON数据KEY
    // {
    //    "steps": []
    // }
    private static final String processStepKeyName = "steps";
    // 从表中关联主表的字段名
    private static final String processStepFieldName = ProcessStep.PROCESS_ID;

    @Override
    protected String[] slaveFieldNames() {
        return new String[] { processStepKeyName };
    }

    @Override
    protected String[] childFieldNames() {
        return new String[0];
    }

    @Override
    protected FIELD onSlaveFieldItem(String field) {
        FIELD _field = new FIELD();

        _field.setItemKeyName(field);
        _field.setItemFieldName(processStepFieldName);
        _field.setItemClassName(ProcessStep.class);
        _field.setItemMapper(processStepMapper);

        return _field;
    }

    @Override
    protected FIELD onChildFieldItem(String s) {
        return null;
    }

    @Override
    protected Class<Process> masterClassName() {
        return Process.class;
    }

    @Override
    protected Class<ProcessModel> modelClassName() {
        return ProcessModel.class;
    }


    @Override
    public JSONObject selectOne(Long id,Boolean appData){
        ProcessModel process = queryProcessDao.findProcess(id);
        if(process!=null) {
            //转json
            JSONObject result = JSONObject.parseObject(JSON.toJSONString(process));
            //获取开始步骤的下一步
            List<ProcessStepModel> nextStep = processStepService.findNextStep(id, null);
            result.put("nextSteps",nextStep);
            //获取 组装表单信息
            JSONObject formInfo = new JSONObject();
            if(appData){
                String appDesignData = processStepService.getStartStepDesignJson(id);
                JSONObject appJson = JSONObject.parseObject(appDesignData);
                formInfo.put("appDesignData",appJson);
            }else{
                String designString = processStepService.getStartStepFormJson(id);
                JSONArray layoutJson = alibabaEavService.transform(designString,false, TitleInfo.DETAIL_TITLE,true);
                formInfo.put("layoutJson",layoutJson);
            }
            result.put("formInfo",formInfo);

            return result;
        }
        throw new BusinessException(BusinessCode.BadRequest.getCode(), "没有找到相关流程 id="+id);
    }

    //为空返回 true  不为空 返回false
    @Override
    public Boolean checkProcessInstance(Long processId){
        //搜索特定ProcessId下的全部实例
        List<ProcessInstance> processInstances = queryProcessDao.selectInstanceByProcess(processId);
        if(processInstances!=null && processInstances.size()>0){
            return false;
        }
        return true;
    }

    @Override
    public Integer createProcess(Process process) {
        processMapper.insert(process);
        ProcessStep start = new ProcessStep();
        start.setProcessId(process.getId());
        start.setPid(-1L);
        start.setName("开始");
        start.setType(ProcessStepTypeEnum.START.name());
        start.setStepType(ProcessStatusStepTypeEnum.APPROVED.name());
        start.setVirtualFormCode("start");
        processStepMapper.insertAndReturnId(start);


        ProcessStep end = new ProcessStep();
        end.setProcessId(process.getId());
        end.setPid(start.getId());
        end.setNextId(-1L);
        end.setName("结束");
        end.setType(ProcessStepTypeEnum.END.name());
        end.setStepType(ProcessStatusStepTypeEnum.APPROVED.name());
        end.setVirtualFormCode("end");
        processStepMapper.insertAndReturnId(end);

        start.setNextId(end.getId());
        processStepMapper.updateById(start);

        return 0;
    }


}


