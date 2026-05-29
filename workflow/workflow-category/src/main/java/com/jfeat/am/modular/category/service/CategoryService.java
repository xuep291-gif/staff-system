package com.jfeat.am.modular.category.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import com.jfeat.am.common.persistence.model.Category;
import com.jfeat.am.common.persistence.model.CategoryType;
import com.jfeat.am.modular.category.transfer.CategoryVO;
import com.jfeat.am.modular.category.service.CRUDServiceGroup;

import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/8/7.
 */
public interface CategoryService extends CRUDServiceGroup<Category> {

    List<Map<String, Object>> recurisivelyFindAllCategories(String identifier,String name,String code);

    public List<Category> findAllCategories(String identifier);

    List<Category> findCategory(Page<Category> page,
                                String identifier, Integer pid);

    CategoryType findType(String identifier);

    Integer deleteCategory(long id);

    List<Category> showCategory(Long typeId, Long pid);

    Integer saveCategory(Category category);

    Integer updateCategory(Category category);

    CategoryVO showCategoryById(Long id);
}
