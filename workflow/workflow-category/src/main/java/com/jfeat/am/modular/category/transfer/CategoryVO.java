package com.jfeat.am.modular.category.transfer;

import com.jfeat.am.common.persistence.model.Category;
import org.hibernate.validator.constraints.NotEmpty;

/**
 * Created by Administrator on 2017/10/17.
 */
public class CategoryVO extends Category {

    private String pName;

    public String getpName() {
        return pName;
    }

    public void setpName(String pName) {
        this.pName = pName;
    }
}
