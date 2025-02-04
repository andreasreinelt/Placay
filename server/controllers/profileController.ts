import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import path from "path";
import { User } from "../models/userModel"; 

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { name, email, password } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageFile = req.files.profileImage as UploadedFile;
    
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const fileName = `${Date.now()}_${imageFile.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    imageFile.mv(filePath, async (err: any) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ message: "File upload failed" });
      }

      if (user.profileImage && user.profileImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), user.profileImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          }
        });
      }

      user.profileImage = `/uploads/${fileName}`;
      await user.save();

      res.status(200).json({ message: "Profile image updated", profileImage: user.profileImage });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. So sorry" });
  }
};