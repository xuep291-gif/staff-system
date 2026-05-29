package com.jfeat.am.common.persistence.dao;

import com.jfeat.am.common.persistence.model.Category;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.modular.category.transfer.CategoryVO;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
  *  Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2017-10-19
 */
public interface CategoryMapper extends BaseMapper<Category> {

    public CategoryVO getOne(@Param("id")Long id);
}