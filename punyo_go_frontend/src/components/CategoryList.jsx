import React from 'react';
import './CategoryList.css';
import { api } from '../api';

const CategoryList = ({ categories, selectedCategory, onSelectCategory, onShowAllCategories, language }) => {
    // Only show max 15 categories on the home page with horizontal scroll
    const displayCategories = categories.slice(0, 15);

    return (
        <div className="category-section">
            <div className="section-header">
                <h2>{language === 'ru' ? 'Категории' : 'Kategoriyalar'}</h2>
                <span className="view-all" onClick={onShowAllCategories}>
                    {language === 'ru' ? 'Все' : 'Barchasi'} &gt;
                </span>
            </div>
            
            <div className="category-grid">
                {displayCategories.map(category => (
                    <div 
                        key={category.id} 
                        className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="category-image-container">
                            {category.image_base64 || category.image ? (
                                <img src={category.image_base64 || api.getImageUrl(category.image)} alt={category.name} loading="lazy" />
                            ) : (
                                <span className="category-icon">📦</span>
                            )}
                        </div>
                        <span className="category-name">
                            {language === 'ru' ? (category.name_ru || category.name) : category.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
