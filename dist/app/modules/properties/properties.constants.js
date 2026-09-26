"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROPERTY_STATUS = exports.STATUS_OPTIONS = exports.STATUS = exports.propertySearchableFields = exports.BASIC_INFO_CONFIG = exports.PARKING_OPTIONS = exports.FOUNDATION_OPTIONS = exports.SEWER_OPTIONS = exports.WATER_OPTIONS = exports.WATER_HEATING_OPTIONS = exports.COOLING_OPTIONS = exports.HEATING_OPTIONS = exports.ROOF_OPTIONS = exports.USE_TYPE_OPTIONS = exports.CLOSING_DATE_OPTIONS = exports.HOA_FREQUENCY = exports.HOA_OPTIONS = exports.OWNERSHIP_TYPES = exports.PROPERTY_TYPES = void 0;
exports.PROPERTY_TYPES = [
    'Residential',
    'Multi-Family',
    'Commercial',
    'Land',
];
exports.OWNERSHIP_TYPES = ['own', 'assignable'];
exports.HOA_OPTIONS = ['yes', 'no'];
exports.HOA_FREQUENCY = ['Monthly', 'Quarterly', 'Annually'];
exports.CLOSING_DATE_OPTIONS = ['ASAP', 'Specific'];
exports.USE_TYPE_OPTIONS = ['Medical', 'Others'];
exports.ROOF_OPTIONS = ['Shingle', 'Slate', 'Tile', 'Membrane', 'Other'];
exports.HEATING_OPTIONS = ['Gas', 'Electric', 'None', 'Other'];
exports.COOLING_OPTIONS = ['Central A/C', 'Window units', 'None', 'Other'];
exports.WATER_HEATING_OPTIONS = ['Public', 'Cistern', 'Well', 'None', 'Other'];
exports.WATER_OPTIONS = ['Public', 'Cistern', 'Well', 'None', 'Other'];
exports.SEWER_OPTIONS = ['Public', 'Septic', 'Aerobic', 'None', 'Other'];
exports.FOUNDATION_OPTIONS = ['Block', 'Poured', 'Slab', 'Stone', 'Other'];
exports.PARKING_OPTIONS = ['Driveway', 'On street', 'Carport', 'Assigned', 'None', 'Other'];
// Mirrors the frontend BASIC_INFO_CONFIG — keep in sync
exports.BASIC_INFO_CONFIG = {
    Residential: { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    'Multi-Family': { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    Commercial: { showParcelId: true, showBuyItNowPrice: false, showUtilities: false },
    Land: { showParcelId: true, showBuyItNowPrice: false, showUtilities: true },
};
exports.propertySearchableFields = [
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'county',
];
exports.STATUS = {
    pending: "Pending",
    active: "Active",
    under_contact: "Under Contract",
    sold: "Sold",
    rejected: "Rejected"
};
exports.STATUS_OPTIONS = [
    exports.STATUS.pending,
    exports.STATUS.active,
    exports.STATUS.sold,
    exports.STATUS.under_contact,
    exports.STATUS.rejected
];
exports.PROPERTY_STATUS = Object.keys(exports.STATUS);
