import User from '../models/user.models';
import Role from '../models/roles.models';
import Company from '../models/company.models';
import Declaraciones from '../models/declaraciones.models';
import jwt from 'jsonwebtoken';

/**
 * Garantiza que existan los roles, las compañías y los administradores iniciales
 */
export const ensureDefaultRoles = async () => {
  try {
    // 1. Roles por defecto
    const roles = ['admin', 'user'];
    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName });
      }
    }

    const adminRole = await Role.findOne({ name: 'admin' });

    // 2. Compañías por defecto: "Pruebas" y "SI R&R"
    let pruebasCompany = await Company.findOne({ name: 'Pruebas' });
    if (!pruebasCompany) {
      pruebasCompany = await Company.create({ name: 'Pruebas', activo: true });
      console.log('✅ Compañía creada: Pruebas');
    }

    let sirrCompany = await Company.findOne({ name: 'SI R&R' });
    if (!sirrCompany) {
      sirrCompany = await Company.create({ name: 'SI R&R', activo: true });
      console.log('✅ Compañía creada: SI R&R');
    }

    // 3. Usuario Administrador para "Pruebas" (usuario: adm / clave: admin123)
    let admUser = await User.findOne({ username: 'adm' });
    if (!admUser) {
      admUser = new User({
        username: 'adm',
        password: 'admin123',
        roles: adminRole ? [adminRole._id] : [],
        company: pruebasCompany._id,
        activo: true,
      });
      await admUser.save();
      console.log('✅ Usuario administrador creado: adm (Compañía: Pruebas)');
    } else if (!admUser.company) {
      admUser.company = pruebasCompany._id as any;
      await admUser.save();
    }

    // 4. Usuario Administrador para "SI R&R" (usuario: admin / clave: admin123)
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        password: 'admin123',
        roles: adminRole ? [adminRole._id] : [],
        company: sirrCompany._id,
        activo: true,
      });
      await adminUser.save();
      console.log('✅ Usuario administrador creado: admin (Compañía: SI R&R)');
    } else if (!adminUser.company) {
      adminUser.company = sirrCompany._id as any;
      await adminUser.save();
    }

    // 5. Asignar declaraciones existentes sin compañía a "SI R&R"
    await Declaraciones.updateMany(
      { company: { $exists: false } },
      {
        $set: {
          company: sirrCompany._id,
          companyName: sirrCompany.name,
        },
      },
    );
  } catch (error) {
    console.error('Error al verificar/inicializar roles y compañías:', error);
  }
};

/**
 * Obtener listado de compañías activas
 */
export const getCompanies = async () => {
  await ensureDefaultRoles();
  return await Company.find({ activo: true }).sort({ name: 1 });
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
  companyId?: string,
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
    company: companyId || undefined,
    activo: true,
  });

  await newUser.save();
  await newUser.populate('company');

  return {
    message: 'Usuario registrado exitosamente',
    user: {
      _id: newUser._id,
      username: newUser.username,
      roles: [selectedRole.name],
      company: newUser.company,
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
  })
    .populate('roles')
    .populate('company');

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciales incorrectas');
  }

  // Verificar si el usuario está activo
  if (user.activo === false) {
    throw new Error('El usuario se encuentra inactivo. Comuníquese con el administrador.');
  }

  const userRoles = (user.roles as any[]).map((role: any) => role.name);
  const companyObj = user.company as any;

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      roles: userRoles,
      companyId: companyObj?._id ? String(companyObj._id) : null,
      companyName: companyObj?.name || null,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '8h',
    },
  );

  return {
    token,
    username: user.username,
    roles: userRoles,
    company: companyObj
      ? {
          _id: companyObj._id,
          name: companyObj.name,
        }
      : null,
  };
};

/**
 * Obtener usuarios (filtrados por compañía si aplica)
 */
export const getAllUsers = async (filterCompanyId?: string) => {
  await ensureDefaultRoles();
  const query: any = {};
  if (filterCompanyId) {
    query.company = filterCompanyId;
  }

  const users = await User.find(query, '-password')
    .populate('roles')
    .populate('company')
    .sort({ createdAt: -1 });

  return users.map(user => {
    const comp = user.company as any;
    return {
      _id: user._id,
      username: user.username,
      roles: (user.roles as any[]).map(r => r?.name || 'user'),
      companyId: comp?._id,
      companyName: comp?.name || 'Sin Compañía',
      activo: user.activo !== false,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  });
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
    companyId?: string;
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

  // Si cambia la compañía
  if (data.companyId) {
    user.company = data.companyId as any;
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

  const updatedUser = await User.findById(id)
    .populate('roles')
    .populate('company');

  const comp = updatedUser?.company as any;
  return {
    message: 'Usuario actualizado exitosamente',
    user: {
      _id: updatedUser?._id,
      username: updatedUser?.username,
      roles: (updatedUser?.roles as any[])?.map(r => r?.name || 'user') || [],
      companyId: comp?._id,
      companyName: comp?.name || 'Sin Compañía',
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
