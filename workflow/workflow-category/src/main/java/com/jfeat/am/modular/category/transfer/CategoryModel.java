package com.jfeat.am.modular.category.transfer;

import com.jfeat.am.common.persistence.model.Category;
import org.hibernate.validator.constraints.NotEmpty;

/**
 * Created by Administrator on 2017/10/17.
 */
public class CategoryModel extends Category {
    @NotEmpty
    private String identifier;

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
