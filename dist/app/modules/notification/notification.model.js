"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Receiver id is required'],
    },
    // refference: {
    //   type: Schema.Types.ObjectId,
    //   //   dynamic refference
    //   refPath: 'model_type',
    //   required: [true, 'Receiver id is required'],
    // },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
    description: {
        type: String,
        default: '',
    },
    read: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
NotificationSchema.pre('find', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
NotificationSchema.pre('findOne', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
NotificationSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
