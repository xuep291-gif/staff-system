package com.jfeat.processTask.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

public class ProcessCodeGenerator {

    private static final String CODE_PREFIX = "PROC"; // 可以根据需要修改前缀

    /**
     * 生成基于时间戳的流程编码
     * 格式: PROC + yyyyMMddHHmmss + 随机数(3位)
     */
    public static String generateProcessCode() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timePart = sdf.format(new Date());
        int randomNum = (int) (Math.random() * 900) + 100; // 生成100-999的随机数
        return CODE_PREFIX + timePart + randomNum;
    }

}