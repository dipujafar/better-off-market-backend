"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISPLAY_STATUS = exports.displayStatus = exports.statusEnum = exports.status = void 0;
exports.status = {
    request: 'request',
    quotation: 'quotation',
    accepted: 'accepted',
    rejected: 'rejected',
};
exports.statusEnum = [
    exports.status.request,
    exports.status.quotation,
    exports.status.accepted,
    exports.status.rejected,
];
exports.displayStatus = {
    requested: 'Under Review',
    received_quotation: 'Received Quotation',
    rejected_quotation: 'Rejected Quotation',
    payment_request: 'Payment Request',
    reject_payment_request: 'Reject Payment Request',
    on_progress: 'On Progress',
    rejected: 'Rejected',
    completed: 'Completed',
};
exports.DISPLAY_STATUS = [
    exports.displayStatus.requested,
    exports.displayStatus.received_quotation,
    exports.displayStatus.rejected_quotation,
    exports.displayStatus.payment_request,
    exports.displayStatus.reject_payment_request,
    exports.displayStatus.on_progress,
    exports.displayStatus.rejected,
    exports.displayStatus.completed,
];
