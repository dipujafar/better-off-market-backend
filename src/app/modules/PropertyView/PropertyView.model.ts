import { Schema, model, Types } from 'mongoose';

export interface IPropertyView {
    property: Types.ObjectId;
    seller: Types.ObjectId;
    viewedAt: Date;
}

const propertyViewSchema = new Schema<IPropertyView>({
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now },
});

// speeds up the weekly aggregation query in step 4
propertyViewSchema.index({ seller: 1, viewedAt: 1 });

export const PropertyView = model<IPropertyView>(
    'PropertyView',
    propertyViewSchema,
);