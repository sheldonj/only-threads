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

type CourseStartedEmailProps = {
  readonly courseTitle: string;
  readonly courseUrl: string;
  readonly username: string;
};

export const CourseStartedEmail = ({
  courseTitle,
  courseUrl,
  username,
}: CourseStartedEmailProps) => {
  const previewText = `You've started ${courseTitle}!`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              You&apos;ve started <strong>{courseTitle}</strong>!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Congratulations on taking the first step! You&apos;ve started
              learning <strong>{courseTitle}</strong>. Keep up the momentum and
              continue making progress.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Consistency is key to learning. Try to set aside some time each
              day to work through the lessons.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={courseUrl}
              >
                Continue Learning
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{' '}
              <Link
                className="text-blue-600 no-underline"
                href={courseUrl}
              >
                {courseUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              You&apos;re receiving this email because you started a course on
              our platform. Keep learning and unlock your potential!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactCourseStartedEmail(props: CourseStartedEmailProps) {
  return <CourseStartedEmail {...props} />;
}



