import { Request, Response } from "express";
import mongoose from "mongoose";
import { generateToken } from "../../jwt/jwt";
import { UserModel } from "../../models/auth.model";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const { email } = userData;
    const userExists = await UserModel.findOne({ email });
    const token = generateToken(email);

    if (userExists) {
      return res.status(200).send({ message: token });
    }
    const addUser = await UserModel.create(userData);
    const userId = addUser?._id;
    if (addUser) {
      res.status(200).send({
        message: token,
        token,
        userId,
        email,
      });
    } else {
      res.status(400).send({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    if (users.length > 0) {
      res.status(200).send({ users });
    } else {
      res.status(404).send({ message: "Users not found!" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user) {
      res.status(200).send({ user });
    }
  } catch (error) {
    console.error(error);
    res.status(404).send({ Error: "Users not found!" });
  }
};

export const updateUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const updatedFields = req.body;
    Object.assign(user, updatedFields);
    await user.save();

    if (user) {
      res.status(200).send({ message: `${email} User's data updated` });
    }
  } catch (error) {
    console.error(error);
    res.status(404).send({ Error: "Users not found!" });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res
      .status(200)
      .send({ message: `User with ID ${id} was successfully deleted` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
