import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  toggleUserStatus,
  getRoles,
  getCompanies,
  getSystemAdministrators,
  createCompanyWithAdmin,
  toggleCompanyStatus,
} from '../services/auth.services';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Inicio de sesión (público)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener listado de usuarios (Sólo Admin - Aislado por la compañía del admin)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const companyId = (req as any).user?.companyId;
    const users = await getAllUsers(companyId);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear usuario (Sólo Admin - Se asocia automáticamente a la compañía del admin)
router.post('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const companyId = (req as any).user?.companyId;
    const result = await registerUser(username, password, role, companyId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint legado /register por compatibilidad
router.post('/register', verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const companyId = (req as any).user?.companyId;
    const result = await registerUser(username, password, role, companyId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Editar datos de un usuario (Sólo Admin)
router.put('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUsername = (req as any).user?.username;
    const result = await updateUser(id, req.body, requestingUsername);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Alternar estado activo/inactivo (Sólo Admin)
router.patch('/users/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUsername = (req as any).user?.username;
    const result = await toggleUserStatus(id, requestingUsername);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Listar roles disponibles
router.get('/roles', verifyToken, async (req, res) => {
  try {
    const roles = await getRoles();
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Listar compañías disponibles
router.get('/companies', verifyToken, async (req, res) => {
  try {
    const companies = await getCompanies();
    res.status(200).json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Listado consolidado de compañías y administradores del sistema
router.get('/system-administrators', verifyToken, isAdmin, async (req, res) => {
  try {
    const list = await getSystemAdministrators();
    res.status(200).json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva compañía junto con su usuario administrador inicial
router.post('/companies', verifyToken, isAdmin, async (req, res) => {
  try {
    const { companyName, adminUsername, password } = req.body;
    const result = await createCompanyWithAdmin({
      companyName,
      adminUsername,
      password,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Alternar el estado activo/inactivo de una compañía
router.patch('/companies/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCompanyId = (req as any).user?.companyId;
    const result = await toggleCompanyStatus(id, requestingCompanyId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
