import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import mysqlpool from '../config/db';
import { RowDataPacket, FieldPacket } from 'mysql2';
import { CustomRequest } from '../middlewares/auth';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage }).array('files', 10);

export const uploadImage = (req: CustomRequest, res: Response) => {
    upload(req, res, async (err: any) => {
        if (err) {
            console.error('Error uploading files:', err);
            return res.status(400).send({ message: 'File upload failed', error: err });
        }

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).send({ message: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const id = req.user?.id;

        if (!id) {
            return res.status(400).send({ message: 'Invalid user ID' });
        }

        const imgPaths = files.map(file => file.filename);

        try {
            const values = imgPaths.map(path => [id, path]);
            const query = 'INSERT INTO images (uid, files) VALUES ?';
            await mysqlpool.query(query, [values]);

            return res.status(200).send({ message: 'Files uploaded successfully', files: req.files });
        } catch (error) {
            files.forEach(file => fs.unlinkSync(path.join(__dirname, '../../uploads/', file.filename)));
            console.error('Error uploading images to database:', error);
            return res.status(500).send({ message: 'Database error', error });
        }
    });
};

export const getImages = async (req: CustomRequest, res: Response) => {
    const id = req.user?.id; 
    if (!id) {
        return res.status(400).send({ message: 'Invalid user ID' });
    }

    try {
        const [images]: [RowDataPacket[], FieldPacket[]] = await mysqlpool.execute('SELECT files FROM images WHERE uid = ?', [id]);

        if (images.length === 0) {
            return res.status(404).send({ message: 'No images found for this user' });
        }

        const imageUrls = images.map((image: RowDataPacket) => {
            return `${req.protocol}://${req.get('host')}/uploads/${image.files}`;
        });

        return res.status(200).send({ images: imageUrls });
    } catch (error) {
        console.error('Error fetching images from database:', error);
        return res.status(500).send({ message: 'Database error', error });
    }
};

const imageController = {
    uploadImage,
    getImages
};

export default imageController;
