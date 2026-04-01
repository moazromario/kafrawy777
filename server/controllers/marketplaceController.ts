import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// --- STORES ---
export const registerStore = async (req: Request, res: Response) => {
  try {
    const { name, address, phone, logo_url, owner_id } = req.body;
    
    // In a real app, validate input using Zod or similar
    if (!name || !phone) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
    }

    const { data, error } = await supabaseAdmin
      .from('stores')
      .insert([{ name, address, phone, logo_url, owner_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'تم تسجيل المتجر بنجاح', store: data });
  } catch (error: any) {
    console.error('[Marketplace] Error registering store:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل المتجر', details: error.message });
  }
};

export const getStoreDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('*, products(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'المتجر غير موجود' });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المتجر' });
  }
};

// --- PRODUCTS ---
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, store_id, search } = req.query;
    
    let query = supabaseAdmin.from('products').select('*, stores(name, logo_url)');

    if (category && category !== 'الكل') query = query.eq('category', category);
    if (store_id) query = query.eq('store_id', store_id);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, stores(name, logo_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'المنتج غير موجود' });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتج' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, stock, category, images, store_id } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ title, description, price, stock, category, images, store_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'تمت إضافة المنتج بنجاح', product: data });
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المنتج' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'تم تحديث المنتج بنجاح', product: data });
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث المنتج' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المنتج' });
  }
};

// --- ORDERS ---
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer_id, store_id, items, total_amount, shipping_address, payment_method } = req.body;
    
    // 1. Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{ 
        customer_id, 
        store_id, 
        total_amount, 
        shipping_address, 
        payment_method,
        status: 'new' 
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({ message: 'تم إنشاء الطلب بنجاح', order });
  } catch (error: any) {
    console.error('[Marketplace] Error creating order:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الطلب' });
  }
};

export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const { store_id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(title, image_url))')
      .eq('store_id', store_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // new, processing, shipped, completed, rejected
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'تم تحديث حالة الطلب', order: data });
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة الطلب' });
  }
};
