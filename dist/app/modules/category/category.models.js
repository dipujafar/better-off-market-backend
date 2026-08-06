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
const mongoose_1 = require("mongoose");
const websiteLinkSchema = new mongoose_1.Schema({
    title: {
        type: String,
    },
    subTitle: {
        type: String,
    },
    link: {
        type: String,
    },
});
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    icon: {
        type: String,
        required: [true, 'Icon is required'],
    },
    description: {
        type: String,
    },
    websiteLinks: {
        type: [websiteLinkSchema],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
categorySchema.statics.isExistByName = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Category.findOne({ name });
    });
};
categorySchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
categorySchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
categorySchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
    next();
});
const Category = (0, mongoose_1.model)('Categories', categorySchema);
exports.default = Category;
