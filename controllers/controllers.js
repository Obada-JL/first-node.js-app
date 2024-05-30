const Course = require("../models/course.model");
const { body, validationResult } = require("express-validator");
const getLessons = async (req, res) => {
  const query = req.query;
  const limit = query.limit || 2;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find().limit(limit).skip(skip);
  res.json(courses);
};
const getLesson = async (req, res) => {
  // const lessonId = req.params.lessonName;
  // const lesson = lessonsArray.find(
  //   (lesson) => lesson.lessonName === lessonId
  // );
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    console.log(course);
    return res.json({ msg: "course not found" });
  } else {
    res.json(course);
  }
};
const postLesson = async (req, res) => {
  // (req, res) => {
  //   console.log(req);
  //   const errors = validationResult(req);
  //   console.log(errors);
  //   if (!errors.isEmpty()) {
  //     return res.status(404).json(errors.array());
  //   }
  //   lessonsArray.push({ ...req.body });
  //   res.json(lessonsArray);
  // };
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors.array());
  }

  const newCourse = new Course(req.body);

  await newCourse.save();
  res.status(201).json(newCourse);
};
const editLesson = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(courseId, {
      $set: { ...req.body },
    });
    console.log(updatedCourse);
    return res.status(200).json(updatedCourse);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  // if (!lesson) {
  //   return res.status(404).json({ msg: "lesson not found" });
  // }
  // lesson = { ...lesson, ...req.body };
};
const deleteLesson = async (req, res) => {
  const response = await Course.deleteOne({ _id: req.params.courseId });
  res.status(200).json({ success: true, msg: response });
};
module.exports = {
  getLessons,
  getLesson,
  postLesson,
  editLesson,
  deleteLesson,
};
