import config from "../../config";
import { sendEmail } from "../../utils/mailSender";
import GetInTouch from "../getInTouch/getInTouch.models";
import { IProperty } from "./properties.interface";
import path from "path";
import fs from "fs";

export interface PropertySearchQuery {
    county?: string | string[];
    propertyType?: string | string[];
    status?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'newest' | 'oldest' | 'lowest' | 'highest';
    lat?: string;
    lng?: string;
    page?: string;
    limit?: string;
    searchTerm?: string;
}

export const toArray = (value?: string | string[]): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',').map((v) => v.trim()).filter(Boolean);
};

export const propertyAddress = (
    streetAddress?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    county?: string
) => {

    return [streetAddress, city, state, zipCode, county]
        .filter(Boolean)
        .join(", ");
};


const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return entities[character];
    });

export const notifyGetInTouchSubscribers = async (property: IProperty, sellerName: string) => {
    const subscribers = await GetInTouch.find({
        counties: property.county,
        propertyTypes: property.propertyType,
    }).select('email');

    if (!subscribers.length) {
        return;
    }

    const templatePath = path.join(__dirname, '../../../../public/view/subscription_area.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const replacements: Record<string, string> = {
        userName: 'there',
        propertyAddress: propertyAddress(
            property.streetAddress,
            property.city,
            property.state,
            property.zipCode,
            property.county,
        ),
        sellerName,
        buyerName: 'Not applicable',
        propertyUrl: `${config.client_Url}/properties-list/${property._id}`,
        year: new Date().getFullYear().toString(),
    };

    const html = Object.entries(replacements).reduce(
        (content, [placeholder, value]) =>
            content.replace(`{{${placeholder}}}`, escapeHtml(value)),
        template,
    );

    const emailResults = await Promise.allSettled(
        subscribers.map((subscriber) =>
            sendEmail(subscriber.email, 'New Listing in Your Subscription Area', html),
        ),
    );

    emailResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(
                `Failed to notify GetInTouch subscriber ${subscribers[index].email}:`,
                result.reason,
            );
        }
    });
};