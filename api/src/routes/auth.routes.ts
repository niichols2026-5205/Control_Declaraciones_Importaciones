import { Router } from 'express';
import { registerUser, loginUser } from '../services/auth.services';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const result = await registerUser(username, password, role);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
