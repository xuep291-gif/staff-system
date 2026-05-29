package com.jfeat.am.modular.category.service.impl;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.google.common.collect.Lists;
import com.jfeat.am.common.persistence.dao.CategoryMapper;
import com.jfeat.am.common.persistence.dao.CategoryTypeMapper;
import com.jfeat.am.common.persistence.model.Category;
import com.jfeat.am.common.persistence.model.CategoryType;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.modular.category.domain.dao.CategoryDao;
import com.jfeat.am.modular.category.service.CategoryService;
import com.jfeat.am.modular.category.transfer.BeanKit;
import com.jfeat.am.modular.category.transfer.CategoryVO;
import com.jfeat.am.modular.category.service.impl.CRUDServiceGroupImpl;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/8/8.
 */
@Service
public class CategoryServiceImpl extends CRUDServiceGroupImpl<CategoryMapper, Category> implements CategoryService {

    @Resource
    CategoryDao categoryDao;
    @Resource
    CategoryMapper categoryMapper;
    @Resource
    CategoryTypeMapper categoryTypeMapper;

    public List<Map<String, Object>> recurisivelyFindAllCategories(String identifier,String name,String code) {
        Long orgId = JWTKit.getTenantOrgId();
        orgId = orgId == null ? JWTKit.getOrgId():orgId;
        QueryWrapper<CategoryType> categoryWrapper=new QueryWrapper();
        categoryWrapper.eq("identifier",identifier);
/*        CategoryType categoryType = new CategoryType();
        categoryType.setIdentifier(identifier);*/
        CategoryType categoryTypeResult = categoryTypeMapper.selectOne(categoryWrapper);
        if (categoryTypeResult == null) {
            return null;
        }
        List<Category> rootCategories = categoryDao.findRootCategories(categoryTypeResult.getId(),name,code,orgId);
        return recursivelyGetChildren(categoryTypeResult.getId(), rootCategories);
    }

    private List<Map<String, Object>> recursivelyGetChildren(Long typeId, List<Category> categories) {
        List<Map<String, Object>> result = Lists.newArrayList();
        for (Category category : categories) {
            Map<String, Object> map = BeanKit.beanToMap(category,false);
            List<Category> children = categoryMapper.selectList(
                    new QueryWrapper<Category>().eq(Category.TYPE_ID, typeId).eq(Category.PID, category.getId())
            );
            if (children.size() > 0) {
                List<Map<String, Object>> recursivelyChildren = recursivelyGetChildren(typeId, children);
                map.put("children", recursivelyChildren);
            }
            result.add(map);
        }
        return result;
    }

    public List<Category> findAllCategories(String identifier) {

        QueryWrapper<CategoryType> categoryWrapper=new QueryWrapper();
        categoryWrapper.eq("identifier",identifier);
/*        CategoryType categoryType = new CategoryType();
        categoryType.setIdentifier(identifier);*/
        CategoryType categoryTypeResult = categoryTypeMapper.selectOne(categoryWrapper);
        if (categoryTypeResult == null) {
            return null;
        }
//        return categoryMapper.selectList(new QueryWrapper<Category>().eq(Category.TYPE_ID, categoryTypeResult.getId()));
        return categoryDao.findCategoryWithParentName(categoryTypeResult.getId());
    }

    /*
    *   show
    * */
    public List<Category> findCategory(Page<Category> page,
                                       String identifier, Integer pid) {
        QueryWrapper<CategoryType> categoryWrapper=new QueryWrapper();
        categoryWrapper.eq("identifier",identifier);
/*        CategoryType categoryType = new CategoryType();
        categoryType.setIdentifier(identifier);*/
        CategoryType categoryTypeResult = categoryTypeMapper.selectOne(categoryWrapper);
        if (categoryTypeResult != null) {
            long id = categoryTypeResult.getId();
            List<Category> categoryList = categoryMapper.selectList(new QueryWrapper<Category>().eq("type_id", id));
            return categoryList;
        }
        return null;

    }

    public CategoryType findType(String identifier) {
        QueryWrapper<CategoryType> categoryWrapper=new QueryWrapper();
        categoryWrapper.eq("identifier",identifier);
/*        CategoryType categoryType = new CategoryType();
        categoryType.setIdentifier(identifier);*/
        CategoryType categoryResult = categoryTypeMapper.selectOne(categoryWrapper);
        return categoryResult;
    }

    public List<Category> showCategory(Long typeId, Long pid) {
        QueryWrapper entityWrapper = new QueryWrapper<Category>();
        entityWrapper.eq("type_id", typeId);
        if (pid != null) {
            entityWrapper.eq("pid", pid);
        }
        List<Category> groupTuples = categoryMapper.selectList(entityWrapper);

        return groupTuples;
    }

    /*
    *   delete
    * */
    public Integer deleteCategory(long id) {
        List<Category> categories = categoryMapper.selectList(new QueryWrapper<Category>().eq(Category.PID, id));
        if (categories.size() > 0) {
            return 0;
        }
        return categoryMapper.deleteById(id);
    }

    /*
    *   save
    * */
    public Integer saveCategory(Category category) {
        return categoryMapper.insert(category);
    }

    /*
    *   udpate
    * */
    public Integer updateCategory(Category category) {
        return categoryMapper.updateById(category);
    }

    @Override
    public CategoryVO showCategoryById(Long id) {
        CategoryVO categoryInfo = categoryMapper.getOne(id);
        return categoryInfo;
    }

}
