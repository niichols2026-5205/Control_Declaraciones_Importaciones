import User from '../models/user.models';
import Role from '../models/roles.models';
import jwt from 'jsonwebtoken';

/**
 * Garantiza que existan los roles por defecto en la base de datos
 */
export const ensureDefaultRoles = async () => {
  try {
    const roles = ['admin', 'user'];
    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName });
      }
    }
  } catch (error) {
    console.error('Error al verificar/inicializar roles:', error);
  }
};

/**
 * Obtener listado de roles
 */
export const getRoles = async () => {
  await ensureDefaultRoles();
  return await Role.find().sort({ name: 1 });
};

/**
 * Registrar un nuevo usuario
 */
export const registerUser = async (
  username: string,
  password: string,
  role = 'user',
) => {
  const cleanUsername = username?.trim();
  if (!cleanUsername || !password) {
    throw new Error('El usuario y la contraseña son obligatorios');
  }

  const existingUser = await User.findOne({
    username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
  });
  if (existingUser) throw new Error('El nombre de usuario ya está registrado');

  // Buscar o crear el rol especificado
  let selectedRole = await Role.findOne({ name: role.toLowerCase() });
  if (!selectedRole) {
    selectedRole = await Role.create({ name: role.toLowerCase() });
  }

  const newUser = new User({
    username: cleanUsername,
    password,
    roles: [selectedRole._id],
    activo: true,
  });

  await newUser.save();
  return {
    message: 'Usuario registrado exitosamente',
    user: {
      _id: newUser._id,
      username: newUser.username,
      roles: [selectedRole.name],
      activo: newUser.activo,
    },
  };
};

/**
 * Iniciar sesión
 */
export const loginUser = async (username: string, password: string) => {
  const cleanUsername = username?.trim();
  const user = await User.findOne({
    username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
  }).populate('roles');

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciales incorrectas');
  }

  // Verificar si el usuario está activo
  if (user.activo === false) {
    throw new Error('El usuario se encuentra inactivo. Comuníquese con el administrador.');
  }

  const userRoles = user.roles.map((role: any) => role.name);

  const token = jwt.sign(
    { id: user._id, username: user.username, roles: userRoles },
    process.env.JWT_SECRET!,
    {
      expiresIn: '8h',
    },
  );

  return { token, username: user.username, roles: userRoles };
};

/**
 * Obtener todos los usuarios del sistema (solo para Administradores)
 */
export const getAllUsers = async () => {
  await ensureDefaultRoles();
  const users = await User.find({}, '-password')
    .populate('roles')
    .sort({ createdAt: -1 });

  return users.map(user => ({
    _id: user._id,
    username: user.username,
    roles: (user.roles as any[]).map(r => r?.name || 'user'),
    activo: user.activo !== false,
    createdAt: (user as any).createdAt,
    updatedAt: (user as any).updatedAt,
  }));
};

/**
 * Actualizar datos de un usuario existente
 */
export const updateUser = async (
  id: string,
  data: {
    username?: string;
    role?: string;
    password?: string;
    activo?: boolean;
  },
  requestingUsername?: string,
) => {
  const user = await User.findById(id).populate('roles');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si cambia el username, verificar que no esté duplicado
  if (data.username && data.username.trim() !== user.username) {
    const cleanUsername = data.username.trim();
    const existing = await User.findOne({
      _id: { $ne: id },
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
    });
    if (existing) {
      throw new Error(`El nombre de usuario '${cleanUsername}' ya está en uso`);
    }
    user.username = cleanUsername;
  }

  // Si cambia el rol
  if (data.role) {
    let targetRole = await Role.findOne({ name: data.role.toLowerCase() });
    if (!targetRole) {
      targetRole = await Role.create({ name: data.role.toLowerCase() });
    }
    user.roles = [targetRole._id as any];
  }

  // Si se envía una nueva contraseña
  if (data.password && data.password.trim() !== '') {
    user.password = data.password.trim();
  }

  // Si se actualiza el estado activo
  if (typeof data.activo === 'boolean') {
    if (
      !data.activo &&
      requestingUsername &&
      user.username.toLowerCase() === requestingUsername.toLowerCase()
    ) {
      throw new Error('No puedes inactivar tu propia cuenta de administrador.');
    }
    user.activo = data.activo;
  }

  await user.save();

  const updatedUser = await User.findById(id).populate('roles');
  return {
    message: 'Usuario actualizado exitosamente',
    user: {
      _id: updatedUser?._id,
      username: updatedUser?.username,
      roles: (updatedUser?.roles as any[])?.map(r => r?.name || 'user') || [],
      activo: updatedUser?.activo !== false,
    },
  };
};

/**
 * Activar o inactivar un usuario
 */
export const toggleUserStatus = async (id: string, requestingUsername?: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const nuevoEstado = !user.activo;

  // Evitar auto-inactivación del admin en sesión
  if (
    !nuevoEstado &&
    requestingUsername &&
    user.username.toLowerCase() === requestingUsername.toLowerCase()
  ) {
    throw new Error('No puedes inactivar tu propia cuenta de administrador.');
  }

  user.activo = nuevoEstado;
  await user.save();

  return {
    message: `Usuario ${user.username} ${nuevoEstado ? 'activado' : 'inactivado'} exitosamente`,
    activo: user.activo,
  };
};
