package com.jfeat.am.module.virtualForm.services.gen.crud.model;
// this is serviceModel.java.vm




import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.eav.services.gen.persistence.model.EavAttribute;

import java.util.List;

/**
 * Created by Code generator on 2021-04-26
 *  * slaves.size() : 0
 *  * modelpack : $modelpack
 */
public class VirtualFormModel extends VirtualForm{
    private String entityName;
    private String name;
    private Long typeId;

    String typeName;

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    private List<EavAttribute> children;

    public List<EavAttribute> getChildren() {
        return children;
    }

    public void setChildren(List<EavAttribute> children) {
        this.children = children;
    }



    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
