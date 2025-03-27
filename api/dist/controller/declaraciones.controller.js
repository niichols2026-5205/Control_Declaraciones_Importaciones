"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclaracionesController = void 0;
const declaraciones_services_1 = require("../services/declaraciones.services");
class DeclaracionesController {
    // Crear declaración
    static crearDeclaracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nuevaDeclaracion = yield declaraciones_services_1.DeclaracionesService.crearDeclaracion(req.body);
                return res.status(201).json(nuevaDeclaracion);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: 'Error al crear declaración', error });
            }
        });
    }
    // Obtener todas las declaraciones
    static obtenerDeclaraciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const declaraciones = yield declaraciones_services_1.DeclaracionesService.obtenerDeclaraciones();
                return res.status(200).json(declaraciones);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: 'Error al obtener declaraciones', error });
            }
        });
    }
    // Obtener declaración por ID
    static obtenerDeclaracionPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const declaracion = yield declaraciones_services_1.DeclaracionesService.obtenerDeclaracionPorId(id);
                if (!declaracion) {
                    return res.status(404).json({ message: 'Declaración no encontrada' });
                }
                return res.status(200).json(declaracion);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: 'Error al obtener declaración', error });
            }
        });
    }
    // Actualizar declaración
    static actualizarDeclaracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const declaracionActualizada = yield declaraciones_services_1.DeclaracionesService.actualizarDeclaracion(id, req.body);
                if (!declaracionActualizada) {
                    return res.status(404).json({ message: 'Declaración no encontrada' });
                }
                return res.status(200).json(declaracionActualizada);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: 'Error al actualizar declaración', error });
            }
        });
    }
    // Eliminar declaración
    static eliminarDeclaracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const declaracionEliminada = yield declaraciones_services_1.DeclaracionesService.eliminarDeclaracion(id);
                if (!declaracionEliminada) {
                    return res.status(404).json({ message: 'Declaración no encontrada' });
                }
                return res
                    .status(200)
                    .json({ message: 'Declaración eliminada con éxito' });
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: 'Error al eliminar declaración', error });
            }
        });
    }
}
exports.DeclaracionesController = DeclaracionesController;
