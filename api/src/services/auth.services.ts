import User, { IUser } from '../models/user.models';
import Role from '../models/roles.models';
import jwt from 'jsonwebtoken';

export const registerUser = async (
  username: string,
  password: string,
  role = 'user',
) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error('El usuario ya existe');

  // Buscar el rol especificado
  const selectedRole = await Role.findOne({ name: role });
  if (!selectedRole) throw new Error(`Rol '${role}' no encontrado`);

  const newUser = new User({ username, password, roles: [selectedRole._id] });
  await newUser.save();
  return { message: 'Usuario registrado exitosamente' };
};

export const loginUser = async (username: string, password: string) => {
  const user = await User.findOne({ username }).populate('roles');
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciales incorrectas');
  }

  const userRoles = user.roles.map((role: any) => role.name); // ahora sí será ['admin'] o ['user']

  const token = jwt.sign(
    { id: user._id, username: user.username, roles: userRoles },
    process.env.JWT_SECRET!,
    {
      expiresIn: '1h',
    },
  );

  return { token, username, roles: userRoles };
};
