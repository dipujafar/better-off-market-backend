import { uploadToS3 } from '../../utils/s3';

const sanitizeFileName = (name: string): string => {
    const lastDot = name.lastIndexOf('.');
    const base = lastDot > 0 ? name.slice(0, lastDot) : name;
    const ext = lastDot > 0 ? name.slice(lastDot) : '';

    const cleanBase = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${cleanBase}${ext}`;
};

const uploadFiles = async (files: Express.Multer.File[]) => {
    const uploaded = await Promise.all(
        files.map(async (file) => {
            const url = await uploadToS3({
                file,
                fileName: `chat/${Date.now()}-${sanitizeFileName(file.originalname)}`,
            });

            return { url };
        }),
    );

    return uploaded;
};

export const uploadService = { uploadFiles };