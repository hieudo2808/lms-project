package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.CreateCategoryInput;
import com.seikyuuressha.lms.dto.request.UpdateCategoryInput;
import com.seikyuuressha.lms.entity.Categories;
import com.seikyuuressha.lms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CategoryResolver {

    private final CategoryService categoryService;

    @QueryMapping
    public List<Categories> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @QueryMapping
    public Categories getCategoryById(@Argument UUID categoryId) {
        return categoryService.getCategoryById(categoryId);
    }

    @QueryMapping
    public Categories getCategoryBySlug(@Argument String slug) {
        return categoryService.getCategoryBySlug(slug);
    }

    @MutationMapping
    public Categories createCategory(@Argument CreateCategoryInput input) {
        return categoryService.createCategory(input);
    }

    @MutationMapping
    public Categories updateCategory(@Argument UUID categoryId, @Argument UpdateCategoryInput input) {
        return categoryService.updateCategory(categoryId, input);
    }

    @MutationMapping
    public boolean deleteCategory(@Argument UUID categoryId) {
        return categoryService.deleteCategory(categoryId);
    }
}
