import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

type RefundRequestCancelledEmailProps = {
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerName: string;
};

export const RefundRequestCancelledEmail = ({
  amount,
  courseTitle,
  customerName,
}: RefundRequestCancelledEmailProps) => {
  const previewText = `Your refund request for ${courseTitle} has been cancelled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Refund Request Cancelled
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              This email confirms that you&apos;ve cancelled your refund request
              for <strong>{courseTitle}</strong>.
            </Text>
            <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Cancelled Request Details</strong>
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Course: {courseTitle}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Amount: {amount}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Status: Cancelled by you
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              You still have full access to the course content. If you change
              your mind, you can submit a new refund request at any time from your
              purchases page.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/learn`}
              >
                Continue Learning
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from Learn Something. If you did
              not cancel this request, please contact us immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactRefundRequestCancelledEmail(
  props: RefundRequestCancelledEmailProps,
) {
  return <RefundRequestCancelledEmail {...props} />;
}

