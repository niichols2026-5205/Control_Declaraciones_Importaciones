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
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';

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
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
              Directorio oficial de empresas registradas y cuentas administradoras iniciales
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Contenido */}
      <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        {/* Banner Informativo de Solo Lectura */}
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
          <strong>🔒 Modo Solo Lectura:</strong> Esta vista es de carácter informativo para supervisar las compañías del ecosistema. Por integridad y seguridad del sistema, en esta tabla no está permitido crear, editar, inactivar ni eliminar compañías ni sus administradores.
        </Alert>

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
                    ESTADO
                  </TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                    AISLAMIENTO
                  </TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                    FECHA ALTA
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={34} sx={{ color: '#0284c7' }} />
                      <Typography variant="body2" color="#64748b" sx={{ mt: 1.5, fontWeight: 600 }}>
                        Cargando directorio de compañías...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#64748b' }}>
                      No se encontraron compañías configuradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, idx) => (
                    <TableRow
                      key={item.companyId || idx}
                      sx={{
                        '&:hover': { backgroundColor: '#f1f5f9' },
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
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
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
                              {item.totalUsers} {item.totalUsers === 1 ? 'usuario registrado' : 'usuarios registrados'}
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
                            item.companyActivo !== false ? (
                              <CheckCircleIcon style={{ fontSize: 14 }} />
                            ) : (
                              <CancelIcon style={{ fontSize: 14 }} />
                            )
                          }
                          label={item.companyActivo !== false ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor:
                              item.companyActivo !== false ? '#dcfce7' : '#fee2e2',
                            color: item.companyActivo !== false ? '#15803d' : '#b91c1c',
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>

      {/* Pie de acciones: Únicamente botón Cerrar */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          justifyContent: 'space-between',
        }}>
        <Typography variant="caption" color="#94a3b8">
          * Para crear o dar de alta nuevas compañías, debe gestionarse a nivel de servidor o por el superadministrador del sistema.
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
  );
};

export default CompaniaAdminsModal;
