export default function ProductFilters({ search, category, categories, onSearchChange, onCategoryChange }) {
  return (
    <div className="product-filters">
      <label className="search-field">
        <span className="visually-hidden">Search products</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search style, category, or mood"
        />
      </label>
      <div className="category-buttons">
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            className={option === category ? 'category-button active' : 'category-button'}
            onClick={() => onCategoryChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
