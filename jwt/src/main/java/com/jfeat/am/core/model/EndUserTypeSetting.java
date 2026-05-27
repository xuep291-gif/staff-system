package com.jfeat.am.core.model;

import java.util.ArrayList;
import java.util.List;


/**
 * @author lengleng
 * @date 2019/2/1
 */
public interface EndUserTypeSetting {

	/** #1 用户类型：超级管理员 <<0, <0: 1> */
	public static final Integer USER_TYPE_ADMIN  = 0b1;
	public static final String USER_TYPE_ADMIN_STRING = 0b1+"";
	/** #2 用户类型：公众用户 <<1, <1: 2> */
	public static final Integer USER_TYPE_PUBLIC = 0b10;
	public static final String USER_TYPE_PUBLIC_STRING = 0b10+"";
	/** #3 用户类型：供应商 <<2, <2: 4> */
	public static final Integer USER_TYPE_SUPPLIER = 	   0b100;
	public static final String USER_TYPE_SUPPLIER_STRING = 0b100+"";
	/** #4 用户类型：租客 <<3, <3: 8> */
	public static final Integer USER_TYPE_TENANT = 		 0b1000;
	public static final String USER_TYPE_TENANT_STRING = 0b1000+"";
	/** #5 用户类型：房东 <<4, <4: 16> */
	public static final Integer USER_TYPE_LANDLORD = 	   0b10000;
	public static final String USER_TYPE_LANDLORD_STRING = 0b10000+"";

	/** #6 用户类型：中介 <<5, <5: 32> */
	public static final Integer USER_TYPE_INTERMEDIARY = 	   0b100000;
	public static final String USER_TYPE_INTERMEDIARY_STRING = 0b100000+"";
	/** #7 用户类型：代理 <<6, <6: 64> */
	public static final Integer USER_TYPE_AGENT = 		0b1000000;
	public static final String USER_TYPE_AGENT_STRING = 0b1000000+"";
	/** #8 用户类型：运维 <<7, <7: 128> */
	public static final Integer USER_TYPE_OPERATION =  		0b10000000;
	public static final String USER_TYPE_OPERATION_STRING = 0b10000000+"";
	/** #9 用户类型：体验用户 <<8, <8: 256> */
	public static final Integer USER_TYPE_EXPERIENCE = 		 0b100000000;
	public static final String USER_TYPE_EXPERIENCE_STRING = 0b100000000+"";
	/** #10 用户类型：租户管理员/社区管理员 <<9, <9: 512> */
	public static final Integer USER_TYPE_TENANT_MANAGER =    	 0b1000000000;
	public static final String USER_TYPE_TENANT_MANAGER_STRING = 0b1000000000+"";

	/** #11 用户类型：销售 <<10, <10: 1024> */
	public static final Integer USER_TYPE_SALES =    	 		 0b10000000000;
	public static final String USER_TYPE_SALES_STRING = 		 0b10000000000+"";

	/** #12 用户类型：二房东 <<11, <11: 2048> */
	public static final Integer USER_TYPE_SECOND_LANDLORD =    	 0b100000000000;
	public static final String USER_TYPE_SECOND_LANDLORD_STRING =0b100000000000+"";


	/** #13 用户类型：团长 <<12, <12: 4096> */
	public static final Integer USER_TYPE_TEAM_LEADER =    	 	 0b1000000000000;
	public static final String USER_TYPE_TEAM_LEADER_STRING =	 0b1000000000000+"";

	/** #14 用户类型：开发者 <<13, <13: 8192> */
	public static final Integer USER_TYPE_DEVELOPER =    	 	 0b10000000000000;
	public static final String USER_TYPE_DEVELOPER_STRING =	 0b10000000000000+"";

	/** #15 用户类型：团友 <<14, <14: 16384> */
	public static final Integer USER_TYPE_GROUP_MEMBER =    	 	 0b100000000000000;
	public static final String USER_TYPE_GROUP_MEMBER_STRING =	 0b100000000000000+"";


	/** #16 用户类型：品牌商 <<15, <15: 32768> */
	public static final Integer USER_TYPE_BRAND =    	 0b1000000000000000;
	public static final String USER_TYPE_BRAND_STRING =	 0b1000000000000000+"";


	/** #17 用户类型：投资商 <<16, <16: 65536> */
	public static final Integer USER_TYPE_INVESTOR =    	 0b10000000000000000;
	public static final String USER_TYPE_INVESTOR_STRING =	 0b10000000000000000+"";



	/** #18 用户类型：社区居民 <<17, <17: 131072> */
	public static final Integer USER_TYPE_RESIDENTS =    	 0b100000000000000000;
	public static final String USER_TYPE_RESIDENTS_STRING =	 0b100000000000000000+"";

	// 以下是视频会议的终端用户类型值
	
	/** #19 普通用户类型 <<18, <18: 262144> */
	Integer USER_TYPE_ORDINARY_USER = 0b1000000000000000000;
	String ORDINARY_USER_STRING = 0b1000000000000000000 + "";

	/** #20 组织管理员 <<19, <19: 524288> */
	Integer USER_TYPE_ORG_ADMIN = 0b10000000000000000000;
	String ORG_ADMIN_STRING = 0b10000000000000000000 + "";

	/** #21 设备用户 <<20, <20: 1048576> */
	Integer USER_TYPE_DEVICE_USER = 0b100000000000000000000;
	String DEVICE_USER_STRING = 0b100000000000000000000 + "";

	/** #22 设备管理员 <<21, <21: 2097152> */
	Integer USER_TYPE_DEVICE_ADMIN = 0b1000000000000000000000;
	String DEVICE_ADMIN_STRING = 0b1000000000000000000000 + "";

	/** #23 用户类型：渠道用户 <<22, <22: 4194304> */
	public static final Integer USER_TYPE_CHANNEL_USER =    	 0b10000000000000000000000;
	public static final String USER_TYPE_CHANNEL_USER_STRING =	 0b10000000000000000000000+"";




	public static  List<EndUserType> getList(){
		ArrayList<EndUserType> typeList = new ArrayList<>();
		typeList.add(EndUserType.builder().code(USER_TYPE_ADMIN).enable(false).name("超级管理员").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_INTERMEDIARY.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_PUBLIC).enable(false).name("公众用户").build());
		
		// 运维
		typeList.add(EndUserType.builder().code(USER_TYPE_OPERATION).enable(true).name("运维").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_OPERATION.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_DEVELOPER).enable(true).name("开发者").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());

		// 团购
		typeList.add(EndUserType.builder().code(USER_TYPE_SUPPLIER).enable(false).name("供应商").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_AGENT).enable(false).name("代理").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_SALES).enable(true).name("销售").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_TEAM_LEADER).enable(true).name("团长").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_GROUP_MEMBER).enable(true).name("团友").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_BRAND).enable(true).name("品牌商").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_INVESTOR).enable(true).name("投资商").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		
		// house
 		typeList.add(EndUserType.builder().code(USER_TYPE_TENANT).enable(true).name("租客").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_TENANT.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_LANDLORD).enable(true).name("房东").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_LANDLORD.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_INTERMEDIARY).enable(true).name("中介").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_INTERMEDIARY.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_EXPERIENCE).enable(true).name("体验用户").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_EXPERIENCE.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_TENANT_MANAGER).enable(true).name("社区管理员").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_EXPERIENCE.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_RESIDENTS).enable(true).name("社区居民").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_SECOND_LANDLORD).enable(true).name("二房东").logo("http://static.smallsaas.cn/house/2022/image/peopleType/USER_TYPE_SALES.png").build());
		
		// 以下是视频会议的终端用户类型值
		typeList.add(EndUserType.builder().code(USER_TYPE_ORDINARY_USER).enable(true).name("普通用户").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_ORG_ADMIN).enable(true).name("组织管理员").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_DEVICE_USER).enable(true).name("设备用户").build());
		typeList.add(EndUserType.builder().code(USER_TYPE_DEVICE_ADMIN).enable(true).name("设备管理员").build());

		// 渠道用户
		typeList.add(EndUserType.builder().code(USER_TYPE_CHANNEL_USER).enable(true).name("渠道用户").build());
		return typeList;
	}
}
