"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DeclaracionesSchema = new mongoose_1.Schema({
    fechaHora: { type: String, required: true },
    numeroDeclaracion: { type: String, required: true },
    datosDeclaracion: { type: String, required: true },
    pdfDeclaracion: { type: String, required: true },
    archivoDeclaracion: { type: String, required: true },
    factura: { type: String, required: true },
    proveedor: { type: String, required: true },
    numeroFactura: { type: String, required: true },
    pdfFactura: { type: String, required: true },
    idDeclaracion: { type: String, required: true, unique: true },
});
exports.default = (0, mongoose_1.model)('Declaraciones', DeclaracionesSchema);
