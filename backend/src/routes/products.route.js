import express from 'express';
import { allProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../repositories/product.repository.js';
import { mapCategory } from '../utils/mapCategory.js';

const router = express.Router();

// Get all products with optional filtering
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    filter.category = { $regex: `^${category}$`, $options: 'i' };
  }

  try {
    const products = await allProducts(filter);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  const { name, price, category, image, description, tags } = req.body;
  
  if (!name || price === undefined || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  try {
    const product = await createProduct({
      name,
      price: Number(price),
      category: mapCategory(category),
      image: image || 'https://via.placeholder.com/900x600?text=Product',
      description: description || 'A stylish product made for modern users.',
      tags: tags || ['featured'],
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save product' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { name, price, category, image, description, tags } = req.body;
  
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = {
      name: name ?? product.name,
      price: price !== undefined ? Number(price) : product.price,
      category: category ?? product.category,
      image: image ?? product.image,
      description: description ?? product.description,
      tags: tags ?? product.tags,
    };

    const updated = await updateProduct(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await deleteProduct(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;