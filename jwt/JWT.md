## JWT 配置说明


### 平台用户系统说明

#### jwt secret
```
L7A/6zARSkK1j7Vd5SDD9pSSqZlqF7mAhiOgRbgv9Smce6tf4cJnvKOjtKPxNNnWQj+2lQEScm3XIUjhW+YVZg==
```

#### claim

|  声明   | 描述  |类型|
|  ----  | ----  | ---- |
|orgId|组织隔离id | claim|
|userId|用户id|id,claim|
|userType|用户类型(见下表)|claim|
|devUserType|默认0 1=Tester, 2=developer, 3=operator|claim|
|channelNo|用户所属渠道编号|claim|
|account|用户登录账户| Subject,claim|
|ttlMillis|过期时间|Expiration|
|tenantOrgId|租户的组织id|claim|


#### 用户类型`userType`

|类型|编号|
|---|---|
|传统平台用户|0|
|平台管理员|101|
|平台总主管|102|
|平台店小二主管|103|
|平台店小二|104|
|平台商务主管|105|
|平台商务|106|
|平台用户|107|
|企业用户 审核前|200|
|企业用户 审核后|201|
|企业用户|202|
|供应商管理员|301|
|供应商执行人|302|


### 终端用户系统说明

#### jwt secret
`normal-encoded-key` encoded base64 as below
```
bm9ybWFsLWVuY29kZWQta2V5
```

#### claim

|  声明   | 描述  |类型|
|  ----  | ----  | ---- |
|orgId|组织隔离id | claim|
|userId|用户id|id,claim|
|account|用户登录账户| Subject,claim|
|domainUserId|用于透传业务层用户ID，用户不可见|claim|
|type|用户类型(见下表)|claim|
|ttlMillis|过期时间|Expiration|


#### 用户类型`type`

|  用户类型   | 值  |
|  ----  | ----  | 
|超级管理员|1|
|公众用户|2|
|供应商|4|
|租客|8 |
|房东|16|
|中介|32|
|代理|64|
|运维|128|
|体验用户|256 |
|租户管理员 社区管理员|512 |
|销售|1024 |
|二房东 | 2048 |
|团长 |4096 |



## `token` 解释例子
```
eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJvcmdJZCI6ODcsInVzZXJJZCI6NDcxLCJhY2NvdW50IjoiNzE2MzUyMmVmMTUwNGZhYjllYTVkYjU1Yjg3NzdkZTgiLCJkb21haW5Vc2VySWQiOiIiLCJ0eXBlIjo2NCwiaWF0IjoxNjY1NzQyMTIyLCJqdGkiOiI0NzEiLCJzdWIiOiI3MTYzNTIyZWYxNTA0ZmFiOWVhNWRiNTViODc3N2RlOCIsImV4cCI6MTY2NjAwMTMyMn0.n8U8Igel6jr7ej0wiwrb4EADbVzomov3OcokcF4sK__YpvJ6RSnIS6juslZXQjzWPKQH2bGkShGUMA4-KlDziA
```

#### `Base64` 解码
```
eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ
````

```json
{"type":"JWT","alg":"HS512"}
```

#### `Base64` 解码 (第二段)
```
eyJvcmdJZCI6ODcsInVzZXJJZCI6NDcxLCJhY2NvdW50IjoiNzE2MzUyMmVmMTUwNGZhYjllYTVkYjU1Yjg3NzdkZTgiLCJkb21haW5Vc2VySWQiOiIiLCJ0eXBlIjo2NCwiaWF0IjoxNjY1NzQyMTIyLCJqdGkiOiI0NzEiLCJzdWIiOiI3MTYzNTIyZWYxNTA0ZmFiOWVhNWRiNTViODc3N2RlOCIsImV4cCI6MTY2NjAwMTMyMn0
```

```json
{"orgId":87,"userId":471,"account":"7163522ef1504fab9ea5db55b8777de8","domainUserId":"","type":64,"iat":1665742122,"jti":"471","sub":"7163522ef1504fab9ea5db55b8777de8","exp":1666001322}
```

