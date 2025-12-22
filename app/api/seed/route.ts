import { auth } from '@/lib/auth/server';
import { db } from '@/lib/database/client';
import { NextResponse } from 'next/server';

const TEST_USERS = [
  {
    email: 'user@test.com',
    name: 'Test User',
    password: 'password123',
    role: null,
  },
  {
    email: 'admin@test.com',
    name: 'Admin User',
    password: 'password123',
    role: 'admin',
  },
];

const TEST_COURSES = [
  {
    description:
      'Learn the fundamentals of JavaScript programming, from variables and functions to DOM manipulation.',
    lessons: [
      {
        description: 'Understanding let, const, and primitive types',
        order: 1,
        title: 'Variables and Data Types',
      },
      {
        description: 'Creating and using functions effectively',
        order: 2,
        title: 'Functions and Scope',
      },
      {
        description: 'Interacting with web pages using JavaScript',
        order: 3,
        title: 'DOM Manipulation',
      },
    ],
    price: 2_999, // $29.99
    published: true,
    slug: 'intro-to-javascript',
    title: 'Introduction to JavaScript',
  },
  {
    description:
      'Master React.js from the ground up. Learn components, hooks, and state management.',
    lessons: [
      {
        description: 'Building your first React components',
        order: 1,
        title: 'Components and JSX',
      },
      {
        description: 'Managing data flow in React applications',
        order: 2,
        title: 'State and Props',
      },
      {
        description: 'useState, useEffect, and custom hooks',
        order: 3,
        title: 'Hooks Deep Dive',
      },
    ],
    price: 4_999, // $49.99
    published: true,
    slug: 'react-fundamentals',
    title: 'React Fundamentals',
  },
  {
    description:
      'Create robust REST APIs using Node.js and Express. Covers authentication, databases, and deployment.',
    lessons: [
      {
        description: 'Setting up routes and middleware',
        order: 1,
        title: 'Express.js Basics',
      },
      {
        description: 'Connecting to databases and creating models',
        order: 2,
        title: 'Database Integration',
      },
    ],
    price: 3_999, // $39.99
    published: true,
    slug: 'nodejs-apis',
    title: 'Building APIs with Node.js',
  },
];

export async function POST() {
  try {
    const results = {
      courses: [] as string[],
      users: [] as string[],
    };

    // Create test users
    for (const userData of TEST_USERS) {
      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: { email: userData.email },
      });

      if (existingUser) {
        results.users.push(`${userData.email} (already exists)`);
        continue;
      }

      // Create user via better-auth API
      const { user } = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          name: userData.name,
          password: userData.password,
        },
      });

      // Update role if admin
      if (userData.role && user) {
        await db.user.update({
          data: { role: userData.role },
          where: { id: user.id },
        });
      }

      results.users.push(userData.email);
    }

    // Create test courses
    for (const courseData of TEST_COURSES) {
      // Check if course already exists
      const existingCourse = await db.course.findFirst({
        where: { slug: courseData.slug },
      });

      if (existingCourse) {
        results.courses.push(`${courseData.title} (already exists)`);
        continue;
      }

      // Create course
      const course = await db.course.create({
        data: {
          description: courseData.description,
          price: courseData.price,
          published: courseData.published,
          slug: courseData.slug,
          title: courseData.title,
        },
      });

      // Create lessons for this course
      for (const lessonData of courseData.lessons) {
        await db.lesson.create({
          data: {
            courseId: course.id,
            description: lessonData.description,
            order: lessonData.order,
            title: lessonData.title,
          },
        });
      }

      results.courses.push(courseData.title);
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      results,
      success: true,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to seed database',
        success: false,
      },
      { status: 500 },
    );
  }
}



