package com.jfeat.am.module.virtualForm.util;

import java.util.Calendar;
import java.util.Date;

public class CodeUtil {

    public static Integer flag = 0;

    public static String genCode(){
        String code = "";
        StringBuffer  timeCode = new StringBuffer();
        timeCode.append(getTime());
        timeCode.append("-");
        timeCode.append(flag);
        flag++;
        code = timeCode.toString();
        return code;
    }

    public static String genCode(Long entityId){
        StringBuffer code = new StringBuffer();
        StringBuffer  timeCode = new StringBuffer(getTime());
        code.append("-");
        code.append(entityId);
        return code.toString();
    }

    public static String genCode(String seed){
        StringBuffer code = new StringBuffer();
        StringBuffer  timeCode = new StringBuffer(getTime());
        String substring = timeCode.substring(timeCode.length());
        code.append(seed);
        code.append("-");
        code.append(substring);
        return code.toString();
    }

    public static String getTime (){
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH) + 1;
        int day = cal.get(Calendar.DAY_OF_MONTH);
        int time = cal.get(Calendar.HOUR_OF_DAY);

        StringBuffer timeBuffer = new StringBuffer();
        timeBuffer.append(year);
        timeBuffer.append(month);
        timeBuffer.append(day);
        timeBuffer.append(time);
        return timeBuffer.toString();
    }

}
