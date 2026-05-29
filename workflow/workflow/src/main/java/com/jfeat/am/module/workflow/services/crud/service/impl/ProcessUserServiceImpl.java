package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.services.crud.service.ProcessUserService;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.org.services.persistence.dao.SysUserMapper;
import com.jfeat.org.services.persistence.model.SysUser;
import com.jfeat.users.account.services.gen.persistence.dao.UserAccountMapper;
import com.jfeat.users.account.services.gen.persistence.model.UserAccount;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class ProcessUserServiceImpl implements ProcessUserService {


    @Resource
    private SysUserMapper sysUserMapper;

    @Resource
    private UserAccountMapper userAccountMapper;

    @Override
    public Long sysEndConvertEndUser(Long userId) {
        SysUser sysUser = sysUserMapper.selectById(userId);
        if (sysUser == null) {
            return null;
        }
        QueryWrapper<UserAccount> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(UserAccount.REGISTERED_PHONE, sysUser.getPhone());
        List<UserAccount> userAccounts = userAccountMapper.selectList(queryWrapper);
        if (userAccounts.size() > 1) {
            throw new BusinessException(BusinessCode.SYSTEM_LOGIC_ERROR,"存在多个用户");
        } else if (userAccounts.size() == 0) {
            return null;
        }
        return userAccounts.get(0).getId();
    }
}
