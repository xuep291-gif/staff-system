package com.jfeat.am.modular.category.domain.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.common.persistence.model.Category;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Created by kang on 2017/10/11.
 */
public interface CategoryDao extends BaseMapper<Category> {

    /**
     * 查找pid为null，type_id对应的category_type的identifier为指定值的记录
     *
     * @param typeId
     * @return
     */
    List<Category> findRootCategories(@Param("typeId") Long typeId,@Param("name") String name,@Param("code") String code,@Param("orgId") Long orgId);


    List<Category> findCategoryWithParentName(@Param("typeId") Long typeId);
}
