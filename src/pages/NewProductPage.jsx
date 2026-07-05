import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = ['Dresses', 'Accessories', 'Outerwear', 'Bottoms'];

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    image: '',
    description: '',
    tags: '',
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Submitting…');

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Unable to add product');
      }

      const newProduct = await response.json();
      navigate(`/product/${newProduct.id}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="page-shell new-product-page">
      <div className="form-panel">
        <p className="eyebrow">Catalog</p>
        <h2>Add a new product</h2>
        <p className="hero-description">Use the form below to create a fresh product entry and publish it instantly.</p>

        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            Product name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Price
            <input name="price" value={form.price} onChange={handleChange} type="number" min="0" step="0.01" required />
          </label>

          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Image URL
            <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows="5" required />
          </label>

          <label>
            Tags
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="new, bestseller" />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Create product
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>

        {status ? <p className="status-message">{status}</p> : null}
      </div>
    </div>
  );
}
