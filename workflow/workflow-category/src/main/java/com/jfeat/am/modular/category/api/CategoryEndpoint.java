package com.jfeat.am.modular.category.api;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.common.persistence.dao.CategoryTypeMapper;
import com.jfeat.am.common.persistence.model.Category;
import com.jfeat.am.common.persistence.model.CategoryType;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.modular.category.service.CategoryService;
import com.jfeat.am.modular.category.transfer.CategoryModel;
import com.jfeat.am.modular.category.common.BusinessLog;
import com.jfeat.am.modular.category.common.ErrorTip;
import com.jfeat.am.modular.category.common.SuccessTip;
import com.jfeat.am.modular.category.common.Tip;
import com.jfeat.am.modular.category.common.CRUD;
import com.jfeat.am.modular.category.common.GROUP;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/8/7.
 */
@RestController
@RequestMapping("/api/adm/categories")
public class CategoryEndpoint  {
    @Resource
    CategoryService categoryService;
    @Resource
    CategoryTypeMapper categoryTypeMapper;


    /**
     * all categories with tree structure
     *
     * @param identifier
     * @return
     */
    @GetMapping("/all/tree")
    public Tip recurisivelyFindAllCategories(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "code",required = false) String code,
            @RequestParam(name = "identifier") String identifier) {
        List<Map<String, Object>> result = categoryService.recurisivelyFindAllCategories(identifier,name,code);
        return SuccessTip.create(result);
    }

    /**
     * all categories
     *
     * @param identifier
     * @return
     */
    @GetMapping("/all")
    public Tip findAllCategories(@RequestParam(name = "identifier", required = true) String identifier) {
        List<Category> result = categoryService.findAllCategories(identifier);
        return SuccessTip.create(result);
    }

    @GetMapping
    public Tip showTCategory(
            @RequestParam(name = "identifier", required = true) String identifier,
            @RequestParam(name = "pid", required = false) Long pid) {
        CategoryType result = categoryService.findType(identifier);
        if (result == null) {
            ErrorTip errorTip = new ErrorTip(1004, "请求数据格式不正确");
            return errorTip;
        }
        List<Category> categoryList = categoryService.showCategory(result.getId(), pid);
        return SuccessTip.create( GROUP.toJSONObject(categoryList));
    }

    @GetMapping("/{id}")
    public Tip showTCategoryById(@PathVariable Long id) {
        return SuccessTip.create(categoryService.showCategoryById(id));
    }


    /*
    *   save    未加入validator验证
    * */
    @PostMapping
    @BusinessLog(name = "流程类别",value = "新增 流程类别")
    public Tip saveTCategory(@RequestBody CategoryModel categoryModel) {
        Long orgId = JWTKit.getTenantOrgId();
        categoryModel.setOrgId(orgId == null ? JWTKit.getOrgId():orgId);
        List<CategoryType> list = categoryTypeMapper.selectList(new QueryWrapper<CategoryType>().eq(CategoryType.IDENTIFIER, categoryModel.getIdentifier()));
        if (list.size() == 0) {
            return ErrorTip.create(2000, "identifier is required");
        }
        Category category = new Category();
        category = CRUD.castObject(categoryModel, Category.class);
        //BeanKit.copyProperties(categoryModel, category);
        category.setTypeId(list.get(0).getId());
        Integer result = categoryService.saveCategory(category);
        return SuccessTip.create(result);
    }

    /*
    *   delete
    * */
    @DeleteMapping("/{id}")
    @BusinessLog(name = "流程类别",value = "删除 流程类别")
    public Tip deleteTCategory(@PathVariable long id) {
        Integer result = categoryService.deleteCategory(id);
        if (result == 0) {
            return ErrorTip.create(2001, "此类别已有下级类别，不能删除");
        }
        return SuccessTip.create(result);
    }

    /*
    *   udpate
    * */
    @PutMapping
    @BusinessLog(name = "流程类别",value = "修改 流程类别")
    public Tip updateTCategory(@RequestBody Category category) {
        if (category.getPid() != null && category.getPid().equals(category.getId())) {
            return ErrorTip.create(2002, "此类别不能作为自己的子类别");
        }
        Integer result = categoryService.updateCategory(category);
        return SuccessTip.create(result);
    }

    /*
     *   udpate
     * */
    @PutMapping("/{id}")
    @BusinessLog(name = "流程类别",value = "修改 流程类别")
    public Tip updateTCategory(@RequestBody Category category, @PathVariable Long id) {
        category.setId(id);
        if (category.getPid() != null && category.getPid().equals(category.getId())) {
            return ErrorTip.create(2002, "此类别不能作为自己的子类别");
        }
        Integer result = categoryService.updateCategory(category);
        return SuccessTip.create(result);
    }
}
