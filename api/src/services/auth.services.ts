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

    // 2. Compañías por defecto: "Distribuidores" (anteriormente "Pruebas") y "SI R&R"
    let distCompany = await Company.findOne({
      $or: [
        { name: 'Distribuidores' },
        { name: 'Pruebas' },
        { name: { $regex: /^distribuidores$/i } },
      ],
    });
    if (!distCompany) {
      distCompany = await Company.create({ name: 'Distribuidores', activo: true });
      console.log('✅ Compañía creada: Distribuidores');
    } else if (distCompany.name !== 'Distribuidores') {
      distCompany.name = 'Distribuidores';
      await distCompany.save();
      console.log('✅ Compañía renombrada: Pruebas -> Distribuidores');
    }

    // Actualizar declaraciones de la compañía con el nombre nuevo "Distribuidores"
    await Declaraciones.updateMany(
      {
        $or: [
          { company: distCompany._id },
          { companyName: 'Pruebas' },
        ],
      },
      {
        $set: {
          company: distCompany._id,
          companyName: 'Distribuidores',
        },
      },
    );

    let sirrCompany = await Company.findOne({ name: 'SI R&R' });
    if (!sirrCompany) {
      sirrCompany = await Company.create({ name: 'SI R&R', activo: true });
      console.log('✅ Compañía creada: SI R&R');
    }

    // 3. Usuario Administrador para "Distribuidores" (usuario: PRUEBAS / clave: PRUEBAS)
    let pruebasUser = await User.findOne({
      $or: [
        { username: { $regex: /^pruebas$/i } },
        { username: 'adm' },
      ],
    });
    if (!pruebasUser) {
      pruebasUser = new User({
        username: 'PRUEBAS',
        password: 'PRUEBAS',
        roles: adminRole ? [adminRole._id] : [],
        company: distCompany._id,
        activo: true,
      });
      await pruebasUser.save();
      console.log('✅ Usuario administrador creado: PRUEBAS (Compañía: Distribuidores)');
    } else {
      let modifiedPruebas = false;
      const passMatchesPruebas = await pruebasUser.comparePassword('PRUEBAS');
      if (!passMatchesPruebas) {
        pruebasUser.password = 'PRUEBAS';
        modifiedPruebas = true;
      }
      if (!pruebasUser.company || String(pruebasUser.company) !== String(distCompany._id)) {
        pruebasUser.company = distCompany._id as any;
        modifiedPruebas = true;
      }
      if (pruebasUser.activo === false) {
        pruebasUser.activo = true;
        modifiedPruebas = true;
      }
      if (modifiedPruebas) {
        await pruebasUser.save();
        console.log('✅ Usuario administrador verificado/actualizado: PRUEBAS (Compañía: Distribuidores)');
      }
    }

    // 4. Usuario Administrador para "SI R&R" (usuario: admin / clave: admin123)
    await User.deleteMany({
      username: { $regex: /^admin$/i },
      company: { $exists: false },
    });

    let adminUser = await User.findOne({
      username: { $regex: /^admin$/i },
      company: sirrCompany._id,
    });
    if (!adminUser) {
      adminUser = await User.findOne({ username: { $regex: /^admin$/i } });
    }

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
    } else {
      let modifiedAdmin = false;
      const passMatchesAdmin = await adminUser.comparePassword('admin123');
      if (!passMatchesAdmin) {
        adminUser.password = 'admin123';
        modifiedAdmin = true;
      }
      if (!adminUser.company || String(adminUser.company) !== String(sirrCompany._id)) {
        adminUser.company = sirrCompany._id as any;
        modifiedAdmin = true;
      }
      if (adminUser.activo === false) {
        adminUser.activo = true;
        modifiedAdmin = true;
      }
      if (modifiedAdmin) {
        await adminUser.save();
        console.log('✅ Usuario administrador verificado/actualizado: admin (Compañía: SI R&R)');
      }
    }

    // 5. Compañía "AMERICA TRADING COMPANY SAS" y usuario "ATCadmin" / "ATC2026qr"
    let atcCompany = await Company.findOne({
      $or: [
        { name: 'AMERICA TRADING COMPANY SAS' },
        { name: { $regex: /^america\s*trading\s*company\s*sas$/i } },
      ],
    });
    if (!atcCompany) {
      atcCompany = await Company.create({ name: 'AMERICA TRADING COMPANY SAS', activo: true });
      console.log('✅ Compañía creada: AMERICA TRADING COMPANY SAS');
    }

    let atcUser = await User.findOne({
      username: { $regex: /^atcadmin$/i },
    });
    if (!atcUser) {
      atcUser = new User({
        username: 'ATCadmin',
        password: 'ATC2026qr',
        roles: adminRole ? [adminRole._id] : [],
        company: atcCompany._id,
        activo: true,
      });
      await atcUser.save();
      console.log('✅ Usuario administrador creado: ATCadmin (Compañía: AMERICA TRADING COMPANY SAS)');
    } else {
      let modifiedAtc = false;
      const passMatchesOld = await atcUser.comparePassword('admin123');
      if (passMatchesOld) {
        atcUser.password = 'ATC2026qr';
        modifiedAtc = true;
        console.log('🔐 Contraseña de ATCadmin actualizada a la versión segura: ATC2026qr');
      }
      if (!atcUser.company || String(atcUser.company) !== String(atcCompany._id)) {
        atcUser.company = atcCompany._id as any;
        modifiedAtc = true;
      }
      if (atcUser.activo === false) {
        atcUser.activo = true;
        modifiedAtc = true;
      }
      if (modifiedAtc) {
        await atcUser.save();
        console.log('✅ Usuario administrador verificado/actualizado: ATCadmin (Compañía: AMERICA TRADING COMPANY SAS)');
      }
    }

    // 6. Asignar declaraciones existentes sin compañía a "SI R&R"
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
    .sort({ company: -1 })
    .populate('roles')
    .populate('company');

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciales incorrectas');
  }

  // Verificar si el usuario está activo
  if (user.activo === false) {
    throw new Error('El usuario se encuentra inactivo. Comuníquese con el administrador.');
  }

  // Verificar si la compañía del usuario está activa
  const companyObj = user.company as any;
  if (companyObj && companyObj.activo === false) {
    throw new Error('La compañía a la que pertenece esta cuenta se encuentra inactiva. Comuníquese con el administrador del sistema.');
  }

  const userRoles = (user.roles as any[]).map((role: any) => role.name);

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

// Nombres de usuario raíz protegidos que crearon la compañía
const ROOT_ADMIN_USERNAMES = ['admin', 'pruebas', 'atcadmin'];

/**
 * Obtener usuarios (filtrados por compañía si aplica)
 * El primer usuario administrador de la compañía se marca como isRootAdmin = true
 * Los usuarios posteriores (a partir del segundo) tienen isRootAdmin = false y pueden ser editados.
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
    .sort({ createdAt: 1 });

  const firstUserPerCompany = new Map<string, string>();

  return users.map((user, idx) => {
    const comp = user.company as any;
    const compKey = comp?._id ? String(comp._id) : 'sin_compania';
    const isNamedRoot = ROOT_ADMIN_USERNAMES.includes(user.username.toLowerCase());

    let isRootAdmin = isNamedRoot;
    if (!firstUserPerCompany.has(compKey)) {
      firstUserPerCompany.set(compKey, String(user._id));
      isRootAdmin = true;
    } else if (firstUserPerCompany.get(compKey) === String(user._id)) {
      isRootAdmin = true;
    }

    return {
      _id: user._id,
      username: user.username,
      roles: (user.roles as any[]).map(r => r?.name || 'user'),
      companyId: comp?._id,
      companyName: comp?.name || 'Sin Compañía',
      activo: user.activo !== false,
      isRootAdmin,
      orderIndex: idx,
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

  // Protección: el usuario que creó la compañía no se puede editar
  if (ROOT_ADMIN_USERNAMES.includes(user.username.toLowerCase())) {
    throw new Error(
      'El usuario administrador principal de la compañía no se puede editar (protegido por el sistema).',
    );
  }

  // Si cambia el username, verificar que no use un nombre protegido del sistema ni esté duplicado
  if (data.username && data.username.trim() !== user.username) {
    const cleanUsername = data.username.trim();
    if (ROOT_ADMIN_USERNAMES.includes(cleanUsername.toLowerCase())) {
      throw new Error(
        `El nombre de usuario '${cleanUsername}' está reservado para cuentas principales del sistema.`,
      );
    }

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

  // Protección: el usuario administrador que creó la compañía no se puede inactivar
  if (ROOT_ADMIN_USERNAMES.includes(user.username.toLowerCase())) {
    throw new Error(
      'El usuario administrador principal de la compañía no puede ser inactivado.',
    );
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

/**
 * Obtener listado consolidado de compañías y administradores del sistema (Sólo Lectura)
 */
export const getSystemAdministrators = async () => {
  await ensureDefaultRoles();

  const companies = await Company.find().sort({ name: 1 });
  const users = await User.find({ activo: true })
    .populate('roles')
    .populate('company');

  return companies.map(company => {
    const companyUsers = users.filter(
      u => u.company && String((u.company as any)._id) === String(company._id),
    );

    const adminUser =
      companyUsers.find(u => ROOT_ADMIN_USERNAMES.includes(u.username.toLowerCase())) ||
      companyUsers.find(u =>
        (u.roles as any[]).some(r => r?.name?.toLowerCase() === 'admin'),
      ) ||
      companyUsers[0];

    return {
      companyId: company._id,
      companyName: company.name,
      companyActivo: company.activo !== false,
      adminUserId: adminUser ? adminUser._id : null,
      adminUsername: adminUser ? adminUser.username : 'Sin Administrador',
      adminRoles: adminUser
        ? (adminUser.roles as any[]).map(r => r?.name || 'admin')
        : ['admin'],
      adminActivo: adminUser ? adminUser.activo !== false : false,
      totalUsers: companyUsers.length,
      createdAt: (company as any).createdAt,
    };
  });
};

/**
 * Crear una nueva compañía junto con su usuario administrador inicial
 */
export const createCompanyWithAdmin = async (data: {
  companyName: string;
  adminUsername: string;
  password: string;
}) => {
  const cleanCompanyName = data.companyName?.trim();
  const cleanAdminUsername = data.adminUsername?.trim();
  const password = data.password?.trim();

  if (!cleanCompanyName || !cleanAdminUsername || !password) {
    throw new Error(
      'Todos los campos son obligatorios: Nombre de compañía, usuario administrador y contraseña.',
    );
  }

  // Verificar si la compañía ya existe
  const existingCompany = await Company.findOne({
    name: { $regex: new RegExp(`^${cleanCompanyName}$`, 'i') },
  });
  if (existingCompany) {
    throw new Error(`La compañía '${cleanCompanyName}' ya existe en el sistema.`);
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({
    username: { $regex: new RegExp(`^${cleanAdminUsername}$`, 'i') },
  });
  if (existingUser) {
    throw new Error(`El nombre de usuario '${cleanAdminUsername}' ya está en uso.`);
  }

  // Obtener rol admin
  let adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'admin' });
  }

  // Crear la compañía
  const newCompany = await Company.create({
    name: cleanCompanyName,
    activo: true,
  });

  // Crear el usuario administrador inicial
  const newAdminUser = new User({
    username: cleanAdminUsername,
    password,
    roles: [adminRole._id],
    company: newCompany._id,
    activo: true,
  });
  await newAdminUser.save();

  // Asegurar que el nuevo administrador quede protegido
  if (!ROOT_ADMIN_USERNAMES.includes(cleanAdminUsername.toLowerCase())) {
    ROOT_ADMIN_USERNAMES.push(cleanAdminUsername.toLowerCase());
  }

  return {
    message: 'Compañía y usuario administrador creados exitosamente',
    company: newCompany,
    user: {
      _id: newAdminUser._id,
      username: newAdminUser.username,
      roles: ['admin'],
      company: newCompany,
    },
  };
};

/**
 * Alternar el estado activo/inactivo de una compañía
 */
export const toggleCompanyStatus = async (
  companyId: string,
  requestingCompanyId?: string,
) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error('Compañía no encontrada');
  }

  const nuevoEstado = !company.activo;

  // Evitar que el administrador inactive su propia compañía activa
  if (!nuevoEstado && requestingCompanyId && String(requestingCompanyId) === String(company._id)) {
    throw new Error('No puedes inactivar la compañía en la que estás actualmente conectado.');
  }

  company.activo = nuevoEstado;
  await company.save();

  return {
    message: `Compañía '${company.name}' ${nuevoEstado ? 'activada' : 'inactivada'} exitosamente`,
    company: {
      _id: company._id,
      name: company.name,
      activo: company.activo,
    },
  };
};

/**
 * Actualizar credenciales (usuario y/o contraseña) del administrador de una compañía
 */
export const updateCompanyAdminCredentials = async (
  companyId: string,
  data: {
    username?: string;
    password?: string;
  },
) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error('Compañía no encontrada');
  }

  // Buscar todos los usuarios pertenecientes a la compañía
  const companyUsers = await User.find({ company: company._id })
    .populate('roles')
    .sort({ createdAt: 1 });

  if (!companyUsers || companyUsers.length === 0) {
    throw new Error('No se encontró ningún usuario registrado en esta compañía.');
  }

  // Localizar al administrador principal
  const adminUser =
    companyUsers.find(u => ROOT_ADMIN_USERNAMES.includes(u.username.toLowerCase())) ||
    companyUsers.find(u =>
      (u.roles as any[]).some(r => r?.name?.toLowerCase() === 'admin'),
    ) ||
    companyUsers[0];

  if (!adminUser) {
    throw new Error('No se encontró el administrador de la compañía.');
  }

  const oldUsername = adminUser.username;

  // Si se actualiza el nombre de usuario
  if (data.username && data.username.trim() !== '' && data.username.trim() !== adminUser.username) {
    const cleanUsername = data.username.trim();

    // Validar que no esté en uso por otra cuenta
    const existing = await User.findOne({
      _id: { $ne: adminUser._id },
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
    });
    if (existing) {
      throw new Error(`El nombre de usuario '${cleanUsername}' ya está en uso.`);
    }

    // Actualizar lista de administradores protegidos si aplicaba
    const oldIdx = ROOT_ADMIN_USERNAMES.indexOf(oldUsername.toLowerCase());
    if (oldIdx !== -1) {
      ROOT_ADMIN_USERNAMES.splice(oldIdx, 1);
    }
    if (!ROOT_ADMIN_USERNAMES.includes(cleanUsername.toLowerCase())) {
      ROOT_ADMIN_USERNAMES.push(cleanUsername.toLowerCase());
    }

    adminUser.username = cleanUsername;
  }

  // Si se envía una nueva contraseña
  if (data.password && data.password.trim() !== '') {
    adminUser.password = data.password.trim();
  }

  await adminUser.save();

  return {
    message: `Credenciales del administrador de '${company.name}' actualizadas exitosamente`,
    adminUsername: adminUser.username,
  };
};
