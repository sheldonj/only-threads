import {
  Body,
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

type RefundRequestRejectedEmailProps = {
  readonly adminNote?: string;
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerName: string;
};

export const RefundRequestRejectedEmail = ({
  adminNote,
  amount,
  courseTitle,
  customerName,
}: RefundRequestRejectedEmailProps) => {
  const previewText = `Update on your refund request for ${courseTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Refund Request Update
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We&apos;ve reviewed your refund request for{' '}
              <strong>{courseTitle}</strong>. Unfortunately, we&apos;re unable to
              approve this request at this time.
            </Text>
            <Section className="bg-[#fef2f2] border border-solid border-[#fecaca] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] m-0">
                Request Not Approved
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[24px] m-0">
                {courseTitle} - {amount}
              </Text>
            </Section>
            {adminNote && (
              <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Note from our team:</strong>
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  {adminNote}
                </Text>
              </Section>
            )}
            <Text className="text-black text-[14px] leading-[24px]">
              You continue to have full access to the course content. If you
              believe this decision was made in error or have additional
              information to share, please reply to this email or contact our
              support team.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We&apos;re here to help you get the most out of your learning
              experience. If you&apos;re having trouble with the course content,
              we&apos;d be happy to assist.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from Learn Something. If you have
              questions about this decision, please{' '}
              <Link
                className="text-blue-600 no-underline"
                href="mailto:support@learnsomething.com"
              >
                contact our support team
              </Link>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactRefundRequestRejectedEmail(
  props: RefundRequestRejectedEmailProps,
) {
  return <RefundRequestRejectedEmail {...props} />;
}

