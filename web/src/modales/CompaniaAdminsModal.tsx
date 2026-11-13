import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';

interface SystemAdminItem {
  companyId: string;
  companyName: string;
  companyActivo: boolean;
  adminUsername: string;
  adminRoles: string[];
  adminActivo: boolean;
  totalUsers: number;
  createdAt?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const CompaniaAdminsModal: React.FC<Props> = ({ open, onClose }) => {
  const [data, setData] = useState<SystemAdminItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Estados para creación de nueva compañía
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newAdminUsername, setNewAdminUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Estados para confirmación y notificaciones
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    confirmColor: 'error' | 'success' | 'primary';
    icon: React.ReactNode;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    confirmColor: 'primary',
    icon: null,
    onConfirm: () => {},
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentCompanyName = localStorage.getItem('companyName') || '';

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success',
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchSystemAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/system-administrators`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!res.ok) {
        throw new Error('Error al obtener la lista de compañías y administradores');
      }

      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSystemAdmins();
      setSearch('');
    }
  }, [open]);

  // Manejar creación de nueva compañía
  const handleCreateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newAdminUsername.trim() || !newPassword.trim()) {
      showNotification('Todos los campos son obligatorios', 'warning');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          companyName: newCompanyName.trim(),
          adminUsername: newAdminUsername.trim(),
          password: newPassword.trim(),
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Error al crear la compañía');
      }

      showNotification(
        `Compañía "${newCompanyName.trim()}" y administrador "${newAdminUsername.trim()}" creados exitosamente`,
        'success',
      );
      setCreateDialogOpen(false);
      setNewCompanyName('');
      setNewAdminUsername('');
      setNewPassword('');
      await fetchSystemAdmins();
    } catch (err: any) {
      showNotification(err.message || 'Error al crear la compañía', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Manejar cambio de estado de la compañía
  const handleToggleCompanyStatus = (item: SystemAdminItem) => {
    const nuevoEstado = !item.companyActivo;
    const isCurrent = currentCompanyName.toLowerCase() === item.companyName.toLowerCase();

    if (!nuevoEstado && isCurrent) {
      showNotification(
        'No puedes inactivar la compañía en la que estás actualmente conectado',
        'warning',
      );
      return;
    }

    setConfirmDialog({
      open: true,
      title: nuevoEstado
        ? `¿Activar la compañía "${item.companyName}"?`
        : `¿Inactivar la compañía "${item.companyName}"?`,
      description: nuevoEstado
        ? `La compañía volverá a estar operativa y sus usuarios podrán iniciar sesión normalmente.`
        : `Al inactivar esta compañía, todos sus usuarios y administradores perderán el acceso al sistema hasta que sea reactivada.`,
      confirmText: nuevoEstado ? 'Activar Compañía' : 'Inactivar Compañía',
      confirmColor: nuevoEstado ? 'success' : 'error',
      icon: nuevoEstado ? (
        <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#16a34a' }} />
      ) : (
        <BlockIcon sx={{ fontSize: 28, color: '#dc2626' }} />
      ),
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/companies/${item.companyId}/status`,
            {
              method: 'PATCH',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            },
          );

          const resJson = await res.json();
          if (!res.ok) {
            throw new Error(resJson.error || 'Error al cambiar estado de la compañía');
          }

          setData(prev =>
            prev.map(c =>
              c.companyId === item.companyId
                ? { ...c, companyActivo: nuevoEstado }
                : c,
            ),
          );

          showNotification(
            nuevoEstado
              ? `Compañía "${item.companyName}" activada exitosamente`
              : `Compañía "${item.companyName}" inactivada exitosamente`,
            'success',
          );
        } catch (err: any) {
          showNotification(err.message || 'Error al cambiar estado', 'error');
        }
      },
    });
  };

  const filteredData = data.filter(item => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      item.companyName.toLowerCase().includes(term) ||
      item.adminUsername.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}>
        {/* Encabezado del Modal */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            px: 3,
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
              }}>
              <ApartmentIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Compañías y Usuarios Administradores del Sistema
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Directorio y administración de empresas registradas y cuentas administradoras principales
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Contenido */}
        <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
          {/* Banner Informativo */}
          <Alert
            severity="info"
            icon={<SecurityIcon fontSize="inherit" />}
            sx={{
              mb: 2.5,
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
              fontWeight: 500,
            }}>
            <strong>🏢 Gestión Central Multi-Tenant:</strong> Puedes registrar nuevas compañías con su administrador inicial y gestionar el estado (Activo/Inactivo) de las empresas existentes. Cada compañía opera en su propio entorno privado de datos.
          </Alert>

          {/* Barra de Acciones y Búsqueda */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mb: 2.5,
            }}>
            <TextField
              size="small"
              placeholder="Buscar por compañía o usuario administrador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: { sm: 380 },
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddBusinessIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)',
                },
              }}>
              Nueva Compañía
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#0f172a' }}>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      EMPRESA / COMPAÑÍA
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      USUARIO ADMINISTRADOR
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      ROL
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      ESTADO COMPAÑÍA
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      AISLAMIENTO
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      FECHA ALTA
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                      ACCIONES
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={34} sx={{ color: '#0284c7' }} />
                        <Typography variant="body2" color="#64748b" sx={{ mt: 1.5, fontWeight: 600 }}>
                          Cargando directorio de compañías...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#64748b' }}>
                        No se encontraron compañías coincidentes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, idx) => {
                      const isCurrentCompany =
                        currentCompanyName.toLowerCase() === item.companyName.toLowerCase();

                      return (
                        <TableRow
                          key={item.companyId || idx}
                          sx={{
                            backgroundColor: item.companyActivo ? '#ffffff' : '#fef2f2',
                            '&:hover': { backgroundColor: item.companyActivo ? '#f1f5f9' : '#fee2e2' },
                            transition: 'background-color 0.15s ease',
                          }}>
                          {/* Empresa */}
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '8px',
                                  backgroundColor: item.companyActivo ? '#e0f2fe' : '#fee2e2',
                                  color: item.companyActivo ? '#0369a1' : '#b91c1c',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                }}>
                                🏢
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                  {item.companyName}
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                  {item.totalUsers}{' '}
                                  {item.totalUsers === 1
                                    ? 'usuario registrado'
                                    : 'usuarios registrados'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Usuario Administrador */}
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  backgroundColor: '#818cf8',
                                  color: '#ffffff',
                                }}>
                                {item.adminUsername.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600} color="#1e293b">
                                  {item.adminUsername}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                                  👑 Admin Principal
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Rol */}
                          <TableCell>
                            <Chip
                              icon={<AdminPanelSettingsIcon style={{ fontSize: 15 }} />}
                              label="Administrador"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                height: 24,
                                backgroundColor: '#f3e8ff',
                                color: '#7e22ce',
                                border: '1px solid #d8b4fe',
                              }}
                            />
                          </TableCell>

                          {/* Estado */}
                          <TableCell>
                            <Chip
                              icon={
                                item.companyActivo ? (
                                  <CheckCircleIcon style={{ fontSize: 14 }} />
                                ) : (
                                  <CancelIcon style={{ fontSize: 14 }} />
                                )
                              }
                              label={item.companyActivo ? 'Activa' : 'Inactiva'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 22,
                                backgroundColor: item.companyActivo ? '#dcfce7' : '#fee2e2',
                                color: item.companyActivo ? '#15803d' : '#b91c1c',
                              }}
                            />
                          </TableCell>

                          {/* Aislamiento Multi-Tenant */}
                          <TableCell>
                            <Chip
                              label="Aislamiento Estricto"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 22,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                              }}
                            />
                          </TableCell>

                          {/* Fecha de Creación */}
                          <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                })
                              : '-'}
                          </TableCell>

                          {/* Acciones: Editar Estado (Activar / Inactivar) */}
                          <TableCell align="center">
                            <Tooltip
                              title={
                                !item.companyActivo
                                  ? 'Activar compañía (habilitar acceso a sus usuarios)'
                                  : isCurrentCompany
                                  ? 'No puedes inactivar la compañía en la que estás conectado'
                                  : 'Inactivar compañía (bloquear acceso a sus usuarios)'
                              }>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={item.companyActivo && isCurrentCompany}
                                  onClick={() => handleToggleCompanyStatus(item)}
                                  sx={{
                                    color: item.companyActivo ? '#dc2626' : '#16a34a',
                                    backgroundColor: item.companyActivo ? '#fef2f2' : '#f0fdf4',
                                    '&:hover': {
                                      backgroundColor: item.companyActivo ? '#fee2e2' : '#dcfce7',
                                    },
                                    borderRadius: '8px',
                                  }}>
                                  {item.companyActivo ? (
                                    <BlockIcon fontSize="small" />
                                  ) : (
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
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

        {/* Pie de acciones */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            justifyContent: 'space-between',
          }}>
          <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.78rem' }}>
            ℹ️ Las compañías inactivadas impiden el inicio de sesión a todos sus usuarios hasta que sean reactivadas.
          </Typography>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '10px',
              px: 3,
              '&:hover': { backgroundColor: '#1e293b' },
            }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUB-MODAL: CREAR NUEVA COMPAÑÍA Y ADMINISTRADOR */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !creating && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            overflow: 'hidden',
          },
        }}>
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
          <AddBusinessIcon sx={{ color: '#38bdf8' }} />
          <Typography variant="h6" fontWeight={700}>
            Crear Nueva Compañía
          </Typography>
        </DialogTitle>

        <form onSubmit={handleCreateCompanySubmit}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" color="#475569">
              Ingresa los datos para dar de alta una nueva empresa en el sistema. Se creará automáticamente con su usuario administrador principal.
            </Typography>

            <TextField
              label="Nombre de la Compañía / Razón Social"
              placeholder="ej. DISTRIBUIDORA DEL VALLE SAS"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              fullWidth
              required
              disabled={creating}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Usuario Administrador Inicial"
              placeholder="ej. adminValle"
              value={newAdminUsername}
              onChange={e => setNewAdminUsername(e.target.value)}
              fullWidth
              required
              disabled={creating}
              helperText="Identificador con el que este administrador iniciará sesión."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AdminPanelSettingsIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
              required
              disabled={creating}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              startIcon={creating ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                px: 3,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              }}>
              {creating ? 'Creando Compañía...' : 'Crear Compañía'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIÁLOGO MODERNO DE CONFIRMACIÓN DE ESTADO */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '16px 20px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.2)',
          },
        }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor:
                confirmDialog.confirmColor === 'error' ? '#fee2e2' : '#dcfce7',
            }}>
            {confirmDialog.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>
            {confirmDialog.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 1, py: 1.5 }}>
          <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {confirmDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 1, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={confirmDialog.confirmColor || 'primary'}
            onClick={async () => {
              const run = confirmDialog.onConfirm;
              setConfirmDialog(prev => ({ ...prev, open: false }));
              await run();
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
            }}>
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR DE NOTIFICACIONES */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CompaniaAdminsModal;
