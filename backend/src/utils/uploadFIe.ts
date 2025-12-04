import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/upload')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) { 
    cb(null, true)
  } else {
    cb(new Error('Hanya bisa upload foto'), false)
  }
}

export const upload = multer({storage, fileFilter});