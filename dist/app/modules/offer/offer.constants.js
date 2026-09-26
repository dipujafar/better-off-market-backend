"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOSED_OFFER_STATUSES = exports.OFFER_STATUS_OPTIONS = exports.OFFER_STATUS = exports.MADE_BY = exports.PAID_BY = exports.YES_NO = exports.POSSESSION_OPTIONS = exports.CLOSING_COST_OPTIONS = exports.FINANCING_TYPES = void 0;
exports.FINANCING_TYPES = ['cash', 'hard_money', 'conventional', 'other'];
exports.CLOSING_COST_OPTIONS = ['none', 'requested'];
exports.POSSESSION_OPTIONS = ['at_closing', 'post_closing'];
exports.YES_NO = ['yes', 'no'];
exports.PAID_BY = ['buyer', 'seller'];
exports.MADE_BY = ['buyer', 'seller'];
exports.OFFER_STATUS = {
    pending: 'pending',
    countered: 'countered',
    accepted: 'accepted',
    rejected: 'rejected',
    withdrawn: 'withdrawn',
};
exports.OFFER_STATUS_OPTIONS = Object.values(exports.OFFER_STATUS);
// statuses that mean the thread is closed — no further offers/counters allowed
exports.CLOSED_OFFER_STATUSES = [
    exports.OFFER_STATUS.accepted,
    exports.OFFER_STATUS.rejected,
    exports.OFFER_STATUS.withdrawn,
];
