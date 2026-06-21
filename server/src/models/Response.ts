import mongoose, { Document, Schema } from 'mongoose';

export interface IResponse extends Document {
  formId: mongoose.Types.ObjectId;
  answers: Record<string, any>;
  respondentEmail?: string;
  createdAt: Date;
}

const responseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  respondentEmail: { type: String }
}, { timestamps: true });

export default mongoose.model<IResponse>('Response', responseSchema);
