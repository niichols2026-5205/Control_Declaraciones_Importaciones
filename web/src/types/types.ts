export interface Declaracion {
  _id: string;
  importadoNacional: string;
  numeroDeclaracion: string;
  datosDeclaracion: string;
  pdfDeclaracion?: string;
  archivoDeclaracion?: string;
  factura: string;
  nitProveedor: string;
  proveedor: string;
  pais?: string;
  numeroFactura?: string;
  pdfFactura?: string;
  archivoFactura?: string;
  observaciones: string;
  company?: string;
  companyName?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
  acciones?: string;
}

export interface Company {
  _id: string;
  name: string;
  activo: boolean;
}
