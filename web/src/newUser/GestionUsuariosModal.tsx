import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';

export interface UserItem {
  _id: string;
  username: string;
  roles: string[];
  companyId?: string;
  companyName?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const GestionUsuariosModal: React.FC<Props> = ({ open, onClose }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [alertInfo, setAlertInfo] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Sub-modal Crear Usuario
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('user');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Sub-modal Editar Usuario
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('user');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editActivo, setEditActivo] = useState<boolean>(true);
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const currentLoggedInUser = localStorage.getItem('username') || '';
  const currentCompany = localStorage.getItem('companyName') || '';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al obtener usuarios');
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message || 'Error cargando usuarios' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      setAlertInfo(null);
      setSearchTerm('');
    }
  }, [open]);

  // Manejar creación de usuario
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setAlertInfo({ type: 'error', message: 'Nombre de usuario y contraseña son obligatorios' });
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el usuario');
      }

      setAlertInfo({ type: 'success', message: `Usuario '${newUsername}' creado exitosamente` });
      setCreateDialogOpen(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditRole(user.roles && user.roles.includes('admin') ? 'admin' : 'user');
    setEditPassword('');
    setEditActivo(user.activo);
    setShowEditPassword(false);
    setEditDialogOpen(true);
  };

  // Guardar edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUsername.trim()) {
      setAlertInfo({ type: 'error', message: 'El nombre de usuario no puede estar vacío' });
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const payload: any = {
        username: editUsername.trim(),
        role: editRole,
        activo: editActivo,
      };

      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users/${editingUser._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      setAlertInfo({
        type: 'success',
        message: `Usuario '${editUsername}' actualizado correctamente`,
      });
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message });
    } finally {
      setUpdating(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleStatus = async (user: UserItem) => {
    if (user.username.toLowerCase() === currentLoggedInUser.toLowerCase() && user.activo) {
      setAlertInfo({
        type: 'error',
        message: 'No puedes inactivar tu propia cuenta mientras estás en sesión.',
      });
      return;
    }

    const accion = user.activo ? 'inactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que deseas ${accion} al usuario '${user.username}'?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users/${user._id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error al ${accion} el usuario`);
      }

      setAlertInfo({
        type: 'success',
        message: data.message || `Estado del usuario '${user.username}' actualizado`,
      });
      fetchUsers();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message });
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchName = u.username.toLowerCase().includes(term);
    const matchRole = u.roles.some(r => r.toLowerCase().includes(term));
    const matchStatus = (u.activo ? 'activo' : 'inactivo').includes(term);
    return matchName || matchRole || matchStatus;
  });

  const totalActivos = users.filter(u => u.activo).length;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
          },
        }}>
        {/* Cabecera del Modal */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <PeopleAltIcon />
            </Box>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="700" fontSize="1.15rem">
                  Gestión de Usuarios y Roles
                </Typography>
                {currentCompany && (
                  <Chip
                    label={`Compañía: ${currentCompany}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      height: '22px',
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                Administración de cuentas para {currentCompany || 'el sistema'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#94a3b8',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' },
            }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
          {/* Mensajes de notificación */}
          {alertInfo && (
            <Alert
              severity={alertInfo.type}
              onClose={() => setAlertInfo(null)}
              sx={{ mb: 2.5, borderRadius: '10px' }}>
              {alertInfo.message}
            </Alert>
          )}

          {/* Barra de herramientas: Búsqueda y Crear Usuario */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            mb={2.5}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" flex={1}>
              <TextField
                size="small"
                placeholder="Buscar por usuario o rol..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: '300px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                  },
                }}
              />
              <Chip
                label={`${users.length} Registrados`}
                size="small"
                sx={{ backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 600 }}
              />
              <Chip
                label={`${totalActivos} Activos`}
                size="small"
                sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={() => {
                setNewUsername('');
                setNewPassword('');
                setNewRole('user');
                setShowPassword(false);
                setCreateDialogOpen(true);
              }}
              startIcon={<PersonAddAlt1Icon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
                px: 2.5,
                py: 0.9,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                },
              }}>
              Nuevo Usuario
            </Button>
          </Box>

          {/* Tabla de Usuarios */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}>
            <TableContainer sx={{ maxHeight: 380 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        py: 1.5,
                      }}>
                      Usuario
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                      }}>
                      Rol
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                      }}>
                      Estado
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                      }}>
                      Fecha Creación
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                      }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={30} />
                        <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                          Cargando usuarios...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="#64748b">
                          No se encontraron usuarios coincidentes.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => {
                      const isAdmin = user.roles.includes('admin');
                      const isMe =
                        user.username.toLowerCase() === currentLoggedInUser.toLowerCase();

                      return (
                        <TableRow
                          key={user._id}
                          hover
                          sx={{
                            opacity: user.activo ? 1 : 0.65,
                            backgroundColor: user.activo ? 'inherit' : '#fcfcfc',
                            transition: 'all 0.15s ease',
                          }}>
                          {/* Columna Usuario */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  backgroundColor: isAdmin ? '#818cf8' : '#38bdf8',
                                  color: '#ffffff',
                                }}>
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  color="#0f172a"
                                  sx={{ lineHeight: 1.2 }}>
                                  {user.username}
                                </Typography>
                                {isMe && (
                                  <Typography
                                    variant="caption"
                                    color="#0284c7"
                                    fontWeight="600"
                                    fontSize="0.7rem">
                                    (Tú)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Columna Rol */}
                          <TableCell>
                            <Chip
                              icon={
                                isAdmin ? (
                                  <AdminPanelSettingsIcon style={{ fontSize: 16 }} />
                                ) : (
                                  <PersonIcon style={{ fontSize: 16 }} />
                                )
                              }
                              label={isAdmin ? 'Administrador' : 'Asesor / Operador'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                height: 24,
                                backgroundColor: isAdmin ? '#f3e8ff' : '#e0f2fe',
                                color: isAdmin ? '#7e22ce' : '#0369a1',
                                border: isAdmin
                                  ? '1px solid #d8b4fe'
                                  : '1px solid #bae6fd',
                              }}
                            />
                          </TableCell>

                          {/* Columna Estado */}
                          <TableCell>
                            <Chip
                              icon={
                                user.activo ? (
                                  <CheckCircleIcon style={{ fontSize: 14 }} />
                                ) : (
                                  <CancelIcon style={{ fontSize: 14 }} />
                                )
                              }
                              label={user.activo ? 'Activo' : 'Inactivo'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 22,
                                backgroundColor: user.activo ? '#dcfce7' : '#fee2e2',
                                color: user.activo ? '#15803d' : '#b91c1c',
                              }}
                            />
                          </TableCell>

                          {/* Columna Fecha */}
                          <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                })
                              : '-'}
                          </TableCell>

                          {/* Columna Acciones */}
                          <TableCell align="center">
                            <Box display="flex" justifyContent="center" gap={0.5}>
                              {/* Botón Editar */}
                              <Tooltip title="Editar usuario (rol, datos o contraseña)">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(user)}
                                  sx={{
                                    color: '#ca8a04',
                                    backgroundColor: '#fefce8',
                                    '&:hover': { backgroundColor: '#fef9c3' },
                                  }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Botón Activar / Inactivar */}
                              <Tooltip
                                title={
                                  isMe
                                    ? 'No puedes inactivar tu propia cuenta'
                                    : user.activo
                                    ? 'Inactivar usuario'
                                    : 'Activar usuario'
                                }>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={isMe && user.activo}
                                    onClick={() => handleToggleStatus(user)}
                                    sx={{
                                      color: user.activo ? '#dc2626' : '#16a34a',
                                      backgroundColor: user.activo ? '#fef2f2' : '#f0fdf4',
                                      '&:hover': {
                                        backgroundColor: user.activo ? '#fee2e2' : '#dcfce7',
                                      },
                                    }}>
                                    {user.activo ? (
                                      <BlockIcon fontSize="small" />
                                    ) : (
                                      <HowToRegIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            justifyContent: 'space-between',
          }}>
          <Typography variant="caption" color="#94a3b8">
            * Los usuarios inactivos no pueden ingresar al sistema.
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#475569',
              borderRadius: '8px',
              px: 2.5,
            }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUB-MODAL: CREAR NUEVO USUARIO */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !creating && setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonAddAlt1Icon />
              <Typography variant="subtitle1" fontWeight="700">
                Crear Nuevo Usuario
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setCreateDialogOpen(false)}
              sx={{ color: '#ffffff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            <Typography variant="caption" color="#64748b" sx={{ mt: 1 }}>
              Ingresa los datos para la nueva cuenta de usuario y asigna sus permisos.
            </Typography>

            <TextField
              label="Nombre de Usuario"
              size="small"
              fullWidth
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="ej: asesor_ventas"
              autoFocus
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              size="small"
              fullWidth
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Contraseña segura"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="role-select-label">Rol del Usuario</InputLabel>
              <Select
                labelId="role-select-label"
                value={newRole}
                label="Rol del Usuario"
                onChange={e => setNewRole(e.target.value)}>
                <MenuItem value="user">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" sx={{ color: '#0284c7' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Asesor / Operador
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Acceso a declaraciones, filtros y consultas
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box display="flex" alignItems="center" gap={1}>
                    <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#7e22ce' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Administrador
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Control total del sistema y gestión de usuarios
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
              sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2.5,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              }}>
              {creating ? 'Guardando...' : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* SUB-MODAL: EDITAR USUARIO */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !updating && setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}>
            <Box display="flex" alignItems="center" gap={1}>
              <EditIcon />
              <Typography variant="subtitle1" fontWeight="700">
                Editar Usuario
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: '#ffffff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            <Typography variant="caption" color="#64748b" sx={{ mt: 1 }}>
              Modifica el rol, usuario, contraseña o estado del usuario.
            </Typography>

            <TextField
              label="Nombre de Usuario"
              size="small"
              fullWidth
              required
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="edit-role-select-label">Rol del Usuario</InputLabel>
              <Select
                labelId="edit-role-select-label"
                value={editRole}
                label="Rol del Usuario"
                onChange={e => setEditRole(e.target.value)}>
                <MenuItem value="user">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" sx={{ color: '#0284c7' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Asesor / Operador
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Acceso a declaraciones, filtros y consultas
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box display="flex" alignItems="center" gap={1}>
                    <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#7e22ce' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Administrador
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Control total del sistema y gestión de usuarios
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Nueva Contraseña (Opcional)"
              type={showEditPassword ? 'text' : 'password'}
              size="small"
              fullWidth
              value={editPassword}
              onChange={e => setEditPassword(e.target.value)}
              placeholder="Dejar vacío para mantener la actual"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      edge="end">
                      {showEditPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Toggle de Estado Activo / Inactivo */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: editActivo ? '#f0fdf4' : '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="700"
                  color={editActivo ? '#15803d' : '#b91c1c'}>
                  {editActivo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                </Typography>
                <Typography variant="caption" color="#64748b" display="block">
                  {editActivo
                    ? 'El usuario puede iniciar sesión normalmente'
                    : 'Acceso bloqueado al sistema'}
                </Typography>
              </Box>
              <Switch
                checked={editActivo}
                color={editActivo ? 'success' : 'error'}
                onChange={e => setEditActivo(e.target.checked)}
                disabled={
                  editingUser?.username.toLowerCase() === currentLoggedInUser.toLowerCase() &&
                  editActivo
                }
              />
            </Paper>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              disabled={updating}
              sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2.5,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              }}>
              {updating ? 'Actualizando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default GestionUsuariosModal;
