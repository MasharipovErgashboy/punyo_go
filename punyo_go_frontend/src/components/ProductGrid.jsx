import { getImageUrl } from '../api';
import './ProductGrid.css';

export default function ProductGrid({ products, language, favorites = [], onToggleFavorite, onProductClick }) {
    if (products.length === 0) {
        return <div className="no-products">
            {language === 'ru' ? 'Товары не найдены' : 'Mahsulotlar topilmadi'}
        </div>;
    }

    return (
        <div className="product-grid">
            {products.map(product => {
                const isFavorite = favorites.includes(product.id);
                return (
                    <div key={product.id} className="product-card" onClick={() => onProductClick && onProductClick(product)}>
                        <div className="product-image">
                            <button
                                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(product.id);
                                }}
                            >
                                {isFavorite ? '❤️' : '🤍'}
                            </button>
                            {product.image_base64 || product.image ? (
                                <img src={product.image_base64 || getImageUrl(product.image)} alt={product.name} />
                            ) : (
                                <div className="placeholder-image">🖼️</div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">
                                {language === 'ru' ? (product.name_ru || product.name) : product.name}
                            </h3>
                            {product.restaurant_name && (
                                <p className="product-restaurant">{product.restaurant_name}</p>
                            )}
                            <p className="product-price">{product.price.toLocaleString()} UZS</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
