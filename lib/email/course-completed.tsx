import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

type CourseCompletedEmailProps = {
  readonly courseTitle: string;
  readonly libraryUrl: string;
  readonly username: string;
};

export const CourseCompletedEmail = ({
  courseTitle,
  libraryUrl,
  username,
}: CourseCompletedEmailProps) => {
  const previewText = `Congratulations! You've completed ${courseTitle}!`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              🎉 Congratulations!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Amazing work! You&apos;ve successfully completed{' '}
              <strong>{courseTitle}</strong>. This is a fantastic achievement
              and a testament to your dedication to learning.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Take a moment to celebrate your accomplishment. You&apos;ve put in
              the effort and made it to the finish line!
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={libraryUrl}
              >
                Explore More Courses
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Ready for your next learning adventure? Check out your library:{' '}
              <Link
                className="text-blue-600 no-underline"
                href={libraryUrl}
              >
                {libraryUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              You&apos;re receiving this email because you completed a course on
              our platform. Keep up the great work!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactCourseCompletedEmail(props: CourseCompletedEmailProps) {
  return <CourseCompletedEmail {...props} />;
}



