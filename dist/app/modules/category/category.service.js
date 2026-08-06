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
exports.categoryService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const category_models_1 = __importDefault(require("./category.models"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_models_1.default.isExistByName(payload === null || payload === void 0 ? void 0 : payload.name);
    if (category && !(category === null || category === void 0 ? void 0 : category.isDeleted)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category already exist');
    }
    const result = yield category_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create category');
    }
    return result;
});
const getAllCategories = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categoriesModel = new QueryBuilder_1.default(category_models_1.default.find(), query)
        .search(['name', 'description'])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield categoriesModel.modelQuery;
    const meta = yield categoriesModel.countTotal();
    return {
        data: data,
        meta,
    };
});
const getCategoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_models_1.default.findById(id);
    if (!result) {
        throw new Error('Category not found');
    }
    return result;
});
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update category');
    }
    return result;
});
// const updateCategory = async (id: string, payload: Partial<ICategory>) => {
//   const { websiteLinks, ...remainingData } = payload;
//   const modifiedUpdatedData: Record<string, unknown> = {};
//   // 🔥 Primitive fields (including image & icon)
//   Object.assign(modifiedUpdatedData, remainingData);
//   // 🔥 If updating ONE websiteLinks item
//   if (websiteLinks && websiteLinks._id) {
//     const { _id, ...linkData } = websiteLinks;
//     for (const [key, value] of Object.entries(linkData)) {
//       modifiedUpdatedData[`websiteLinks.$.${key}`] = value;
//     }
//     const result = await Category.findOneAndUpdate(
//       { _id: id, 'websiteLinks._id': websiteLinks._id },
//       { $set: modifiedUpdatedData },
//       { new: true, runValidators: true },
//     );
//     return result;
//   }
//   // 🔥 If no websiteLinks update
//   const result = await Category.findByIdAndUpdate(
//     id,
//     { $set: modifiedUpdatedData },
//     { new: true, runValidators: true },
//   );
//   return result;
// };
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default === null || http_status_1.default === void 0 ? void 0 : http_status_1.default.BAD_REQUEST, 'Failed to delete category');
    }
    return result;
});
exports.categoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
