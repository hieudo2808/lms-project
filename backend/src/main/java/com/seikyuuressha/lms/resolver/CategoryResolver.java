ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.CreateCategoryRequest;
import com.seikyuuressha.lms.dto.request.UpdateCategoryRequest;
import com.seikyuuressha.lms.dto.response.CategoryResponse;
import com.seikyuuressha.lms.entity.Categories;
import com.seikyuuressha.lms.service.AdminService;
import com.seikyuuressha.lms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CategoryResolver {

    private final AdminService adminService;
    private final CategoryService categoryService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<CategoryResponse> getAllCategories() {
        return adminService.getAllCategories();
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
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(@Argument("input") CreateCategoryRequest input) {
        return adminService.createCategory(input.getName(), input.getSlug(), input.getDescription());
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(
            @Argument UUID categoryId,
            @Argument("input") UpdateCategoryRequest input) {
        return adminService.updateCategory(categoryId, input.getName(), input.getSlug(), input.getDescription());
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteCategory(@Argument UUID categoryId) {
        return adminService.deleteCategory(categoryId);
    }
}
