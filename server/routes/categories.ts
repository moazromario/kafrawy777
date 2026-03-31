import { Router } from 'express';
import { supabase } from '../../server';

const router = Router();

// Helper to build tree
function buildTree(categories: any[], parentId: number | null = null): any[] {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: buildTree(categories, cat.id)
    }));
}

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    if (!categories) return res.json([]);
    
    // If parent_id is provided in query, filter by it, otherwise return tree
    if (req.query.parent_id !== undefined) {
      const parentId = req.query.parent_id === 'null' ? null : Number(req.query.parent_id);
      const filtered = categories.filter(c => c.parent_id === parentId);
      return res.json(filtered);
    }

    const tree = buildTree(categories);
    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error) throw error;
    if (!category) return res.status(404).json({ error: 'Category not found' });
    
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name_ar, name_en, parent_id, icon, image, is_active } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name_ar,
        name_en,
        parent_id: parent_id || null,
        icon,
        image,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name_ar, name_en, parent_id, icon, image, is_active } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .update({
        name_ar,
        name_en,
        parent_id: parent_id || null,
        icon,
        image,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id/services
router.get('/:id/services', async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', req.params.id);
      
    if (error) throw error;
    res.json(services || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
