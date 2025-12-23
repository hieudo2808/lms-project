package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.CreateCategoryInput;
import com.seikyuuressha.lms.dto.request.UpdateCategoryInput;
import com.seikyuuressha.lms.entity.Categories;
import com.seikyuuressha.lms.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Categories> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Categories getCategoryById(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
    }

    public Categories getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
    }

    @Transactional
    public Categories createCategory(CreateCategoryInput input) {
        // Check if slug already exists
        if (categoryRepository.findBySlug(input.getSlug()).isPresent()) {
            throw new RuntimeException("Category with slug '" + input.getSlug() + "' already exists");
        }

        Categories category = new Categories();
        category.setName(input.getName());
        category.setSlug(input.getSlug());
        category.setDescription(input.getDescription());

        return categoryRepository.save(category);
    }

    @Transactional
    public Categories updateCategory(UUID categoryId, UpdateCategoryInput input) {
        Categories category = getCategoryById(categoryId);

        if (input.getName() != null) {
            category.setName(input.getName());
        }
        if (input.getSlug() != null) {
            // Check if new slug conflicts with another category
            categoryRepository.findBySlug(input.getSlug())
                    .ifPresent(existing -> {
                        if (!existing.getCategoryId().equals(categoryId)) {
                            throw new RuntimeException("Category with slug '" + input.getSlug() + "' already exists");
                        }
                    });
            category.setSlug(input.getSlug());
        }
        if (input.getDescription() != null) {
            category.setDescription(input.getDescription());
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public boolean deleteCategory(UUID categoryId) {
        Categories category = getCategoryById(categoryId);
        
        // Check if category has courses
        if (!category.getCourses().isEmpty()) {
            throw new RuntimeException("Cannot delete category with existing courses. Please reassign or delete courses first.");
        }

        categoryRepository.delete(category);
        return true;
    }
}
