import mongoose, { Document, Schema } from 'mongoose';

export interface IFormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    customError?: string;
  };
}

export interface IForm extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  themeColor?: string;
  requireGoogleSignIn: boolean;
  views: number;
  fields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  validation: {
    pattern: { type: String },
    minLength: { type: Number },
    maxLength: { type: Number },
    customError: { type: String }
  }
}, { _id: false });

const formSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  themeColor: { type: String, default: 'indigo' },
  requireGoogleSignIn: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  fields: [formFieldSchema],
}, { timestamps: true });

export default mongoose.model<IForm>('Form', formSchema);
