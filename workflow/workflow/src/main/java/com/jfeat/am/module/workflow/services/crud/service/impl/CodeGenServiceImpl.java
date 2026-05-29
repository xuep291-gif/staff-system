package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.services.crud.service.CodeGenService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.persistence.model.CodeBody;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.Calendar;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeGenServiceImpl implements CodeGenService {
    /**
     * [Y]:年 [M]:月 [D]: 日
     * [H]:时 [I]:分 [S]:秒 [W]:星期 [U]:用户名
     * [F]:流程名 [N]:编号（取值并自动增加计数值）
     *
     * 编号例子
     * [Y]为 2021
     * [YY]为 21
     * [YYYY]为 2021
     * [F]为 流程单
     * [M]为 5
     * [D] 为 10
     * [N] 为 1开始计数的数，
     *
     * [F]-[Y]年[M]月[D]日-[N]
     * **/
    @Resource
    QueryProcessInstanceDao queryProcessInstanceDao;

    @Override
    public CodeBody genCode(String codeRule, String flowName){

        if(StringUtils.isEmpty(codeRule)){
            codeRule = "[Y]年[M]月[D]日-[N]";
        }

        CodeBody codeBody = new CodeBody();
        codeBody.setCodeRule(codeRule);

        Pattern compile = Pattern.compile("\\[(\\w+?)\\],?");
        Matcher matcher = compile.matcher(codeRule);
        while(matcher.find()){
            String tag = matcher.group();
            String code = genOneCode(tag,flowName,codeBody).getTransferInfo();
            if(!StringUtils.isEmpty(code)){
                codeRule = matcher.replaceFirst(code);
            }else{
                codeRule = matcher.replaceFirst("");
            }
            matcher = compile.matcher(codeRule);
        }

        codeBody.setCode(codeRule);

       return codeBody ;


    }

    public CodeBody genOneCode(String code,String flowName,CodeBody codeBody){
        Calendar cal = Calendar.getInstance();
        String[] weekDays = {"星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"};
        switch(code){
            case "[Y]":
                Integer year = cal.get(Calendar.YEAR);
                codeBody.setTransferInfo(year.toString());
                return codeBody;
            case "[M]":
                Integer month = cal.get(Calendar.MONTH) + 1;
                codeBody.setTransferInfo(month.toString());
                return codeBody;
            case "[D]":
                Integer day = cal.get(Calendar.DAY_OF_MONTH);
                codeBody.setTransferInfo(day.toString());
                return codeBody;
            case "[H]":
                Integer hour = cal.get(Calendar.HOUR_OF_DAY);
                codeBody.setTransferInfo(hour.toString());
                return codeBody;
            case "[I]":
                Integer i = cal.get(Calendar.MINUTE);
                codeBody.setTransferInfo(i.toString());
                return codeBody;
            case "[S]":
                Integer s = cal.get(Calendar.SECOND);
                codeBody.setTransferInfo(s.toString());
                return codeBody;
            case "[W]":
                Integer w = cal.get(Calendar.DAY_OF_WEEK)-1;
                codeBody.setTransferInfo(weekDays[w]);
                return codeBody;
            case "[U]":
                Long userId = JWTKit.getUserId();
                String userName = queryProcessInstanceDao.getUserNameById(userId);
                codeBody.setTransferInfo(userName);
                return codeBody;
            case "[F]":
                codeBody.setTransferInfo(flowName);
                return codeBody;
            case "[N]":
                Long maxCode = getMaxCode(codeBody);
                codeBody.setTransferInfo(maxCode.toString());
                codeBody.setAutoNumber(maxCode);
                return codeBody;
            default:
                return codeBody;
        }
    }

    public Long getMaxCode(CodeBody codeBody){
        if(codeBody!=null && codeBody.getAutoNumber()!=null){
            return codeBody.getAutoNumber();
        }else{
            Long autoCode = queryProcessInstanceDao.getMaxAutoCode() + 1;
            return autoCode;
        }

    };

}
