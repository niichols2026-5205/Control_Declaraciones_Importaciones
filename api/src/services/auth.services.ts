import User, { IUser } from '../models/user.models';
import jwt from 'jsonwebtoken';

export const registerUser = async (username: string, password: string) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error('El usuario ya existe');

  const newUser = new User({ username, password });
  await newUser.save();
  return { message: 'Usuario registrado exitosamente' };
};

export const loginUser = async (username: string, password: string) => {
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciales incorrectas');
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );

  return { token, username };
};
