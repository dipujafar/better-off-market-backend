import { sendEmail } from "../../utils/mailSender";
import { USER_ROLE } from "../user/user.constants";
import { User } from "../user/user.models";
import { IContactUs } from "./contactUs.interface";
import fs from 'fs';
import path from 'path';

const contactUs = async (payload: IContactUs) => {
    const admin = await User.findOne({ role: USER_ROLE.admin });

    if (!admin) {
        throw new Error('Something went wrong. Please try again.');
    }

    const contactEmailPath = path.join(
        __dirname,
        '../../../../public/view/contact_us.html',
    );


    await sendEmail(
        admin?.email as string,
        'Received a support email from contact us section',
        fs
            .readFileSync(contactEmailPath, 'utf8')
            .replace('{{userName}}', admin?.name)
            .replace('{{fullName}}', payload.name)
            .replace('{{email}}', payload?.email)
            .replace('{{subject}}', payload?.subject)
            .replace('{{message}}', payload?.message)
            .replace('{{year}}', new Date().getFullYear().toString()),
    );

}


export const contactUsService = {
    contactUs
}