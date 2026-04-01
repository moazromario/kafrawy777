import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController';

const router = Router();

// --- Stores ---
router.post('/stores/register', marketplaceController.registerStore);
router.get('/stores/:id', marketplaceController.getStoreDetails);

// --- Products ---
router.get('/products', marketplaceController.getProducts);
router.get('/products/:id', marketplaceController.getProductById);
router.post('/products', marketplaceController.createProduct);
router.put('/products/:id', marketplaceController.updateProduct);
router.delete('/products/:id', marketplaceController.deleteProduct);

// --- Orders ---
router.post('/orders', marketplaceController.createOrder);
router.get('/orders/seller/:store_id', marketplaceController.getSellerOrders);
router.patch('/orders/:id/status', marketplaceController.updateOrderStatus);

export default router;
