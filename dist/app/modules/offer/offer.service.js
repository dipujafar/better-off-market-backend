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
exports.offerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const offer_constants_1 = require("./offer.constants");
const offer_models_1 = require("./offer.models");
const properties_models_1 = require("../properties/properties.models");
const properties_constants_1 = require("../properties/properties.constants");
const offer_utils_1 = require("./offer.utils");
const agreement_model_1 = require("../agreement/agreement.model");
const mongoose_1 = __importDefault(require("mongoose"));
const notification_utils_1 = require("../notification/notification.utils");
// Buyer submits the first offer on a property
const createOffer = (buyerId, propertyId, terms, supportingDocuments) => __awaiter(void 0, void 0, void 0, function* () {
    const property = yield properties_models_1.Property.findById(propertyId);
    if (!property) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Property not found');
    }
    if (property.status === properties_constants_1.STATUS.rejected || property.status === properties_constants_1.STATUS.sold || property.status === properties_constants_1.STATUS.pending) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Property is not available for offer');
    }
    if (property.seller.toString() === buyerId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You cannot make an offer on your own property');
    }
    const existing = yield offer_models_1.Offer.findOne({
        property: propertyId,
        buyer: buyerId,
        status: { $nin: offer_constants_1.CLOSED_OFFER_STATUSES },
    });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already have an active offer on this property');
    }
    const result = yield offer_models_1.Offer.create({
        property: propertyId,
        buyer: buyerId,
        seller: property.seller,
        status: offer_constants_1.OFFER_STATUS.pending,
        currentRound: 1,
        lastActionBy: 'buyer',
        currentTerms: terms,
        supportingDocuments: supportingDocuments || [],
        history: [
            Object.assign(Object.assign({}, terms), { status: offer_constants_1.OFFER_STATUS.pending, round: 1, madeBy: 'buyer', madeByUser: buyerId }),
        ],
    });
    yield properties_models_1.Property.findByIdAndUpdate(propertyId, { $inc: { totalOffers: 1 } });
    return result;
});
// Either party (whoever did NOT act last) submits a counter
const counterOffer = (offerId, userId, terms) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findById(offerId);
    if (!offer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    if (offer_constants_1.CLOSED_OFFER_STATUSES.includes(offer.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This offer is closed and can no longer be countered');
    }
    const isBuyer = offer.buyer.toString() === userId;
    const isSeller = offer.seller.toString() === userId;
    if (!isBuyer && !isSeller) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a party to this offer');
    }
    const actingAs = isBuyer ? 'buyer' : 'seller';
    // enforce turn-taking: you can't counter your own still-pending offer
    if (offer.lastActionBy === actingAs) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Waiting for the other party to respond before you can counter again');
    }
    const nextRound = offer.currentRound + 1;
    const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, {
        status: offer_constants_1.OFFER_STATUS.countered,
        currentRound: nextRound,
        lastActionBy: actingAs,
        currentTerms: terms,
        $push: {
            history: Object.assign(Object.assign({}, terms), { status: offer_constants_1.OFFER_STATUS.countered, round: nextRound, madeBy: actingAs, madeByUser: userId }),
        },
    }, { new: true, runValidators: true });
    return result;
});
const getAllOffers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const offerQuery = new QueryBuilder_1.default(offer_models_1.Offer.find().populate('property').populate('buyer').populate('seller'), query)
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield offerQuery.modelQuery;
    const meta = yield offerQuery.countTotal();
    return { data, meta };
});
const getMyOffers = (buyerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const offerQuery = new QueryBuilder_1.default(offer_models_1.Offer.find({ buyer: buyerId }).populate('property').populate('seller'), query)
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield offerQuery.modelQuery;
    const meta = yield offerQuery.countTotal();
    return { data, meta };
});
const getOfferStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const statusAgg = yield offer_models_1.Offer.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(statusAgg.map((s) => [s._id, s.count]));
    const totalOffers = statusAgg.reduce((sum, s) => sum + s.count, 0);
    return {
        totalOffers,
        pending: (countMap.get(offer_constants_1.OFFER_STATUS.pending) || 0) +
            (countMap.get(offer_constants_1.OFFER_STATUS.countered) || 0),
        accepted: countMap.get(offer_constants_1.OFFER_STATUS.accepted) || 0,
        rejected: countMap.get(offer_constants_1.OFFER_STATUS.rejected) || 0,
        withdrawn: countMap.get(offer_constants_1.OFFER_STATUS.withdrawn) || 0,
    };
});
// offers I (seller) have received
const getReceivedOffers = (sellerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const offerQuery = new QueryBuilder_1.default(offer_models_1.Offer.find({ seller: sellerId }).populate('property').populate('buyer'), query)
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield offerQuery.modelQuery;
    const meta = yield offerQuery.countTotal();
    return { data, meta };
});
const getOfferById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_models_1.Offer.findById(id)
        .populate('property')
        .populate('buyer')
        .populate('seller');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    return result;
});
// Edit — only allowed while the offer is still in its very first round
// and only by the buyer who created it (fixing a typo/mistake before anyone responds)
const updateOffer = (offerId, userId, terms) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findById(offerId);
    if (!offer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    if (offer.buyer.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only the buyer who made this offer can edit it');
    }
    if (offer.status !== offer_constants_1.OFFER_STATUS.pending || offer.currentRound !== 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This offer can no longer be edited — send a counter instead');
    }
    const updatedTerms = Object.assign(Object.assign({}, offer.currentTerms), terms);
    const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, {
        currentTerms: updatedTerms,
        'history.0': Object.assign(Object.assign({}, updatedTerms), { round: 1, madeBy: 'buyer', madeByUser: userId, createdAt: offer.history[0].createdAt }),
    }, { new: true, runValidators: true });
    return result;
});
const deleteOffer = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findById(offerId);
    if (!offer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    const isParty = offer.buyer.toString() === userId || offer.seller.toString() === userId;
    if (!isParty) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a party to this offer');
    }
    const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { isDeleted: true, status: offer_constants_1.OFFER_STATUS.withdrawn }, { new: true });
    yield properties_models_1.Property.findByIdAndUpdate(offer.property, { $inc: { totalOffers: -1 } });
    return result;
});
// Seller accepts the current terms on the table
const acceptOffer = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const offer = yield offer_models_1.Offer.findById(offerId)
            .populate('property')
            .populate('buyer')
            .populate('seller')
            .session(session);
        if (!offer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
        }
        if (offer_constants_1.CLOSED_OFFER_STATUSES.includes(offer.status)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This offer is already closed or on process');
        }
        yield properties_models_1.Property.findOneAndUpdate({ _id: offer.property._id }, { status: properties_constants_1.STATUS.under_contact }, { session });
        const offerAcceptedBy = ((_b = (_a = offer === null || offer === void 0 ? void 0 : offer.buyer) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) === userId ? 'buyer' : 'seller';
        // PDF generation happens outside the DB transaction (it's not a DB write),
        // but if it throws, the catch block below still aborts before any writes commit
        const [agreementMainDoc, propertyAgreementDoc] = yield Promise.all([
            (0, offer_utils_1.generateOfferPdf)(offer),
            (0, offer_utils_1.generatePropertyPdf)(offer),
        ]);
        const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { status: offer_constants_1.OFFER_STATUS.accepted, offerAcceptedBy }, { new: true, session });
        yield agreement_model_1.Agreement.create([
            {
                offer: offer._id,
                property: offer.property._id,
                buyer: offer.buyer._id,
                seller: offer.seller._id,
                agreementMainDoc,
                propertyAgreementDoc,
            },
        ], { session });
        // // const admin = await User.GetAdminUser();
        const buyer = offer === null || offer === void 0 ? void 0 : offer.buyer;
        const seller = offer === null || offer === void 0 ? void 0 : offer.seller;
        const property = offer === null || offer === void 0 ? void 0 : offer.property;
        const notificationPayload = {
            message: offerAcceptedBy === 'seller' ? `Your offer has been accepted by seller. Please add your authorized signer` : `Your offer has been accepted by buyer. Please add your authorized signer`,
            description: `The offer has been accepted by ${offerAcceptedBy === 'seller' ? "buyer" : "seller"} ${seller === null || seller === void 0 ? void 0 : seller.name} for the property  ${property === null || property === void 0 ? void 0 : property.streetAddress}, ${property === null || property === void 0 ? void 0 : property.city}, ${property === null || property === void 0 ? void 0 : property.state}, ${property === null || property === void 0 ? void 0 : property.zipCode}, ${property === null || property === void 0 ? void 0 : property.county}.`,
            userId: offerAcceptedBy === 'seller' ? (_c = buyer === null || buyer === void 0 ? void 0 : buyer._id) === null || _c === void 0 ? void 0 : _c.toString() : (_d = seller === null || seller === void 0 ? void 0 : seller._id) === null || _d === void 0 ? void 0 : _d.toString(),
            fcmToken: offerAcceptedBy === 'seller' ? buyer === null || buyer === void 0 ? void 0 : buyer.fcmToken : seller === null || seller === void 0 ? void 0 : seller.fcmToken,
            link: offerAcceptedBy === 'seller' ? `/review-sent-offer?offer=${offer === null || offer === void 0 ? void 0 : offer._id}` : `/user/offers-received/${offer === null || offer === void 0 ? void 0 : offer._id}`,
        };
        (0, notification_utils_1.sendNotificationMessage)(notificationPayload);
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// Either party rejects the current terms on the table, closing the thread
const rejectOffer = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findById(offerId);
    if (!offer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    const isBuyer = offer.buyer.toString() === userId;
    const isSeller = offer.seller.toString() === userId;
    if (!isBuyer && !isSeller) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a party to this offer');
    }
    if (offer_constants_1.CLOSED_OFFER_STATUSES.includes(offer.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This offer is already closed');
    }
    const actingAs = isBuyer ? 'buyer' : 'seller';
    // you can only reject terms the OTHER party proposed —
    // rejecting your own pending offer is a withdrawal, not a rejection
    if (offer.lastActionBy === actingAs) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You cannot reject your own pending offer — withdraw it instead');
    }
    const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { status: offer_constants_1.OFFER_STATUS.rejected }, { new: true });
    return result;
});
// The party who currently has an offer on the table pulls it back —
// only allowed while the offer is still pending (i.e. no counter has been made yet)
const withdrawOffer = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findById(offerId);
    if (!offer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Offer not found');
    }
    const isBuyer = offer.buyer.toString() === userId;
    const isSeller = offer.seller.toString() === userId;
    if (!isBuyer && !isSeller) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a party to this offer');
    }
    if (offer.status !== offer_constants_1.OFFER_STATUS.pending) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Only a pending offer can be withdrawn');
    }
    const actingAs = isBuyer ? 'buyer' : 'seller';
    // you can only withdraw terms YOU proposed
    if (offer.lastActionBy !== actingAs) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You can only withdraw your own offer');
    }
    const result = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { status: offer_constants_1.OFFER_STATUS.withdrawn }, { new: true });
    return result;
});
exports.offerService = {
    createOffer,
    counterOffer,
    getAllOffers,
    getMyOffers,
    getReceivedOffers,
    getOfferById,
    updateOffer,
    deleteOffer,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
    getOfferStats
};
