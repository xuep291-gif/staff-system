package com.jfeat.am.module.workflow.services.crud.service;

import com.jfeat.am.module.workflow.services.persistence.model.CodeBody;

public interface CodeGenService {
    CodeBody genCode(String codeRule, String flowName);
}
