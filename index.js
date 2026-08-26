const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();
const Task = require('./Model/Task');

const app = express();
app.use(express.json());

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI) // URL ของ MONGODB
        .then(() => console.log('mongodb successfully connected!'))
        .catch((err) => console.error(err));

// --- ROUTES ---

// CREATE Route: เพิ่มผู้ใช้ใหม่
app.post('/create', async (req, res) => {
  const { title, description} = req.body;

  try {
    const newUser = await Task.create({
      title,
      description,
      createdAt: Date.now()
    });

    return res.status(201).json({
      message: 'New task successfully created!',
      user: newUser,
    });
  } catch (err) {
    console.error('Error while inserting a user into the database', err);
    return res.status(400).json({ error: err.message });
  }
});

// READ Route: ดึงเฉพาะผู้ใช้ที่ยังไม่ถูก Soft Delete
app.get('/show_task', async (req, res) => {
  try {
    // กรองเอาเฉพาะรายการที่ deleted_at เป็น null
    const users = await Task.find({ deleted_at: null });
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// READ Single User Route: ดึงผู้ใช้รายบุคคลด้วย email
app.get('/show_task/single/:title', async (req, res) => {
  const { title } = req.params;

  try {
    // หาผู้ใช้ตาม email และต้องยังไม่ถูกลบ
    const user = await Task.findOne({ title, deleted_at: null });

    if (!user) {
      return res.status(404).json({ message: 'User not found or deleted' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE Route: อัปเดตรหัสผ่าน (เฉพาะบัญชีที่ยังไม่ถูกลบ)
app.patch('/update_task/:title', async (req, res) => {
  const { title } = req.params;
  const {new_status} = req.body;

  try {
    const updatedUser = await Task.findOneAndUpdate(
      { title : title, deleted_at: null }, // เงื่อนไขการค้นหา
      { status: new_status },   // ข้อมูลที่จะอัปเดต
      { new: true }                // คืนค่าข้อมูลใหม่หลังอัปเดต
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found or deleted' });
    }

    return res.status(200).json({
      message: 'User password updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SOFT DELETE Route: เปลี่ยนเป็นการใส่วันที่ปัจจุบันลงใน deleted_at
app.delete('/delete_task/:title', async (req, res) => {
  const { title } = req.params;

  try {
    const deletedUser = await Task.findOneAndUpdate(
      { title: title, deleted_at: null },      // กรองเฉพาะบัญชีที่ยังใช้งานอยู่
      { deleted_at: new Date() },       // ใส่เวลาปัจจุบันแทน NOW() ของ SQL
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: 'No active user found with that email!' });
    }

    return res.status(200).json({ message: 'User soft-deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
