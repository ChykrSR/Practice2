const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      required: true,
      default:'Pending'
    },
    createdAt: {
        type:Date,
        default:null
    },
    deleted_at: {
      type: Date,
      default: null, // ถ้ายังไม่ลบจะเป็น null (สำหรับทำ Soft Delete)
    },
  },
  {
    timestamps: true, // จะสร้าง createdAt และ updatedAt ให้อัตโนมัติ
  }
);

module.exports = mongoose.model('Task', userSchema);
