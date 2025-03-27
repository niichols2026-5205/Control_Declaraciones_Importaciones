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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclaracionesService = void 0;
const declaraciones_models_1 = __importDefault(require("../models/declaraciones.models"));
class DeclaracionesService {
    // Crear una nueva declaración
    static crearDeclaracion(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const nuevaDeclaracion = new declaraciones_models_1.default(data);
            return yield nuevaDeclaracion.save();
        });
    }
    // Obtener todas las declaraciones
    static obtenerDeclaraciones() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield declaraciones_models_1.default.find();
        });
    }
    // Obtener una declaración por ID
    static obtenerDeclaracionPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield declaraciones_models_1.default.findById(id);
        });
    }
    // Actualizar declaración
    static actualizarDeclaracion(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield declaraciones_models_1.default.findByIdAndUpdate(id, data, { new: true });
        });
    }
    // Eliminar declaración
    static eliminarDeclaracion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield declaraciones_models_1.default.findByIdAndDelete(id);
        });
    }
}
exports.DeclaracionesService = DeclaracionesService;
