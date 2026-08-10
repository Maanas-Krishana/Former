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
  description?: string;
  logoUrl?: string;
  themeColor?: string;
  formStyle?: 'normal' | 'funky';
  requireGoogleSignIn: boolean;
  published: boolean;
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
  description: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: 'indigo' },
  formStyle: { type: String, enum: ['normal', 'funky'], default: 'normal' },
  requireGoogleSignIn: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  fields: [formFieldSchema],
}, { timestamps: true });

export default mongoose.model<IForm>('Form', formSchema);
