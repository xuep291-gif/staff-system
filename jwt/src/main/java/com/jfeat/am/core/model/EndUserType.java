package com.jfeat.am.core.model;

public class EndUserType {
    Integer code;
    String name;
    Boolean enable;
    String logo;

    EndUserType(){};


    public static ThisClassBuilder builder(){
        return new ThisClassBuilder();
    }

    public static class ThisClassBuilder{

        Integer code;
        String name;
        Boolean enable;
        String logo;

        public ThisClassBuilder code(Integer code) {
            this.code = code;
            return this;
        }

        public ThisClassBuilder name(String name) {
            this.name = name;
            return this;
        }

        public ThisClassBuilder enable(Boolean enable) {
            this.enable = enable;
            return this;
        }

        public ThisClassBuilder logo(String logo) {
            this.logo = logo;
            return this;
        }

        EndUserType  build(){
            EndUserType userType = new EndUserType();
            userType.setCode(code);
            userType.setEnable(enable);
            userType.setLogo(logo);
            userType.setName(name);
            return userType;
        }

    }



    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getEnable() {
        return enable;
    }

    public void setEnable(Boolean enable) {
        this.enable = enable;
    }
}
