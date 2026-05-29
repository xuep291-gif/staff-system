package com.jfeat.am.module.workflow.api.crud;

import com.jfeat.am.module.workflow.services.crud.service.*;
import com.jfeat.am.module.workflow.services.persistence.model.CodeBody;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.eav.services.domain.service.ChildrenFormService;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@RestController
@RequestMapping("/api/code")
public class CodeTestEndpoint {

    @Resource
    CodeGenService codeGenService;
    @Resource
    ChildrenFormService childrenFormService;

    @PostMapping("")
    public Tip getTask(@RequestBody CodeBody codeBody) {

        return SuccessTip.create(codeGenService.genCode(codeBody.getCodeRule(),null));
    }


}
