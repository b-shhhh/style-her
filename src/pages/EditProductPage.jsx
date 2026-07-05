import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const categories = ['Dresses', 'Accessories', 'Outerwear', 'Bottoms'];

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    image: '',
    description: '',
    tags: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Unable to load product');
        }
        const data = await response.json();
        setForm({
          name: data.name,
          price: data.price,
          category: data.category,
          image: data.image,
          description: data.description,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : JSON.parse(data.tags || '[]').join(', '),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving…');

    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        image: form.image,
        description: form.description,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Unable to update product');
      }

      navigate(`/product/${id}`);
    } catch (err) {
      setStatus(err.message);
    }
  };

  if (loading) {
    return <div className="page-shell status-message">Loading product…</div>;
  }

  if (error) {
    return <div className="page-shell status-message">{error}</div>;
  }

  return (
    <div className="page-shell new-product-page">
      <div className="form-panel">
        <p className="eyebrow">Catalog</p>
        <h2>Edit product</h2>
        <p className="hero-description">Update product details and save changes to the catalog.</p>

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
              Save changes
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
