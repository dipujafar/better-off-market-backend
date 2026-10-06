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
exports.notifyGetInTouchSubscribers = exports.propertyAddress = exports.toArray = void 0;
const config_1 = __importDefault(require("../../config"));
const mailSender_1 = require("../../utils/mailSender");
const getInTouch_models_1 = __importDefault(require("../getInTouch/getInTouch.models"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const toArray = (value) => {
    if (!value)
        return undefined;
    if (Array.isArray(value))
        return value;
    return value.split(',').map((v) => v.trim()).filter(Boolean);
};
exports.toArray = toArray;
const propertyAddress = (streetAddress, city, state, zipCode, county) => {
    return [streetAddress, city, state, zipCode, county]
        .filter(Boolean)
        .join(", ");
};
exports.propertyAddress = propertyAddress;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return entities[character];
});
const notifyGetInTouchSubscribers = (property, sellerName) => __awaiter(void 0, void 0, void 0, function* () {
    const subscribers = yield getInTouch_models_1.default.find({
        counties: property.county,
        propertyTypes: property.propertyType,
    }).select('email');
    if (!subscribers.length) {
        return;
    }
    const templatePath = path_1.default.join(__dirname, '../../../../public/view/subscription_area.html');
    const template = fs_1.default.readFileSync(templatePath, 'utf8');
    const replacements = {
        userName: 'there',
        propertyAddress: (0, exports.propertyAddress)(property.streetAddress, property.city, property.state, property.zipCode, property.county),
        sellerName,
        buyerName: 'Not applicable',
        propertyUrl: `${config_1.default.client_Url}/properties-list/${property._id}`,
        year: new Date().getFullYear().toString(),
    };
    const html = Object.entries(replacements).reduce((content, [placeholder, value]) => content.replace(`{{${placeholder}}}`, escapeHtml(value)), template);
    const emailResults = yield Promise.allSettled(subscribers.map((subscriber) => (0, mailSender_1.sendEmail)(subscriber.email, 'New Listing in Your Subscription Area', html)));
    emailResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Failed to notify GetInTouch subscriber ${subscribers[index].email}:`, result.reason);
        }
    });
});
exports.notifyGetInTouchSubscribers = notifyGetInTouchSubscribers;
