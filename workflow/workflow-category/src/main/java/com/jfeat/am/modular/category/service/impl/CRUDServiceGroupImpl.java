package com.jfeat.am.modular.category.service.impl;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.jfeat.am.modular.category.service.CRUDServiceGroup;

/**
 * CRUD Service 分组实现类，替代 crud-dev 的 CRUDServiceGroupImpl
 * 
 * @param <M> Mapper 类型
 * @param <T> 实体类型
 */
public abstract class CRUDServiceGroupImpl<M extends BaseMapper<T>, T> extends ServiceImpl<M, T> implements CRUDServiceGroup<T> {
    
}
