package com.jfeat.am.module.workflow.api.crud;


import com.jfeat.am.module.workflow.services.domain.dao.QueryVirtualFormAppDao;
import com.jfeat.am.module.workflow.services.domain.model.VirtualFormApp;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code generator
 * @since 2021-03-10
 */
@RestController

@Api("表单模块")
@RequestMapping("/api/u/form")
public class AppVirtualFormEndpoint {

    @Resource
    QueryVirtualFormAppDao queryVirtualFormAppDao;


/*    //查看表单APP设计   查看表单设计的信息在发起申请的时候同时返回即可
    @GetMapping("/design/detail")
    public Tip getDesignData(@RequestParam(name = "id")String code){
        String appDesignData = queryVirtualFormAppDao.getAppDesignDataByCode(code);
        VirtualFormApp virtualFormApp = new VirtualFormApp();
        virtualFormApp.setAppDesignData(appDesignData);
        return SuccessTip.create(virtualFormApp);
    }
*/


    //修改表单 APP设计
    @PostMapping("/design/edit")
    public Tip updateDesignData(@RequestBody VirtualFormApp virtualFormApp){
        Integer integer = queryVirtualFormAppDao.updateAppDesignData(virtualFormApp.getId(), virtualFormApp.getAppDesignData());
        return SuccessTip.create(integer);
    }



}
