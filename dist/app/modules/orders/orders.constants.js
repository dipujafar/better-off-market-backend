"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPPING_STEPS = exports.shippingSteps = exports.ORDER_DISPLAY_STATUS = exports.orderDisplayStatus = exports.ORDER_STATUS = exports.orderStatus = void 0;
exports.orderStatus = {
    on_progress: 'on_progress',
    completed: 'completed',
    canceled: 'canceled',
};
exports.ORDER_STATUS = [
    exports.orderStatus.on_progress,
    exports.orderStatus.completed,
    exports.orderStatus.canceled,
];
exports.orderDisplayStatus = {
    on_progress: 'On Progress',
    payment_request: 'Payment Request',
    reject_payment_request: 'Reject Payment Request',
    in_transit: 'In Transit',
    in_warehouse: 'In Warehouse',
    ready_to_collect: 'Ready To Collect',
    completed: 'Completed',
};
exports.ORDER_DISPLAY_STATUS = [
    exports.orderDisplayStatus.on_progress,
    exports.orderDisplayStatus.payment_request,
    exports.orderDisplayStatus.reject_payment_request,
    exports.orderDisplayStatus.in_transit,
    exports.orderDisplayStatus.in_warehouse,
    exports.orderDisplayStatus.ready_to_collect,
    exports.orderDisplayStatus.completed,
];
exports.shippingSteps = {
    payment_receive: 'Payment Receive',
    purchased_in_UAE: 'Purchased in UAE',
    in_dubai_warehouse: 'In Warehouse',
    shipped_to_libya: 'Shipped to Libya',
    in_libya_warehouse: 'In Libya Warehouse',
    payment_75_received: 'Payment 75% Received',
    arrived_item_image: 'Arrived Item Image',
    ready_to_collect: 'Ready To Collect',
    completed: 'Completed',
};
exports.SHIPPING_STEPS = [
    exports.shippingSteps.payment_receive,
    exports.shippingSteps.purchased_in_UAE,
    exports.shippingSteps.in_dubai_warehouse,
    exports.shippingSteps.shipped_to_libya,
    exports.shippingSteps.in_libya_warehouse,
    exports.shippingSteps.payment_75_received,
    exports.shippingSteps.arrived_item_image,
    exports.shippingSteps.ready_to_collect,
    exports.shippingSteps.completed,
];
